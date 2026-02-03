'use server';

import bcrypt from 'bcryptjs'; 
import { cookies } from 'next/headers';
import { db } from './lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- LOGIN ---
export async function loginAdmin(formData) {
  const usuarioInput = formData.get('usuario')?.trim();
  const passwordInput = formData.get('password')?.trim();

  try {
    // 1. Buscar al administrador por su nombre de usuario
    const res = await db.query('SELECT * FROM admins WHERE usuario = $1', [usuarioInput]);
    
    if (res.rows.length === 0) {
      return { error: "Credenciales incorrectas" };
    }

    const admin = res.rows[0];

    // 2. Verificar la contraseña (asumiendo que usas bcrypt para guardarlas)
    const esValida = await bcrypt.compare(passwordInput, admin.password_hash);
    
    if (!esValida) {
      return { error: "Credenciales incorrectas" };
    }

    // 3. Crear la cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'active_token', { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'lax', 
      path: '/', 
      maxAge: 60 * 60 * 24 // 24 horas
    });

  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error de conexión con el servidor" };
  }

  // 4. Redirigir fuera del try-catch para evitar errores de Next.js
  redirect('/admin');
}

export async function cambiarPasswordSeguro(oldPass, newPass) {
  try {
    const cookieStore = await cookies();
    // Aquí iría tu lógica para verificar la sesión y actualizar en DB
    // Ejemplo rápido:
    const res = await db.query('SELECT * FROM admins LIMIT 1');
    const admin = res.rows[0];

    const esValida = await bcrypt.compare(oldPass, admin.password_hash);
    if (!esValida) return { success: false, error: "La clave actual es incorrecta" };

    const nuevoHash = await bcrypt.hash(newPass, 10);
    await db.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [nuevoHash, admin.id]);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al cambiar la contraseña" };
  }
}

// --- LOGOUT ---
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}

// --- REGISTRO CON TODAS LAS RESTRICCIONES ---
export async function registrarUsuario(formData, fileUrls = []) {
  try {
    // 1. Extraer datos básicos para validación rápida
    const correo = formData.get('correo');
    const numeroIdentificacion = formData.get('numeroidentificacion');

    // Validación de dominio de correo
    if (!correo || !correo.endsWith('@universidadmayor.edu.co')) {
      return { 
        success: false, 
        error: "Seguridad: Solo se permiten correos institucionales de @universidadmayor.edu.co" 
      };
    }

    // --- VALIDACIÓN DE EXISTENCIA PREVIA (Rápida) ---
    // Usamos SELECT 1 para que la base de datos solo confirme la existencia sin cargar datos pesados
    const usuarioExistente = await db.query(
      'SELECT 1 FROM personas WHERE correo = $1 OR numeroidentificacion = $2 LIMIT 1',
      [correo, numeroIdentificacion]
    );

    if (usuarioExistente.rows.length > 0) {
      return { 
        success: false, 
        error: "Ya existe un registro con este número de identificación o correo electrónico." 
      };
    }
    // ------------------------------------------------

    // 2. Validar límite de archivos
    if (fileUrls.length !== 4) {
      return { success: false, error: "Seguridad: Se requieren exactamente 4 archivos." };
    }

    // Normalización de fechas
    const fnac = new Date(formData.get('fechanacimiento') + 'T00:00:00');
    const fexp = new Date(formData.get('fechaexpedicion') + 'T00:00:00');
    const hoy = new Date();

    // Calcular edad al momento de expedir
    let edadAlExpedir = fexp.getFullYear() - fnac.getFullYear();
    const m = fexp.getMonth() - fnac.getMonth();
    if (m < 0 || (m === 0 && fexp.getDate() < fnac.getDate())) {
        edadAlExpedir--;
    }

    if (edadAlExpedir !== 18) {
      return { 
        success: false, 
        error: "La fecha de expedición es inválida. Debe corresponder al periodo en que cumplió 18 años." 
      };
    }

    if (fexp > hoy) {
      return { success: false, error: "La fecha de expedición no puede ser futura." };
    }

    // 3. Insertar Persona
    const res = await db.query(`
      INSERT INTO personas (
        nombre, segundonombre, apellido, segundoapellido, genero, telefono, correo, 
        tipoidentificacion, numeroidentificacion, fechanacimiento, fechaexpedicion, 
        direccion, municipio, eps, tiposangre, factorrh, contactoemergencia, contactotelefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id;
    `, [
      formData.get('nombre'), formData.get('segundonombre') || '',
      formData.get('apellido'), formData.get('segundoapellido') || '',
      formData.get('genero'), formData.get('telefono'), correo,
      formData.get('tipoidentificacion'), numeroIdentificacion,
      formData.get('fechanacimiento'), formData.get('fechaexpedicion'),
      formData.get('direccion'), formData.get('municipio'), formData.get('eps'),
      formData.get('tiposangre'), formData.get('factorrh'),
      formData.get('contactoemergencia'), formData.get('contactotelefono')
    ]);

    const personaId = res.rows[0].id;

    // 4. Insertar Documentos
    for (const file of fileUrls) {
      await db.query('INSERT INTO documentos (personaid, nombrearchivo, ruta) VALUES ($1, $2, $3)', 
      [personaId, file.name, file.url]);
    }

    revalidatePath('/admin');
    return { success: true };

  } catch (error) {
    console.error("Detalle del error en servidor:", error);
    
    // Mantenemos esto como última línea de defensa por si ocurre un choque simultáneo (concurrencia)
    if (error.code === '23505') {
      return { 
        success: false, 
        error: "Ya existe un registro con este número de identificación o correo electrónico." 
      };
    }

    return { 
      success: false, 
      error: "Error al guardar en la base de datos. Verifique su conexión e intente de nuevo." 
    };
  }
}
// --- ELIMINAR REGISTRO ---
export async function eliminarUsuario(id) {
  try {
    // 1. Opcional: Si quieres borrar primero los documentos (aunque con CASCADE en SQL se hace solo)
    await db.query('DELETE FROM documentos WHERE personaid = $1', [id]);
    
    // 2. Borrar a la persona
    await db.query('DELETE FROM personas WHERE id = $1', [id]);

    // 3. Refrescar la página para ver los cambios
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { success: false, error: "No se pudo eliminar el registro." };
  }
}
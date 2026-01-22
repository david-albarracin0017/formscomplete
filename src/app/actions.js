'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- 1. FUNCIÓN DE REINICIO TOTAL ---
export async function reiniciarSistemaAdmin() {
  try {
    await db.query(`DROP TABLE IF EXISTS admins;`);
    await db.query(`
      CREATE TABLE admins (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);

    const hashGenerado = await bcrypt.hash("admin123", 10);
    await db.query(
      'INSERT INTO admins (usuario, password_hash) VALUES ($1, $2)',
      ['admin', hashGenerado]
    );

    return { success: true, message: "¡Sistema Reiniciado! Usuario: admin | Clave: admin123" };
  } catch (error) {
    console.error("Error en reinicio:", error);
    return { success: false, error: "Error de conexión: " + error.message };
  }
}

// --- 2. LOGIN DE ADMINISTRADOR ---
export async function loginAdmin(formData) {
  const usuario = formData.get('usuario')?.trim();
  const password = formData.get('password')?.trim();

  try {
    const res = await db.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
    
    if (res.rows.length === 0) {
      return { error: "El usuario no existe." };
    }

    const admin = res.rows[0];
    const esValida = await bcrypt.compare(password, admin.password_hash);

    if (!esValida) {
      return { error: "Contraseña incorrecta." };
    }

    // --- LA SOLUCIÓN ESTÁ AQUÍ ---
    // En las versiones nuevas de Next.js, cookies() DEBE llevar await
    const cookieStore = await cookies(); 
    
    cookieStore.set('admin_session', 'active_token_xyz', { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });
    
  } catch (error) {
    // Si el error es un redirect interno de Next.js, lo lanzamos para que funcione
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    
    console.error("Error en login:", error);
    return { error: "Error de conexión con la base de datos." };
  }

  // Redirigimos fuera del bloque try/catch
  redirect('/admin');
}

// --- 3. CAMBIAR CONTRASEÑA ---
export async function cambiarPasswordSeguro(oldPass, newPass) {
  try {
    const res = await db.query('SELECT password_hash FROM admins WHERE usuario = $1', ['admin']);
    if (res.rows.length === 0) return { success: false, error: "Usuario no encontrado." };

    const user = res.rows[0];
    const match = await bcrypt.compare(oldPass.trim(), user.password_hash);
    
    if (!match) return { success: false, error: "La contraseña actual no es correcta." };

    const nuevoHash = await bcrypt.hash(newPass.trim(), 10);
    await db.query('UPDATE admins SET password_hash = $1 WHERE usuario = $2', [nuevoHash, 'admin']);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar." };
  }
}

// --- 4. REGISTRO DE USUARIOS ---
export async function registrarUsuario(formData, fileUrls = []) {
  // Extraemos los datos usando .get() para asegurar compatibilidad
  try {
    const res = await db.query(`
      INSERT INTO personas (
        nombre, segundonombre, apellido, segundoapellido, genero, telefono, correo, 
        tipoidentificacion, numeroidentificacion, fechanacimiento, fechaexpedicion, 
        direccion, municipio, eps, contactoemergencia, contactotelefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;
    `, [
      formData.get('Nombre'),
      formData.get('SNombre') || '',
      formData.get('Apellido'),
      formData.get('SApellido') || '',
      formData.get('Genero'),
      formData.get('Telefono'),
      formData.get('Correo'),
      formData.get('TipoIdentificacion'),
      formData.get('NumeroIdentificacion'),
      formData.get('FechaNacimiento'),
      formData.get('FechaExpedicion'),
      formData.get('Direccion'),
      formData.get('Municipio'),
      formData.get('EPS'),
      formData.get('ContactoEmergencia'),
      formData.get('ContactoTelefono')
    ]);

    const personaId = res.rows[0].id;

    if (fileUrls.length > 0) {
      for (const file of fileUrls) {
        await db.query('INSERT INTO documentos (personaid, nombrearchivo, ruta) VALUES ($1, $2, $3)', 
        [personaId, file.name, file.url]);
      }
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarUsuario(id) {
  try {
    await db.query('DELETE FROM documentos WHERE personaid = $1', [id]);
    await db.query('DELETE FROM personas WHERE id = $1', [id]);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// actions.js

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session'); // Elimina la cookie por nombre
  redirect('/login');
}
'use server';

import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { db } from './lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- 1. FUNCIÓN DE REINICIO TOTAL (SOLO PARA EMERGENCIAS) ---
export async function reiniciarSistemaAdmin() {
  try {
    // Borramos y recreamos la tabla para asegurar que esté limpia
    await db.query(`DROP TABLE IF EXISTS admins;`);
    await db.query(`
      CREATE TABLE admins (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);

    // Generamos el hash para la clave inicial 'admin123'
    const passwordPlana = "admin123";
    const hashGenerado = await bcrypt.hash(passwordPlana, 10);

    await db.query(
      'INSERT INTO admins (usuario, password_hash) VALUES ($1, $2)',
      ['admin', hashGenerado]
    );

    return { success: true, message: "¡Sistema Reiniciado! Usuario: admin | Clave: admin123" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al reiniciar: " + error.message };
  }
}

// --- 2. LOGIN DE ADMINISTRADOR ---
export async function loginAdmin(formData) {
  const data = Object.fromEntries(formData.entries());
  const usuario = data.usuario?.trim();
  const password = data.password?.trim();

  let loginExitoso = false;

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

    // Crear la cookie de sesión
    cookies().set('admin_session', 'active_token_xyz', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 día
    });
    
    loginExitoso = true;
  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error de conexión con la base de datos." };
  }

  if (loginExitoso) {
    redirect('/admin');
  }
}

// --- 3. CAMBIAR CONTRASEÑA (DESDE EL PANEL) ---
export async function cambiarPasswordSeguro(oldPass, newPass) {
  try {
    const res = await db.query('SELECT password_hash FROM admins WHERE usuario = $1', ['admin']);
    const user = res.rows[0];

    const match = await bcrypt.compare(oldPass.trim(), user.password_hash);
    if (!match) return { success: false, error: "La contraseña actual no es correcta." };

    const nuevoHash = await bcrypt.hash(newPass.trim(), 10);
    await db.query('UPDATE admins SET password_hash = $1 WHERE usuario = $2', [nuevoHash, 'admin']);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo actualizar la contraseña." };
  }
}

// --- 4. ACCIONES DE REGISTRO (PERSONAS Y DOCUMENTOS) ---
export async function registrarUsuario(formData, fileUrls = []) {
  const data = Object.fromEntries(formData.entries());
  try {
    const queryPersona = `
      INSERT INTO personas (
        nombre, segundonombre, apellido, segundoapellido, genero, telefono, correo, 
        tipoidentificacion, numeroidentificacion, fechanacimiento, fechaexpedicion, 
        direccion, municipio, eps, contactoemergencia, contactotelefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;
    `;
    const values = [
      data.nombre, data.segundonombre || '', data.apellido, data.segundoapellido || '',
      data.genero, data.telefono, data.correo, data.tipoidentificacion, data.numeroidentificacion,
      data.fechanacimiento, data.fechaexpedicion, data.direccion, data.municipio,
      data.eps, data.contactoemergencia, data.contactotelefono
    ];

    const res = await db.query(queryPersona, values);
    const personaId = res.rows[0].id;

    for (const file of fileUrls) {
      await db.query('INSERT INTO documentos (personaid, nombrearchivo, ruta) VALUES ($1, $2, $3)', 
      [personaId, file.name, file.url]);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function eliminarUsuario(id) {
  await db.query('DELETE FROM documentos WHERE personaid = $1', [id]);
  await db.query('DELETE FROM personas WHERE id = $1', [id]);
  revalidatePath('/admin');
}
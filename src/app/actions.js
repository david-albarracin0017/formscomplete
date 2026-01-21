'use server';

import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { db } from './lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 1. REGISTRAR USUARIO (Sincronizado con tus nuevos campos)
export async function registrarUsuario(formData, fileUrls = []) {
  const data = Object.fromEntries(formData.entries());
  
  try {
    const queryPersona = `
      INSERT INTO personas (
        nombre, segundonombre, apellido, segundoapellido, genero, 
        telefono, correo, tipoidentificacion, numeroidentificacion, 
        fechanacimiento, fechaexpedicion, direccion, municipio, 
        eps, contactoemergencia, contactotelefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;
    `;

    const values = [
      data.nombre, data.segundonombre || '', data.apellido, data.segundoapellido || '', 
      data.genero, data.telefono, data.correo, data.tipoidentificacion, 
      data.numeroidentificacion, data.fechanacimiento, data.fechaexpedicion, 
      data.direccion, data.municipio, data.eps, data.contactoemergencia, data.contactotelefono
    ];

    const res = await db.query(queryPersona, values);
    const personaId = res.rows[0].id;

    if (fileUrls.length > 0) {
      for (const file of fileUrls) {
        await db.query(
          `INSERT INTO documentos (personaid, nombrearchivo, ruta) VALUES ($1, $2, $3)`,
          [personaId, file.name, file.url]
        );
      }
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error en registrarUsuario:", error);
    return { success: false, error: error.message };
  }
}

// 2. ELIMINAR USUARIO
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

// 3. CAMBIAR PASSWORD (CON BCRYPT)
export async function cambiarPasswordSeguro(oldPass, newPass) {
  try {
    const res = await db.query('SELECT password_hash FROM admins WHERE usuario = $1', ['admin']);
    if (res.rows.length === 0) return { success: false, error: "Admin no configurado" };

    const user = res.rows[0];
    const match = await bcrypt.compare(oldPass, user.password_hash);
    
    if (!match) return { success: false, error: "La contraseña actual es incorrecta" };

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPass, saltRounds);

    await db.query('UPDATE admins SET password_hash = $1 WHERE usuario = $2', [newHash, 'admin']);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error en el servidor" };
  }
}

// 4. LOGIN (CORREGIDO PARA EVITAR EL ERROR DE CONTRASEÑA)
export async function loginAdmin(formData) {
  const data = Object.fromEntries(formData.entries());
  const usuario = data.usuario?.trim();
  const password = data.password?.trim();

  let success = false;

  try {
    const res = await db.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
    
    if (res.rows.length === 0) {
      return { error: "Usuario no encontrado" };
    }

    const admin = res.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return { error: "Contraseña incorrecta" };
    }

    // Si llegamos aquí, las credenciales son correctas
    cookies().set('admin_session', 'active_token', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 día
    });
    
    success = true;
  } catch (error) {
    console.error("Error en Login:", error);
    return { error: "Error de conexión con la base de datos" };
  }

  // El redirect SIEMPRE debe ir fuera del try/catch en Next.js
  if (success) {
    redirect('/admin');
  }
}
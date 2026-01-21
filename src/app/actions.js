'use server';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { db } from './lib/db'; // Importamos el pool de conexión a Neon/Postgres

export async function registrarUsuario(formData, fileUrls = []) {
  const data = Object.fromEntries(formData.entries());
  
  try {
    // 1. Insertar en la tabla 'Personas' de Neon (PostgreSQL)
    const queryPersona = `
      INSERT INTO Personas (
        Nombre, Apellido, Genero, Telefono, Correo, 
        TipoIdentificacion, NumeroIdentificacion, FechaNacimiento, 
        FechaExpedicion, Direccion, Municipio, EPS, AFP, 
        ContactoEmergencia, ContactoTelefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id;
    `;

    const values = [
      data.Nombre, data.Apellido, data.Genero, data.Telefono, data.Correo,
      data.TipoIdentificacion, data.NumeroIdentificacion, data.FechaNacimiento,
      data.FechaExpedicion, data.Direccion, data.Municipio, data.EPS, data.AFP || '',
      data.ContactoEmergencia, data.ContactoTelefono
    ];

    const res = await db.query(queryPersona, values);
    const personaId = res.rows[0].id;

    // 2. Insertar las URLs de los archivos en la tabla 'Documentos'
    // fileUrls es un array de objetos: [{ name: "archivo.pdf", url: "https://..." }]
    if (fileUrls.length > 0) {
      for (const file of fileUrls) {
        await db.query(
          `INSERT INTO Documentos (PersonaId, NombreArchivo, Ruta) VALUES ($1, $2, $3)`,
          [personaId, file.name, file.url]
        );
      }
    }

    return { success: true };

  } catch (error) {
    console.error("Error detallado en el servidor:", error);
    
    if (error.code === '23505') {
      return { success: false, error: "La identificación o el correo ya están registrados." };
    }
    
    return { success: false, error: error.message || "Error interno del servidor" };
  }
  
}
// Acción para eliminar
export async function eliminarUsuario(id) {
  await db.query('DELETE FROM documentos WHERE personaid = $1', [id]);
  await db.query('DELETE FROM personas WHERE id = $1', [id]);
  revalidatePath('/admin');
}

export async function cambiarPasswordSeguro(oldPass, newPass) {
  try {
    const res = await db.query('SELECT password_hash FROM admins WHERE usuario = $1', ['admin']);
    const user = res.rows[0];

    // Comparar clave antigua con el hash de la DB
    const match = await bcrypt.compare(oldPass, user.password_hash);
    if (!match) return { success: false, error: "Contraseña actual incorrecta" };

    // Encriptar la nueva clave (10 rondas de seguridad)
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPass, saltRounds);

    await db.query('UPDATE admins SET password_hash = $1 WHERE usuario = $2', [newHash, 'admin']);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error en el servidor" };
  }
}

// Función para Login (puedes usar esto en una página de login.tsx)
export async function loginAdmin(formData) {
  const { usuario, password } = Object.fromEntries(formData);
  const res = await db.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
  
  if (res.rows.length === 0) return { error: "Usuario no encontrado" };

  const admin = res.rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);

  if (valid) {
    // Aquí crearías una sesión con JWT o Cookies (simplificado para este ejemplo)
    cookies().set('admin_session', 'active_token', { httpOnly: true, secure: true });
    redirect('/admin');
  } else {
    return { error: "Contraseña incorrecta" };
  }
}
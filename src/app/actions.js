'use server';
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
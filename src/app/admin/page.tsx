import { db } from '../lib/db';

export default async function AdminPanel() {
  try {
    // Consultamos todos los datos de personas y unimos con documentos
    const result = await db.query(`
      SELECT 
        p.*, 
        d."nombrearchivo" AS "NombreArchivo", 
        d."ruta" AS "Ruta"
      FROM "personas" p
      LEFT JOIN "documentos" d ON p.id = d."personaid"
      ORDER BY p.id DESC
    `);
    
    const registros = result.rows;

    // Función auxiliar para evitar el error [object Date]
    const formatearFecha = (fecha: any) => {
      if (!fecha) return 'N/A';
      // Si es un objeto Date, lo convertimos a string legible
      if (fecha instanceof Date) {
        return fecha.toLocaleDateString();
      }
      // Si ya es un string, lo devolvemos tal cual
      return String(fecha);
    };

    return (
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración - Vista Completa</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {registros.length} Registros
            </span>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-200 border-b">
                  <tr>
                    <th className="px-4 py-3">Nombre Completo</th>
                    <th className="px-4 py-3">Identificación</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Residencia / Salud</th>
                    <th className="px-4 py-3">Emergencia</th>
                    <th className="px-4 py-3 text-center">Archivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registros.length > 0 ? (
                    registros.map((reg: any, i: number) => (
                      <tr key={i} className="hover:bg-blue-50 transition-colors">
                        {/* Datos Básicos */}
                        <td className="px-4 py-4">
                          <div className="font-bold text-gray-900">{reg.nombre} {reg.apellido}</div>
                          <div className="text-xs text-gray-400">{reg.genero}</div>
                        </td>

                        {/* Identificación - AQUÍ USAMOS formatearFecha */}
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">{reg.tipoidentificacion}: {reg.numeroidentificacion}</div>
                          <div className="text-xs text-gray-500 text-nowrap">Nacimiento: {formatearFecha(reg.fechanacimiento)}</div>
                          <div className="text-xs text-gray-500 text-nowrap">Expedición: {formatearFecha(reg.fechaexpedicion)}</div>
                        </td>

                        {/* Contacto */}
                        <td className="px-4 py-4 text-xs">
                          <div className="font-semibold text-blue-600 truncate max-w-[150px]">{reg.correo}</div>
                          <div>Tel: {reg.telefono}</div>
                        </td>

                        {/* Residencia y Afiliaciones */}
                        <td className="px-4 py-4 text-xs">
                          <div><span className="font-bold">Dir:</span> {reg.direccion}</div>
                          <div><span className="font-bold">Ciudad:</span> {reg.municipio}</div>
                          <div><span className="font-bold">EPS:</span> {reg.eps}</div>
                          <div><span className="font-bold">AFP:</span> {reg.afp || 'N/A'}</div>
                        </td>

                        {/* Emergencia */}
                        <td className="px-4 py-4 text-xs border-r">
                          <div className="font-bold text-gray-800">{reg.contactoemergencia}</div>
                          <div>{reg.contactotelefono}</div>
                        </td>

                        {/* Botón de Archivo */}
                        <td className="px-4 py-4 text-center bg-gray-50">
                          {reg.Ruta ? (
                            <a 
                              href={reg.Ruta} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-sm"
                            >
                              Descargar
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Sin PDF</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No hay registros en la base de datos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error SQL:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200">
          <p className="text-red-600 font-bold text-center">Error al conectar con la base de datos.</p>
        </div>
      </div>
    );
  }
}
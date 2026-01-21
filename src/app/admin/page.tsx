import { db } from '../lib/db'; // Importamos la conexión

export default async function AdminPanel() {
  try {
    // Consulta agrupando documentos para evitar duplicados
    const result = await db.query(`
      SELECT 
        p.*, 
        COALESCE(
          json_agg(
            json_build_object('nombre', d.nombrearchivo, 'ruta', d.ruta)
          ) FILTER (WHERE d.id IS NOT NULL), 
          '[]'
        ) AS archivos
      FROM personas p
      LEFT JOIN documentos d ON p.id = d.personaid
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    
    const registros = result.rows;

    const formatearFecha = (fecha: any) => {
      if (!fecha) return 'N/A';
      if (fecha instanceof Date) return fecha.toLocaleDateString();
      return String(fecha);
    };

    return (
      <div className="bg-gray-100 min-h-screen">
        {/* --- NAVEGACIÓN --- */}
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-600 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m12.739 2.39a9 9 0 11-12.728 0" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-800 hidden md:block">
                  Admin<span className="text-blue-600">Panel</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Administrador</p>
                  <p className="text-xs text-gray-500">Sesión Activa</p>
                </div>
                {/* Botón Salir: En Basic Auth, esto limpia visualmente pero el navegador recordará la clave hasta cerrarse */}
                <a 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors shadow-sm"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Salir
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Registros del Sistema</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                {registros.length} registros totales
              </span>
            </div>

            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Identificación</th>
                      <th className="px-6 py-4">Contacto</th>
                      <th className="px-6 py-4">Entidad (EPS/AFP)</th>
                      <th className="px-6 py-4">Documentos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registros.length > 0 ? (
                      registros.map((reg: any) => (
                        <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{reg.nombre} {reg.apellido}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{reg.genero}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-800 font-medium">{reg.tipoidentificacion}: {reg.numeroidentificacion}</div>
                            <div className="text-xs text-gray-500">Nac: {formatearFecha(reg.fechanacimiento)}</div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="text-blue-600 font-medium">{reg.correo}</div>
                            <div className="text-gray-500">Cel: {reg.telefono}</div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="mb-1"><span className="font-bold text-gray-700">EPS:</span> {reg.eps}</div>
                            <div><span className="font-bold text-gray-700">AFP:</span> {reg.afp || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {reg.archivos && reg.archivos.length > 0 ? (
                                reg.archivos.map((file: any, idx: number) => (
                                  <a 
                                    key={idx}
                                    href={file.ruta} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-white border border-gray-300 text-gray-700 hover:text-blue-600 hover:border-blue-600 px-2 py-1 rounded text-[10px] font-bold shadow-sm transition-all"
                                  >
                                    PDF {idx + 1}
                                  </a>
                                ))
                              ) : (
                                <span className="text-gray-400 italic text-[10px]">Sin archivos</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          No hay datos registrados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error cargando panel:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold text-xl">Error crítico</p>
          <p className="text-red-500 mt-2">No se pudo establecer conexión con la base de datos.</p>
        </div>
      </div>
    );
  }
}
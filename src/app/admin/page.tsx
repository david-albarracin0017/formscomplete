import { db } from '../lib/db';
import { eliminarUsuario } from '../actions';
import AdminClientButtons from './AdminClientButtons'; // Componente para Excel y Salir

export default async function AdminPanel() {
  const result = await db.query(`
    SELECT p.*, 
    COALESCE(json_agg(json_build_object('ruta', d.ruta)) FILTER (WHERE d.id IS NOT NULL), '[]') AS archivos
    FROM personas p 
    LEFT JOIN documentos d ON p.id = d.personaid
    GROUP BY p.id 
    ORDER BY p.creadoen DESC
  `);
  
  const registros = result.rows;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* NAVEGACIÓN DIFERENCIADA */}
      <nav className="bg-slate-900 shadow-2xl p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold">A</div>
            <h1 className="text-white font-bold text-xl tracking-tighter">SISTEMA<span className="text-blue-400">ADMIN</span></h1>
          </div>
          <AdminClientButtons registros={registros} />
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Identificación</th>
                <th className="px-6 py-4">Contacto / Ubicación</th>
                <th className="px-6 py-4 text-center">Documentos</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {reg.nombre} {reg.segundonombre} {reg.apellido} {reg.segundoapellido}
                    </div>
                    <div className="text-[10px] text-gray-400">Registrado: {new Date(reg.creadoen).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">{reg.numeroidentificacion}</div>
                    <div className="text-[10px] text-gray-400">{reg.tipoidentificacion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-blue-600 font-medium">{reg.correo}</div>
                    <div className="text-gray-500 text-[11px]">{reg.municipio} - {reg.direccion}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {reg.archivos.map((arc: any, i: number) => (
                        <a key={i} href={arc.ruta} target="_blank" className="bg-red-100 text-red-600 p-1.5 rounded-md hover:bg-red-600 hover:text-white transition-all">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <form action={async (formData) => { 'use server'; await eliminarUsuario(reg.id); }}>
                      <button className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-tighter">Eliminar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
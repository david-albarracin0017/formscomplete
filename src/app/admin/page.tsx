import { db } from '../lib/db';
import AdminClientButtons from './AdminClientButtons'; 
// Asegúrate de tener esta función en tu actions.js
import { eliminarUsuario } from '../actions';
import NextImage from 'next/image';

export default async function AdminPanel() {
  // La consulta ahora incluye p.* para traer sangre, rh y emergencias
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
       <nav className="bg-white border-b-4 border-[#EAB308] p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* SECCIÓN DEL LOGO IZQUIERDA */}
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-56">
              <NextImage 
                src="/logo.png" 
                alt="Logo Unicolmayor"
                fill
                sizes="(max-width: 768px) 100vw, 250px"
                className="object-contain object-left"
                priority
              />
            </div>
            
            <div className="h-8 w-2px bg-slate-200 mx-2 hidden md:block"></div>
            
            <h1 className="text-[#003399] font-black text-xl tracking-tighter hidden md:block uppercase">
              Gestión <span className="text-[#EAB308]">Administrativa</span>
            </h1>
          </div>

          {/* COMPONENTE DE BOTONES (SEGURIDAD, EXCEL, SALIR) */}
          <div className="flex items-center gap-2">
            <AdminClientButtons registros={registros} />
          </div>
          
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Identificación</th>
                <th className="px-6 py-4">Salud (RH)</th>
                <th className="px-6 py-4">Contacto / Ubicación</th>
                <th className="px-6 py-4 text-center">Documentos</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 uppercase">
                      {reg.nombre} {reg.segundonombre} {reg.apellido} {reg.segundoapellido}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Reg: {reg.creadoen ? new Date(reg.creadoen).toLocaleString() : 'S/F'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">{reg.numeroidentificacion}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{reg.tipoidentificacion}</div>
                  </td>
                  {/* NUEVA COLUMNA VISUAL DE SALUD */}
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black">
                      {reg.tiposangre}{reg.factorrh}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-blue-600 font-medium">{reg.correo}</div>
                    <div className="text-gray-500 text-[11px] uppercase">{reg.municipio} - {reg.direccion}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {reg.archivos.map((arc: any, i: number) => (
                        <a key={i} href={arc.ruta} target="_blank" className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Ver PDF">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                        </a>
                      ))}
                    </div>
                  </td>
                 <td className="px-6 py-4 text-center">
                    {/* El formulario envía el ID a la Server Action directamente */}
                    <form action={async () => { 
                      'use server'; 
                      await eliminarUsuario(reg.id); 
                    }}>
                      <button 
                        type="submit"
                        className="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase border border-red-100 px-2 py-1 rounded hover:bg-red-50 transition-all"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registros.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-medium">No hay registros encontrados.</div>
          )}
        </div>
      </main>
    </div>
  );
}
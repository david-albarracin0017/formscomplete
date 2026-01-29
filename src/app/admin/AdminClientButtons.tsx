'use client';

import { useState } from 'react';
// Importamos las acciones necesarias
import { cambiarPasswordSeguro, logoutAdmin } from '../actions'; 
import XLSX from 'xlsx-js-style';

interface AdminClientButtonsProps {
  registros: any[];
}

export default function AdminClientButtons({ registros }: AdminClientButtonsProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [mensaje, setMensaje] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

// --- EXCEL ACTUALIZADO CON NUEVOS CAMPOS ---
const exportarExcel = () => {
  const encabezados = [
    "FECHA", "NOMBRE COMPLETO", "GENERO", "CORREO", "TELÉFONO",
    "TIPO DOC", "NUM DOC", "NACIMIENTO", "EXPEDICION", "DIRECCION", 
    "MUNICIPIO", "EPS", "SANGRE", "RH", "EMERGENCIA", "TEL. EMERGENCIA", 
    "DOC 1", "DOC 2", "DOC 3" 
  ];

  const filas = registros.map(r => {
    const links = r.archivos ? r.archivos.map((a: any) => a.ruta) : [];
    
    return [
      r.creadoen ? new Date(r.creadoen).toLocaleDateString() : 'N/A',
      `${r.nombre || ''} ${r.segundonombre || ''} ${r.apellido || ''} ${r.segundoapellido || ''}`.trim(),
      r.genero || 'N/A',
      r.correo || 'N/A',
      r.telefono || 'N/A',
      r.tipoidentificacion || 'N/A',
      r.numeroidentificacion || 'N/A',
      r.fechanacimiento ? new Date(r.fechanacimiento).toLocaleDateString() : 'N/A',
      r.fechaexpedicion ? new Date(r.fechaexpedicion).toLocaleDateString() : 'N/A',
      r.direccion || 'N/A',
      r.municipio || 'N/A',
      r.eps || 'N/A',
      r.tiposangre || 'N/A',
      r.factorrh || 'N/A',
      r.contactoemergencia || 'N/A',
      r.contactotelefono || 'N/A',
      // En lugar de la URL, usamos un objeto de celda con fórmula de Hipervínculo
      links[0] ? { f: `HYPERLINK("${links[0]}", "📄 VER")` } : "S/A",
      links[1] ? { f: `HYPERLINK("${links[1]}", "📄 VER")` } : "S/A",
      links[2] ? { f: `HYPERLINK("${links[2]}", "📄 VER")` } : "S/A",
      links[3] ? { f: `\HYPERLINK("${links[3]}", "📄 VER")` } : "S/A"
    ];
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

  // --- ESTILOS DE "BOTÓN" PARA LOS LINKS ---
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ c: C, r: R });
      if (!ws[addr]) continue;

      if (R === 0) {
        // Estilo Encabezado Azul
        ws[addr].s = {
          fill: { fgColor: { rgb: "3B82F6" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center" }
        };
      } else if (C >= 16 && C <= 19 && ws[addr].v !== "S/A") { 
        // Estilo de las celdas con Link (Parecido a un botón)
        ws[addr].s = {
          font: { color: { rgb: "2563EB" }, bold: true, underline: true },
          fill: { fgColor: { rgb: "EFF6FF" } }, // Fondo azul muy claro
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DBEAFE" } },
            bottom: { style: "thin", color: { rgb: "DBEAFE" } },
            left: { style: "thin", color: { rgb: "DBEAFE" } },
            right: { style: "thin", color: { rgb: "DBEAFE" } }
          }
        };
      }
    }
  }

  ws['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 5 }, { wch: 20 }, { wch: 15 },
    { wch: 10 }, { wch: 10 }, { wch: 10 } // Columnas de documentos pequeñas
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, "Reporte_Inscritos.xlsx");
};

  // --- CAMBIO DE CLAVE ---
  const handleCambioPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPass !== form.confirmPass) {
      return setMensaje({ text: "Las contraseñas no coinciden", isError: true });
    }
    setLoading(true);
    const res = await cambiarPasswordSeguro(form.oldPass, form.newPass);
    setLoading(false);

    if (res.success) {
      alert("Contraseña actualizada con éxito.");
      setShowModal(false);
      setForm({ oldPass: '', newPass: '', confirmPass: '' });
    } else {
      setMensaje({ text: res.error || "Error desconocido", isError: true });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setShowModal(true)} className="text-slate-400 hover:text-white text-xs border border-slate-700 px-3 py-2 rounded-lg transition-all">
        Seguridad
      </button>
      
      <button onClick={exportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg">
        Excel
      </button>

      {/* BOTÓN DE SALIR CORREGIDO */}
      <button 
        onClick={async () => {
            if(confirm("¿Deseas cerrar la sesión?")) {
                await logoutAdmin();
            }
        }} 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
      >
        Salir
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Cambiar Clave</h3>
            <form onSubmit={handleCambioPass} className="space-y-4">
              <input 
                type="password" placeholder="Clave Actual" required
                className="w-full border border-gray-200 p-4 rounded-2xl text-black outline-none focus:ring-2 focus:ring-blue-500"
                value={form.oldPass} onChange={e => setForm({...form, oldPass: e.target.value})}
              />
              <input 
                type="password" placeholder="Nueva Clave" required
                className="w-full border border-gray-200 p-4 rounded-2xl text-black outline-none focus:ring-2 focus:ring-blue-500"
                value={form.newPass} onChange={e => setForm({...form, newPass: e.target.value})}
              />
              <input 
                type="password" placeholder="Confirmar Nueva" required
                className="w-full border border-gray-200 p-4 rounded-2xl text-black outline-none focus:ring-2 focus:ring-blue-500"
                value={form.confirmPass} onChange={e => setForm({...form, confirmPass: e.target.value})}
              />
              {mensaje.text && <p className={`text-xs font-bold ${mensaje.isError ? 'text-red-500' : 'text-green-500'}`}>{mensaje.text}</p>}
              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700">
                  {loading ? 'Cargando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold">
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { cambiarPasswordSeguro } from '../actions';
import XLSX from 'xlsx-js-style';

interface AdminClientButtonsProps {
  registros: any[];
}

export default function AdminClientButtons({ registros }: AdminClientButtonsProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [mensaje, setMensaje] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  // --- EXCEL ---
  const exportarExcel = () => {
    const encabezados = ["FECHA", "DOCUMENTO", "NOMBRE COMPLETO", "CORREO", "TELÉFONO", "MUNICIPIO", "EPS", "PDFs"];
    const filas = registros.map(r => [
      new Date(r.creadoen).toLocaleDateString(),
      r.numeroidentificacion || 'N/A',
      `${r.nombre || ''} ${r.segundonombre || ''} ${r.apellido || ''} ${r.segundoapellido || ''}`.trim(),
      r.correo || 'N/A',
      r.telefono || 'N/A',
      r.municipio || 'N/A',
      r.eps || 'N/A',
      r.archivos ? r.archivos.map((a: any) => a.ruta).join(' | ') : ''
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

    // Estilos del Excel
    const estiloEncabezado = {
      fill: { fgColor: { rgb: "3B82F6" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[addr]) continue;
        if (R === 0) ws[addr].s = estiloEncabezado;
      }
    }

    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "Reporte_Admin.xlsx");
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
      setMensaje({ text: res.error || "Error desconocido", isError: true }); // Aquí se corrigió el error de TS
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
      <a href="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold">
        Salir
      </a>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-100 p-4"> {/* Corregido z-100 */}
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
'use client';

import { useState } from 'react';
import { cambiarPassword } from '../actions';
import XLSX from 'xlsx-js-style';

interface AdminClientButtonsProps {
  registros: any[];
}

export default function AdminClientButtons({ registros }: AdminClientButtonsProps) {
  // Estados para el Modal de Contraseña
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [mensaje, setMensaje] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN EXPORTAR EXCEL ESTILIZADO ---
  const exportarExcel = () => {
    const encabezados = [
      "FECHA REGISTRO", "DOCUMENTO", "TIPO", "NOMBRE COMPLETO", 
      "GÉNERO", "CORREO ELECTRÓNICO", "TELÉFONO", "MUNICIPIO", 
      "DIRECCIÓN", "EPS", "CONTACTO EMERGENCIA", "TEL. EMERGENCIA", "ENLACES PDF"
    ];

    const filas = registros.map(r => [
      new Date(r.creadoen).toLocaleDateString(),
      r.numeroidentificacion,
      r.tipoidentificacion,
      `${r.nombre} ${r.segundonombre || ''} ${r.apellido} ${r.segundoapellido || ''}`.replace(/\s+/g, ' ').trim(),
      r.genero,
      r.correo,
      r.telefono,
      r.municipio,
      r.direccion,
      r.eps,
      r.contactoemergencia,
      r.contactotelefono,
      r.archivos.map((a: any) => a.ruta).join(' | ')
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

    // Estilos: Azul claro con letras blancas y bordes
    const estiloEncabezado = {
      fill: { fgColor: { rgb: "3B82F6" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      },
      alignment: { horizontal: "center" }
    };

    const estiloCelda = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Aplicar estilos a todas las celdas
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[address]) continue;
        ws[address].s = (R === 0) ? estiloEncabezado : estiloCelda;
      }
    }

    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 40 },
      { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 50 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "Reporte_Admin_Sindicato.xlsx");
  };

  // --- FUNCIÓN CAMBIAR CONTRASEÑA ---
  const handleCambioPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ text: '', isError: false });

    if (form.newPass !== form.confirmPass) {
      return setMensaje({ text: "La nueva contraseña no coincide con la confirmación.", isError: true });
    }

    setLoading(true);
    const res = await cambiarPassword(form.oldPass, form.newPass);
    setLoading(false);

    if (res.success) {
      alert("Contraseña actualizada con éxito. El sistema le pedirá las nuevas credenciales al recargar.");
      setShowModal(false);
      setForm({ oldPass: '', newPass: '', confirmPass: '' });
    } else {
      setMensaje({ text: res.error || "Error al cambiar la contraseña", isError: true });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Botón Seguridad */}
      <button 
        onClick={() => setShowModal(true)}
        className="text-slate-400 hover:text-white text-xs border border-slate-700 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Seguridad
      </button>

      {/* Botón Excel */}
      <button 
        onClick={exportarExcel}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar Reporte
      </button>

      {/* Botón Salir */}
      <a 
        href="/" 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
      >
        Salir
      </a>

      {/* --- MODAL PARA CAMBIO DE CONTRASEÑA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Seguridad de Acceso</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleCambioPass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">CONTRASEÑA ACTUAL</label>
                <input 
                  type="password" required
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.oldPass}
                  onChange={e => setForm({...form, oldPass: e.target.value})}
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-500 mb-1 block">NUEVA CONTRASEÑA</label>
                <input 
                  type="password" required minLength={5}
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                  value={form.newPass}
                  onChange={e => setForm({...form, newPass: e.target.value})}
                />
                <input 
                  type="password" required
                  placeholder="Confirmar nueva contraseña"
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.confirmPass}
                  onChange={e => setForm({...form, confirmPass: e.target.value})}
                />
              </div>

              {mensaje.text && (
                <p className={`text-[11px] font-bold p-2 rounded ${mensaje.isError ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {mensaje.text}
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Procesando...' : 'Guardar Cambios'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
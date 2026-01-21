'use client';
import * as XLSX from 'xlsx';

export default function AdminClientButtons({ registros }: { registros: any[] }) {
  const exportarExcel = () => {
    const data = registros.map(r => ({
      "Nombre": r.nombre,
      "Segundo Nombre": r.segundonombre,
      "Apellido": r.apellido,
      "Segundo Apellido": r.segundoapellido,
      "Identificación": r.numeroidentificacion,
      "Correo": r.correo,
      "Teléfono": r.telefono,
      "EPS": r.eps,
      "Fecha Registro": new Date(r.creadoen).toLocaleString(),
      "Links Documentos": r.archivos.map((a: any) => a.ruta).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "Reporte_General.xlsx");
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={exportarExcel}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg"
      >
        Exportar Excel
      </button>
      <a 
        href="/" 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
      >
        Salir
      </a>
    </div>
  );
}
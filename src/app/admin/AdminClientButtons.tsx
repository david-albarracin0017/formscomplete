'use client';
import * as XLSX from 'xlsx';

export default function AdminClientButtons({ registros }: { registros: any[] }) {
  const exportarExcel = () => {
    // 1. Mapeamos los datos con nombres de columnas limpios y ordenados
    const data = registros.map(r => ({
      "FECHA REGISTRO": new Date(r.creadoen).toLocaleDateString(),
      "DOCUMENTO": r.numeroidentificacion,
      "TIPO": r.tipoidentificacion,
      "NOMBRE COMPLETO": `${r.nombre} ${r.segundonombre || ''} ${r.apellido} ${r.segundoapellido || ''}`.replace(/\s+/g, ' ').trim(),
      "GÉNERO": r.genero,
      "CORREO ELECTRÓNICO": r.correo,
      "TELÉFONO": r.telefono,
      "MUNICIPIO": r.municipio,
      "DIRECCIÓN": r.direccion,
      "EPS": r.eps,
      "CONTACTO EMERGENCIA": r.contactoemergencia,
      "TEL. EMERGENCIA": r.contactotelefono,
      "ENLACES PDF": r.archivos.map((a: any) => a.ruta).join(' | ')
    }));

    // 2. Crear la hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. DEFINIR ANCHOS DE COLUMNA (Esto quita el desorden)
    // El número es aproximadamente cuántos caracteres caben
    const wscols = [
      { wch: 15 }, // Fecha
      { wch: 15 }, // Documento
      { wch: 10 }, // Tipo
      { wch: 40 }, // Nombre Completo (Ancho para que no se corte)
      { wch: 10 }, // Género
      { wch: 30 }, // Correo
      { wch: 15 }, // Teléfono
      { wch: 20 }, // Municipio
      { wch: 30 }, // Dirección
      { wch: 15 }, // EPS
      { wch: 25 }, // Contacto Emergencia
      { wch: 15 }, // Tel Emergencia
      { wch: 50 }, // Enlaces PDF
    ];
    ws['!cols'] = wscols;

    // 4. Crear el libro y descargar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Detallado");
    
    // Nombre del archivo con la fecha de hoy
    const fechaHoy = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Reporte_Admin_${fechaHoy}.xlsx`);
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={exportarExcel}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar Reporte Limpio
      </button>
      <a 
        href="/" 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
      >
        Salir
      </a>
    </div>
  );
}
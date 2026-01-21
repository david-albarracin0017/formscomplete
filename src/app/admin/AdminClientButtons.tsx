'use client';
import XLSX from 'xlsx-js-style';

export default function AdminClientButtons({ registros }: { registros: any[] }) {
  const exportarExcel = () => {
    // 1. Preparar los encabezados
    const encabezados = [
      "FECHA REGISTRO", "DOCUMENTO", "TIPO", "NOMBRE COMPLETO", 
      "GÉNERO", "CORREO ELECTRÓNICO", "TELÉFONO", "MUNICIPIO", 
      "DIRECCIÓN", "EPS", "CONTACTO EMERGENCIA", "TEL. EMERGENCIA", "ENLACES PDF"
    ];

    // 2. Preparar los datos
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

    // 3. Crear el libro y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

    // 4. ESTILOS: Azul claro con letras blancas y bordes
    const estiloEncabezado = {
      fill: { fgColor: { rgb: "3B82F6" } }, // Azul claro (estilo Tailwind blue-500)
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

    // Aplicar los estilos a la hoja
    const rango = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let R = rango.s.r; R <= rango.e.r; ++R) {
      for (let C = rango.s.c; C <= rango.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        if (R === 0) {
          ws[cell_ref].s = estiloEncabezado; // Fila 0 es el título
        } else {
          ws[cell_ref].s = estiloCelda; // Resto son datos con bordes
        }
      }
    }

    // 5. Configurar anchos de columna
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 40 },
      { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 50 }
    ];

    // 6. Descargar
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "Reporte_Admin_Estilizado.xlsx");
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
        Exportar con Formato
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
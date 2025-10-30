const ExcelJS = require('exceljs');
const https = require('https');

async function generarManifiestoExcel(proyecto, resumen, avance, logsMateriales, desglose, detalles, series) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema de Seguimiento y Costeo';
  wb.created = new Date();

  // Utilidades de estilo
  const currencyFmt = 'S/ #,##0.00';
  const pctFmt = '0%';
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECEFF1' } };
  const headerFont = { bold: true, color: { argb: 'FF2E4053' } };
  const sectionTitleStyle = { bold: true, size: 14, color: { argb: 'FF1B4F72' } };

  // Hoja Resumen
  const wsResumen = wb.addWorksheet('Resumen');
  wsResumen.columns = [
    { key: 'campo', width: 28 },
    { key: 'valor', width: 40 }
  ];
  // Título
  wsResumen.mergeCells('A1:B1');
  wsResumen.getCell('A1').value = 'Manifiesto de Gastos y Avance';
  wsResumen.getCell('A1').font = sectionTitleStyle;
  wsResumen.getRow(1).height = 22;
  // Encabezados seguros
  wsResumen.getRow(2).values = ['Campo', 'Valor'];
  wsResumen.getRow(2).font = headerFont; wsResumen.getRow(2).fill = headerFill;
  const r = resumen || {};
  const presupuesto = Number(proyecto?.habilitado_estimado || 0);
  const costoTotal = Number(r.costo_total || 0);
  const financialPct = presupuesto > 0 ? Math.min(100, Math.round((costoTotal / presupuesto) * 100)) : 0;
  const rowsResumen = [
    ['Proyecto', proyecto?.nombre_del_proyecto || '-'],
    ['Mina', proyecto?.mina || '-'],
    ['Equipo', proyecto?.equipo || '-'],
    ['Fecha', proyecto?.fecha || '-'],
    ['Días planificados', proyecto?.['días_trabajados'] || 0],
    ['Costo fijo', Number(r.costo_fijo || 0)],
    ['Costo variable', Number(r.costo_variable || 0)],
    ['Costo directo', Number(r.costo_directo || 0)],
    ['Costo indirecto', Number(r.costo_indirecto || 0)],
    ['Costo total', costoTotal],
    ['IGV', Number(r.costo_total_igv || 0)],
    ['Presupuesto', presupuesto],
    ['Avance Financiero (%)', financialPct / 100]
  ];
  rowsResumen.forEach((arr) => wsResumen.addRow({ campo: arr[0], valor: arr[1] }));
  // Formatos
  wsResumen.eachRow((row, idx) => {
    if (idx <= 2) return; // saltar título y encabezados
    const campo = row.getCell(1).value;
    const cellVal = row.getCell(2);
    if (['Costo fijo','Costo variable','Costo directo','Costo indirecto','Costo total','IGV','Presupuesto'].includes(String(campo))) {
      cellVal.numFmt = currencyFmt;
    }
    if (String(campo).includes('Avance Financiero')) cellVal.numFmt = pctFmt;
  });

  // Hoja Desglose (por tipo)
  const wsDesglose = wb.addWorksheet('Desglose');
  wsDesglose.addRow(['Desglose de Costos por Tipo']);
  wsDesglose.getRow(1).font = sectionTitleStyle;
  wsDesglose.addRow([]);
  wsDesglose.addRow(['Tipo', 'Total', '% del grupo', 'Grupo']);
  wsDesglose.getRow(3).font = headerFont; wsDesglose.getRow(3).fill = headerFill;
  const d = desglose || { fijo: [], variable: [] };
  const totalFijo = Number(r.costo_fijo || 0);
  const totalVariable = Number(r.costo_variable || 0);
  [...(d.fijo || []).map(x => ({...x, grupo: 'Fijo'})), ...(d.variable || []).map(x => ({...x, grupo: 'Variable'}))]
    .forEach((item) => {
      const pct = (item.grupo === 'Fijo' ? totalFijo : totalVariable) > 0
        ? Number(item.total || 0) / (item.grupo === 'Fijo' ? totalFijo : totalVariable)
        : 0;
      const row = wsDesglose.addRow([item.tipo, Number(item.total || 0), pct, item.grupo]);
      row.getCell(2).numFmt = currencyFmt; row.getCell(3).numFmt = pctFmt;
    });
  wsDesglose.columns = [
    { width: 28 }, { width: 18 }, { width: 16 }, { width: 14 }
  ];

  // Hoja Uso de Materiales
  const wsUso = wb.addWorksheet('UsoMateriales');
  wsUso.addRow(['Uso de Materiales']); wsUso.getRow(1).font = sectionTitleStyle;
  wsUso.addRow(['Fecha', 'Material', 'Cantidad usada', 'Unidad', 'Comentario']);
  wsUso.getRow(2).font = headerFont; wsUso.getRow(2).fill = headerFill;
  const logs = Array.isArray(logsMateriales) ? logsMateriales : [];
  logs.forEach(l => wsUso.addRow([l.fecha, l.material_descripcion || 'Material', Number(l.cantidad_usada || 0), l.unidad || '', l.comentario || '']));
  wsUso.columns = [ { width: 18 }, { width: 36 }, { width: 18 }, { width: 12 }, { width: 50 } ];

  // Hoja Detalles por categoría
  const wsDetalles = wb.addWorksheet('Detalles');
  wsDetalles.addRow(['Manifiesto de Gastos Totales']); wsDetalles.getRow(1).font = sectionTitleStyle;
  const det = detalles || {};
  const secciones = [
    ['Mano de Obra', 'mano-obra', ['Trabajador','Cantidad','Precio','Días','SubTotal'], (it) => [it.trabajador, Number(it.cantidad_trabajador||0), Number(it.precio||0), Number(it.dias_trabajados||0), Number(it.sub_total||0)]],
    ['Local', 'local', ['Descripción','Promedio','PU','Días','Total'], (it) => [it.descripcion, Number(it.promedio||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Vigilancia', 'vigilancia', ['Descripción','Promedio','PU','Días','Total'], (it) => [it.descripcion, Number(it.promedio||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Energía', 'energia', ['Descripción','Promedio','PU','Días','Total'], (it) => [it.descripcion, Number(it.promedio||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Herramientas y Otros', 'herramientas-otros', ['Descripción','Promedio','PU','Días','Total'], (it) => [it.descripcion, Number(it.promedio||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Materiales', 'materiales', ['Descripción','Cantidad','Unidad','PU','Total'], (it) => [it.descripcion, Number(it.cantidad||0), it.unidad || '', Number(it.precio_unitario||0), Number(it.total||0)]],
    ['Implementos de Seguridad', 'implementos-seguridad', ['Descripción','Cantidad','PU','Días','Total'], (it) => [it.descripcion, Number(it.cantidad||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Petróleo', 'petroleo', ['Descripción','Cantidad','PU','Días','Total'], (it) => [it.descripcion, Number(it.cantidad||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Gasolina', 'gasolina', ['Descripción','Cantidad','PU','Días','Total'], (it) => [it.descripcion, Number(it.cantidad||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Tópico', 'topico', ['Descripción','Cantidad','PU','Días','Total'], (it) => [it.descripcion, Number(it.cantidad||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
    ['Equipo y Otros', 'equipo-otro', ['Descripción','Cantidad','PU','Días','Total'], (it) => [it.descripcion, Number(it.cantidad||0), Number(it.precio_unitario||0), Number(it.dias_trabajados||0), Number(it.total||0)]],
  ];
  let currentRow = 3;
  for (const [titulo, key, headers, mapper] of secciones) {
    wsDetalles.getCell(`A${currentRow}`).value = titulo;
    wsDetalles.getCell(`A${currentRow}`).font = headerFont; wsDetalles.getCell(`A${currentRow}`).fill = headerFill;
    currentRow++;
    wsDetalles.getRow(currentRow).values = headers; wsDetalles.getRow(currentRow).font = headerFont; wsDetalles.getRow(currentRow).fill = headerFill;
    currentRow++;
    const items = det[key] || [];
    let subtotal = 0;
    for (const it of items) {
      const values = mapper(it);
      const row = wsDetalles.getRow(currentRow);
      row.values = values;
      // formatear última columna como moneda si es total/subtotal
      if (headers[headers.length - 1].toLowerCase().includes('total')) {
        row.getCell(headers.length).numFmt = currencyFmt;
        subtotal += Number(values[headers.length - 1] || 0);
      }
      currentRow++;
    }
    wsDetalles.getRow(currentRow).values = ['Subtotal', '', '', '', subtotal];
    wsDetalles.getRow(currentRow).getCell(headers.length).numFmt = currencyFmt;
    currentRow += 2;
  }
  wsDetalles.columns = [ { width: 30 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 16 } ];

  // Hoja Series
  const wsSeries = wb.addWorksheet('Series');
  wsSeries.addRow(['Evolución Temporal (Físico y Financiero)']); wsSeries.getRow(1).font = sectionTitleStyle;
  wsSeries.addRow(['Fisico: fecha', 'Fisico: pct', '', 'Financiero: fecha', 'Financiero: pct']); wsSeries.getRow(2).font = headerFont; wsSeries.getRow(2).fill = headerFill;
  const s = series || { fisico: [], financiero: [] };
  const maxLen = Math.max((s.fisico||[]).length, (s.financiero||[]).length);
  for (let i = 0; i < maxLen; i++) {
    const f = s.fisico?.[i] || {}; const fin = s.financiero?.[i] || {};
    const row = wsSeries.addRow([f.date || '', (Number(f.pct||0))/100, '', fin.date || '', (Number(fin.pct||0))/100]);
    row.getCell(2).numFmt = pctFmt; row.getCell(5).numFmt = pctFmt;
  }
  wsSeries.columns = [ { width: 16 }, { width: 12 }, { width: 4 }, { width: 16 }, { width: 12 } ];

  // Hoja Gráficos: insertar imágenes generadas vía QuickChart
  const renderChartImage = (title, points, colorHex) => new Promise((resolve) => {
    const labels = points.map(p => String(p.date).slice(0,10));
    const data = points.map(p => Number(p.pct || 0));
    const cfg = {
      type: 'line',
      data: { labels, datasets: [{ label: title, data, borderColor: colorHex, fill: false }] },
      options: {
        scales: { y: { min: 0, max: 100 } },
        plugins: { legend: { display: true } }
      }
    };
    const postData = JSON.stringify({ width: 800, height: 400, format: 'png', backgroundColor: 'white', chart: cfg });
    const req = https.request({ hostname: 'quickchart.io', path: '/chart', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', () => resolve(Buffer.alloc(0))); // si falla, no bloquea
    req.write(postData);
    req.end();
  });

  const wsCharts = wb.addWorksheet('Graficos');
  wsCharts.getRow(1).values = ['Gráfico de Avance Físico']; wsCharts.getRow(1).font = sectionTitleStyle;
  const fisicoPoints = (s.fisico && s.fisico.length > 0)
    ? s.fisico
    : [{ date: new Date().toISOString().slice(0,10), pct: Number((avance?.tareas?.avanceTareasPct ?? avance?.dias?.avanceDiasPct ?? 0)) }];
  const imgFisico = await renderChartImage('Avance Físico %', fisicoPoints, '#2E86C1');
  if (imgFisico && imgFisico.length > 0) {
    const imageId = wb.addImage({ buffer: imgFisico, extension: 'png' });
    wsCharts.addImage(imageId, { tl: { col: 0, row: 1 }, ext: { width: 800, height: 320 } });
  }
  wsCharts.getRow(20).values = ['Gráfico de Avance Financiero']; wsCharts.getRow(20).font = sectionTitleStyle;
  const presupuestoVal = Number(proyecto?.habilitado_estimado || 0);
  const finPoints = (s.financiero && s.financiero.length > 0)
    ? s.financiero
    : [{ date: new Date().toISOString().slice(0,10), pct: presupuestoVal > 0 ? Math.min(100, Math.round((Number(resumen?.costo_total || 0) / presupuestoVal) * 100)) : 0 }];
  const imgFin = await renderChartImage('Avance Financiero %', finPoints, '#28B463');
  if (imgFin && imgFin.length > 0) {
    const imageId2 = wb.addImage({ buffer: imgFin, extension: 'png' });
    wsCharts.addImage(imageId2, { tl: { col: 0, row: 20 }, ext: { width: 800, height: 320 } });
  }

  // Hoja Avance
  const wsAvance = wb.addWorksheet('Avance');
  wsAvance.addRow(['Avance del Proyecto']); wsAvance.getRow(1).font = sectionTitleStyle;
  wsAvance.addRow(['Indicador','Valor']); wsAvance.getRow(2).font = headerFont; wsAvance.getRow(2).fill = headerFill;
  const a = avance || { dias: {}, tareas: {}, materiales: {} };
  const avanceRows = [
    ['Días reportados', `${a.dias?.diasReportados || 0}/${a.dias?.diasTotales || 0}`],
    ['Avance días %', (Number(a.dias?.avanceDiasPct || 0))/100],
    ['Tareas realizadas', `${a.tareas?.tareasRealizadas || 0}/${a.tareas?.tareasTotales || 0}`],
    ['Avance tareas %', (Number(a.tareas?.avanceTareasPct || 0))/100],
    ['Avance promedio materiales %', (Number(a.materiales?.avanceMaterialesPct || 0))/100]
  ];
  avanceRows.forEach(rw => { const row = wsAvance.addRow(rw); if (String(rw[0]).includes('%')) row.getCell(2).numFmt = pctFmt; });

  // Devolver buffer
  const buffer = await wb.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generarManifiestoExcel };
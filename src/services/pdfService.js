const PDFDocument = require('pdfkit');

function generarManifiesto(proyecto, resumen, avance, logsMateriales, desglose, detalles, series) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Layout fijo: márgenes y ancho de contenido
      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const contentWidth = right - left;
      const drawSectionRule = () => {
        const y = doc.y + 4;
        doc.save();
        doc.strokeColor('#dddddd').lineWidth(1).moveTo(left, y).lineTo(right, y).stroke();
        doc.restore();
        doc.moveDown(0.6);
      };

      // Encabezado
      doc.font('Helvetica-Bold').fontSize(18).text('Manifiesto de Gastos y Avance', left, doc.y, { width: contentWidth, align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(12)
        .text(`Proyecto: ${proyecto.nombre_del_proyecto}`, left, doc.y, { width: contentWidth })
        .text(`Mina: ${proyecto.mina || '-'} | Equipo: ${proyecto.equipo || '-'}`, left, doc.y, { width: contentWidth })
        .text(`Fecha: ${proyecto.fecha}`, left, doc.y, { width: contentWidth })
        .text(`Días planificados: ${proyecto['días_trabajados'] || 0}`, left, doc.y, { width: contentWidth });
      doc.moveDown();
      drawSectionRule();

      // Resumen de costos
      doc.font('Helvetica-Bold').fontSize(14).text('Resumen de Costos', left, doc.y, { width: contentWidth });
      doc.moveDown(0.3);
      const r = resumen || {};
      doc.font('Helvetica').fontSize(12)
        .text(`Costo fijo: S/ ${Number(r.costo_fijo || 0).toFixed(2)}`, left, doc.y, { width: contentWidth })
        .text(`Costo variable: S/ ${Number(r.costo_variable || 0).toFixed(2)}`, left, doc.y, { width: contentWidth })
        .text(`Costo directo: S/ ${Number(r.costo_directo || 0).toFixed(2)}`, left, doc.y, { width: contentWidth })
        .text(`Costo indirecto: S/ ${Number(r.costo_indirecto || 0).toFixed(2)}`, left, doc.y, { width: contentWidth })
        .text(`Costo total: S/ ${Number(r.costo_total || 0).toFixed(2)}`, left, doc.y, { width: contentWidth })
        .text(`IGV: S/ ${Number(r.costo_total_igv || 0).toFixed(2)}`, left, doc.y, { width: contentWidth });
      doc.moveDown();
      drawSectionRule();

      // Avance
      doc.font('Helvetica-Bold').fontSize(14).text('Avance del Proyecto', left, doc.y, { width: contentWidth });
      doc.moveDown(0.3);
      const a = avance || { dias: {}, tareas: {}, materiales: {} };
      doc.font('Helvetica').fontSize(12)
        .text(`Días reportados: ${a.dias?.diasReportados || 0}/${a.dias?.diasTotales || 0} (${a.dias?.avanceDiasPct || 0}%)`, left, doc.y, { width: contentWidth })
        .text(`Tareas realizadas: ${a.tareas?.tareasRealizadas || 0}/${a.tareas?.tareasTotales || 0} (${a.tareas?.avanceTareasPct || 0}%)`, left, doc.y, { width: contentWidth })
        .text(`Avance promedio materiales: ${a.materiales?.avanceMaterialesPct || 0}%`, left, doc.y, { width: contentWidth });
      doc.moveDown();

      // Gráfico de avance físico y financiero
      doc.font('Helvetica-Bold').fontSize(14).text('Gráfico de Avance Físico y Financiero', left, doc.y, { width: contentWidth });
      doc.moveDown(0.3);
      const physicalPct = Math.min(100, Math.max(0, Number(a.tareas?.avanceTareasPct ?? a.dias?.avanceDiasPct ?? 0)));
      const presupuesto = Number(proyecto?.habilitado_estimado || 0);
      const costoTotal = Number(r.costo_total || 0);
      const financialPct = presupuesto > 0 ? Math.min(100, Math.round((costoTotal / presupuesto) * 100)) : 0;

      const startX = left;
      let startY = doc.y;
      const barLabelWidth = 80;
      const barMaxWidth = Math.min(360, contentWidth - barLabelWidth - 60);
      const barHeight = 18;

      // Físico
      doc.font('Helvetica').fontSize(12).fillColor('black').text('Físico:', startX, startY, { width: barLabelWidth });
      const barX = startX + barLabelWidth;
      const barY = startY - 2; // ajustar leve posición
      // Fondo y borde
      doc.save();
      doc.lineWidth(1).strokeColor('#999').rect(barX, barY, barMaxWidth, barHeight).stroke();
      // Barra rellena
      const filledWidthPhysical = Math.round((physicalPct / 100) * barMaxWidth);
      doc.fillColor('#2E86C1').rect(barX, barY, filledWidthPhysical, barHeight).fill();
      doc.restore();
      // Etiqueta porcentaje
      doc.fillColor('black').text(`${physicalPct}%`, barX + barMaxWidth + 10, startY, { width: 40 });

      // Siguiente fila
      startY += barHeight + 10;

      // Financiero
      doc.font('Helvetica').fontSize(12).fillColor('black').text('Financiero:', startX, startY, { width: barLabelWidth });
      const barY2 = startY - 2;
      doc.save();
      doc.lineWidth(1).strokeColor('#999').rect(barX, barY2, barMaxWidth, barHeight).stroke();
      const filledWidthFinancial = Math.round((financialPct / 100) * barMaxWidth);
      doc.fillColor('#28B463').rect(barX, barY2, filledWidthFinancial, barHeight).fill();
      doc.restore();
      doc.fillColor('black').text(`${financialPct}%`, barX + barMaxWidth + 10, startY, { width: 40 });

      // Pie del gráfico (resumen valores usados)
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10).fillColor('#444')
        .text(`Presupuesto: S/ ${presupuesto.toFixed(2)} | Costo total ejecutado: S/ ${costoTotal.toFixed(2)}`, left, doc.y, { width: contentWidth });
      doc.moveDown();
      drawSectionRule();

      // Evolución temporal por fecha
      doc.font('Helvetica-Bold').fontSize(14).text('Evolución Temporal (Físico y Financiero)', left, doc.y, { width: contentWidth });
      doc.moveDown(0.3);
      const s = series || { fisico: [], financiero: [] };
      const chart = {
        width: Math.min(440, contentWidth - 60),
        height: 140,
        padding: 30
      };
      const drawLineChart = (title, points, colorHex) => {
        // Título
        doc.font('Helvetica').fontSize(12).fillColor('black').text(title, left, doc.y, { width: contentWidth });

        // Área del gráfico
        const axisWidth = chart.width;
        const axisHeight = chart.height;
        const originX = left + 30;       // margen para etiquetas Y
        const topY = doc.y + 8;          // separación desde el título
        const originY = topY + axisHeight; // eje X al final del área
        const maxPct = 100;

        // Ejes
        doc.save();
        doc.strokeColor('#333').lineWidth(1)
          .moveTo(originX, originY)
          .lineTo(originX + axisWidth, originY) // eje X
          .moveTo(originX, originY)
          .lineTo(originX, originY - axisHeight) // eje Y
          .stroke();

        // Ticks Y (0, 25, 50, 75, 100)
        [0,25,50,75,100].forEach(y => {
          const yPos = originY - (y / maxPct) * axisHeight;
          doc.strokeColor('#ddd').lineWidth(0.5)
            .moveTo(originX, yPos)
            .lineTo(originX + axisWidth, yPos)
            .stroke();
          doc.fillColor('#666').fontSize(8).text(`${y}%`, originX - 26, yPos - 6, { width: 24, align: 'right' });
        });

        // Serie de puntos (si hay datos)
        const n = points.length;
        if (n > 0) {
          const stepX = n > 1 ? axisWidth / (n - 1) : axisWidth;
          doc.strokeColor(colorHex).lineWidth(2);
          points.forEach((p, idx) => {
            const x = originX + stepX * idx;
            const y = originY - (Math.max(0, Math.min(100, Number(p.pct || 0))) / maxPct) * axisHeight;
            if (idx === 0) doc.moveTo(x, y);
            else doc.lineTo(x, y);
          });
          doc.stroke();

          // Etiquetas de fechas (cada 4 puntos)
          doc.fontSize(8).fillColor('#444');
          points.forEach((p, idx) => {
            if (idx % 4 === 0 || idx === n - 1) {
              const x = originX + stepX * idx;
              doc.text(String(p.date).slice(0,10), x - 20, originY + 2, { width: 40, align: 'center' });
            }
          });
        } else {
          // Mensaje de sin datos dentro del área
          doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666')
            .text('Sin datos', originX + axisWidth/2 - 30, topY + axisHeight/2 - 6, { width: 60, align: 'center' });
        }

        // Finalizar y avanzar el cursor por debajo del gráfico
        doc.restore();
        doc.y = originY + 16;
      };

      drawLineChart('Avance Físico % (por fecha)', Array.isArray(s.fisico) ? s.fisico : [], '#2E86C1');
      drawLineChart('Avance Financiero % (por fecha)', Array.isArray(s.financiero) ? s.financiero : [], '#28B463');
      drawSectionRule();

      // Desglose de costos por tipo
      doc.font('Helvetica-Bold').fontSize(14).text('Desglose de Costos por Tipo', left, doc.y, { width: contentWidth });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(12);
      const d = desglose || { fijo: [], variable: [] };
      const totalFijo = Number(r.costo_fijo || 0);
      const totalVariable = Number(r.costo_variable || 0);

      // Fijos
      doc.text('Costos Fijos:', left, doc.y, { width: contentWidth });
      if (!d.fijo || d.fijo.length === 0) {
        doc.text('- Sin costos fijos registrados', left, doc.y, { width: contentWidth });
      } else {
        d.fijo.forEach((item) => {
          const pct = totalFijo > 0 ? Math.round((Number(item.total || 0) / totalFijo) * 100) : 0;
          doc.text(`- ${item.tipo}: S/ ${Number(item.total || 0).toFixed(2)} (${pct}%)`, left, doc.y, { width: contentWidth });
        });
      }
      doc.moveDown(0.2);

      // Variables
      doc.text('Costos Variables:', left, doc.y, { width: contentWidth });
      if (!d.variable || d.variable.length === 0) {
        doc.text('- Sin costos variables registrados', left, doc.y, { width: contentWidth });
      } else {
        d.variable.forEach((item) => {
          const pct = totalVariable > 0 ? Math.round((Number(item.total || 0) / totalVariable) * 100) : 0;
          doc.text(`- ${item.tipo}: S/ ${Number(item.total || 0).toFixed(2)} (${pct}%)`, left, doc.y, { width: contentWidth });
        });
      }
      doc.moveDown();

      // Detalle de materiales usados
      doc.fontSize(14).text('Uso de Materiales');
      doc.moveDown(0.3);
      doc.fontSize(12);
      const logs = Array.isArray(logsMateriales) ? logsMateriales : [];
      if (logs.length === 0) {
        doc.text('Sin registros de uso de materiales.');
      } else {
        logs.forEach((l) => {
          const line = `Fecha ${l.fecha} | ${l.material_descripcion || 'Material'} | Usado: ${l.cantidad_usada} ${l.unidad || ''}${l.comentario ? ' | ' + l.comentario : ''}`;
          doc.text(line);
        });
      }
      
      doc.moveDown();

      // Manifiesto de gastos totales (detalle por tipo)
      doc.fontSize(14).text('Manifiesto de Gastos Totales');
      doc.moveDown(0.3);
      doc.fontSize(12);
      const det = detalles || {};
      const renderTipo = (titulo, items, opts) => {
        doc.fontSize(12).text(titulo);
        if (!items || items.length === 0) {
          doc.text('- Sin registros');
          doc.moveDown(0.2);
          return 0;
        }
        let suma = 0;
        items.forEach((it) => {
          const line = opts.formatLine(it);
          const totalVal = opts.totalValue(it);
          suma += Number(totalVal || 0);
          doc.text(`- ${line} | Total: S/ ${Number(totalVal || 0).toFixed(2)}`);
        });
        doc.text(`Subtotal ${titulo}: S/ ${suma.toFixed(2)}`);
        doc.moveDown(0.2);
        return suma;
      };

      // Fijos
      const fijoSubtotal =
        renderTipo('Mano de Obra', det['mano-obra'], {
          formatLine: (it) => `Trabajador: ${it.trabajador} | Cant: ${it.cantidad_trabajador} | Precio: ${it.precio} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.sub_total
        })
        + renderTipo('Local', det['local'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Prom: ${it.promedio} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Vigilancia', det['vigilancia'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Prom: ${it.promedio} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Energía', det['energia'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Prom: ${it.promedio} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Herramientas y Otros', det['herramientas-otros'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Prom: ${it.promedio} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        });

      // Variables
      const variableSubtotal =
        renderTipo('Materiales', det['materiales'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} ${it.unidad || ''} | PU: ${it.precio_unitario}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Implementos de Seguridad', det['implementos-seguridad'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Petróleo', det['petroleo'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Gasolina', det['gasolina'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Tópico', det['topico'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        })
        + renderTipo('Equipo y Otros', det['equipo-otro'], {
          formatLine: (it) => `Desc: ${it.descripcion} | Cant: ${it.cantidad} | PU: ${it.precio_unitario} | Días: ${it.dias_trabajados}`,
          totalValue: (it) => it.total
        });

      doc.fontSize(12).text(`Verificación subtotales calculados: Fijo S/ ${fijoSubtotal.toFixed(2)} | Variable S/ ${variableSubtotal.toFixed(2)}`);
      doc.moveDown(0.5);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generarManifiesto };
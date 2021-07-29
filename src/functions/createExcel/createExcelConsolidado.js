import MilesFormat from "../formattedPesos";
import moment from 'moment';
import { FORMAT_DATE } from "../../constant/var";

var path = require("path");

// Require library
var xl = require('excel4node');

// Create a new instance of a Workbook class
var wb = new xl.Workbook();

// Add Worksheets to the workbook
var ws = wb.addWorksheet('Consolidado');

export default function createExcel(nombrePdf, cobranzas) {
  // Create a reusable style
  // var style = wb.createStyle({
  //   font: {
  //     color: '#FF0800',
  //     size: 12,
  //   },
  //   numberFormat: '$#,##0.00; ($#,##0.00); -',
  // });

  const totalRegisters = cobranzas;

  var headerStyle = wb.createStyle({
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#C2C2C2',
      fgColor: '#C2C2C2'
    },
    font: {
      color: '#000000',
      size: 10,
      bold: true,
      name: 'Roboto'
    },
    alignment: {
      shrinkToFit: true,
      wrapText: true
    }
  });

  var cellStyle = wb.createStyle({
    font: {
      color: '#000000',
      size: 9,
      name: 'Roboto'
    },
  })

  //cabeceras de la tabla
  ws.column(1).setWidth(17)
  ws.cell(1, 1)
    .string('CÓDIGO')
    .style(headerStyle);

  ws.column(2).setWidth(11)
  ws.cell(1, 2)
    .string('FECHA EV.')
    .style(headerStyle);

  ws.column(3).setWidth(25)
  ws.cell(1, 3)
    .string('NOMBRE EVALUADO')
    .style(headerStyle);

  ws.column(4).setWidth(11)
  ws.cell(1, 4)
    .string('RUT EVA.')
    .style(headerStyle);

  ws.column(5).setWidth(40)
  ws.cell(1, 5)
    .string('NOMBRE SERVICIO')
    .style(headerStyle);

  ws.column(6).setWidth(11)
  ws.cell(1, 6)
    .string('V.SERVICIO')
    .style(headerStyle);

  ws.column(7).setWidth(11)
  ws.cell(1, 7)
    .string('V.PAGADO')
    .style(headerStyle);

  ws.column(8).setWidth(11)
  ws.cell(1, 8)
    .string('SALDO')
    .style(headerStyle);

  const totals = totalRegisters.reduce((acc, current) => {
    return {
      service: acc.service + current.valor_servicio,
      payed: acc.payed + current.valor_cancelado,
      balance: acc.balance + current.valor_deuda
    }
  }, { service: 0, payed: 0, balance: 0 });

  //informacion
  totalRegisters.forEach((element, index) => {
    ws.cell(index + 2, 1)
      .string(element.codigo)
      .style(cellStyle);

    ws.cell(index + 2, 2)
      .string(moment(element.fecha_cobranza).format(FORMAT_DATE))
      .style(cellStyle);

    ws.cell(index + 2, 3)
      .string(element.razon_social_cs)
      .style(cellStyle);

    ws.cell(index + 2, 4)
      .string(element.rut_cs)
      .style(cellStyle);

    ws.cell(index + 2, 5)
      .string(element.nombre_servicio)
      .style(cellStyle);

    ws.cell(index + 2, 6)
      .string(`$${MilesFormat(element.valor_servicio)}`)
      .style(cellStyle);

    ws.cell(index + 2, 7)
      .string(`$${MilesFormat(element.valor_cancelado)}`)
      .style(cellStyle);

    ws.cell(index + 2, 8)
      .string(`$${MilesFormat(element.valor_deuda)}`)
      .style(cellStyle);
  });

  //totales
  ws.cell(totalRegisters.length + 2, 5)
    .string('Total')
    .style(headerStyle);

  ws.cell(totalRegisters.length + 2, 6)
    .string(`$${MilesFormat(totals.service)}`)
    .style(headerStyle);

  ws.cell(totalRegisters.length + 2, 7)
    .string(`$${MilesFormat(totals.payed)}`)
    .style(headerStyle);

  ws.cell(totalRegisters.length + 2, 8)
    .string(`$${MilesFormat(totals.balance)}`)
    .style(headerStyle);

  wb.write(path.resolve("./") + "/uploads/" + nombrePdf);
}
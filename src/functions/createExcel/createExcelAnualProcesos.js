var path = require('path');
var xl = require('excel4node');
var wb = new xl.Workbook();
var wsRequests = wb.addWorksheet("Solicitudes");
var wsReservations = wb.addWorksheet("Reservas");
var wsEvaluations = wb.addWorksheet("Evaluaciones");
var wsResults = wb.addWorksheet("Resultados");
var wsInvoices = wb.addWorksheet("Facturaciones");
var wsPayments = wb.addWorksheet("Pagos");
var wsRequestPayments = wb.addWorksheet("Cobranza");

export default function createAnualExcel(
  mes,
  pdfName,
  {
    columnsNameRequests,
    colummnsNameReservations,
    columnsNameEvaluations,
    columnsNameResults,
    columnsNameInvoices,
    columnsNamePayments,
    columnsNameRequestPayments
  },
  {
    rowsDataRequests,
    rowsDataReservations,
    rowsDataEvaluations,
    rowsDataResults,
    rowsDataInvoices,
    rowsDataPayments,
    rowsDataRequestPayment
  },
  {
    headerKeyColorRequests,
    headerKeyColorReservations,
    headerKeyColorEvaluations,
    headerKeyColorResults,
    headerKeyCOlorInvoices,
    headerKeyColorPayments,
    headerKeyColorRequestPayments
  },
  {
    headersColorRequests,
    headersColorReservations,
    headerColorEvaluations,
    headerColorResults,
    headerColorInvoices,
    headerColorPayments,
    headerColorRequestPayment
  },
  {
    fontColorRequests,
    fontColorReservations,
    fontColorEvaluations,
    fontColorResults,
    fontColorInvoices,
    fontColorPayments,
    fontColorRequestPayments
  }
) {

  var cellStyle = wb.createStyle({
    font: {
      color: '#000000',
      size: 9,
      name: 'Roboto'
    },
  })

  //----------------------------------------SOLICIUDES
  //cabeceras de la tabla
  columnsNameRequests.forEach((column, index) => {
    wsRequests.column(index + 1).setWidth(column.width);
    wsRequests.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorRequests,
            fgColor: headerKeyColorRequests
          },
          font: {
            color: fontColorRequests,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headersColorRequests,
            fgColor: headersColorRequests
          },
          font: {
            color: fontColorRequests,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataRequests.forEach((row, index) => {
    if(row.mes_solicitud === mes){
      columnsNameRequests.forEach((column, subindex) => {
        wsRequests.cell(index + 2, subindex + 1)
          .string(row[column.requestName])
          .style(cellStyle)
      })
    }
  });

  //------------------------------------- RESERVAS
  //cabeceras de la tabla
  colummnsNameReservations.forEach((column, index) => {
    wsReservations.column(index + 1).setWidth(column.width);
    wsReservations.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorReservations,
            fgColor: headerKeyColorReservations
          },
          font: {
            color: fontColorReservations,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headersColorReservations,
            fgColor: headersColorReservations
          },
          font: {
            color: fontColorReservations,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataReservations.forEach((row, index) => {
    colummnsNameReservations.forEach((column, subindex) => {
      wsReservations.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  //-------------------------------------------EVALUATIONS
  columnsNameEvaluations.forEach((column, index) => {
    wsEvaluations.column(index + 1).setWidth(column.width);
    wsEvaluations.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorEvaluations,
            fgColor: headerKeyColorEvaluations
          },
          font: {
            color: fontColorEvaluations,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerColorEvaluations,
            fgColor: headerColorEvaluations
          },
          font: {
            color: fontColorEvaluations,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataEvaluations.forEach((row, index) => {
    columnsNameEvaluations.forEach((column, subindex) => {
      wsEvaluations.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  //-------------------------------------------RESULTS
  columnsNameResults.forEach((column, index) => {
    wsResults.column(index + 1).setWidth(column.width);
    wsResults.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorResults,
            fgColor: headerKeyColorResults
          },
          font: {
            color: fontColorResults,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerColorResults,
            fgColor: headerColorResults
          },
          font: {
            color: fontColorResults,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataResults.forEach((row, index) => {
    columnsNameResults.forEach((column, subindex) => {
      wsResults.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  //--------------------------------------------INVOICES
  columnsNameInvoices.forEach((column, index) => {
    wsInvoices.column(index + 1).setWidth(column.width);
    wsInvoices.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyCOlorInvoices,
            fgColor: headerKeyCOlorInvoices
          },
          font: {
            color: fontColorInvoices,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerColorInvoices,
            fgColor: headerColorInvoices
          },
          font: {
            color: fontColorInvoices,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataInvoices.forEach((row, index) => {
    columnsNameInvoices.forEach((column, subindex) => {
      wsInvoices.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  //--------------------------------------------PAYMENTS
  columnsNamePayments.forEach((column, index) => {
    wsPayments.column(index + 1).setWidth(column.width);
    wsPayments.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorPayments,
            fgColor: headerKeyColorPayments
          },
          font: {
            color: fontColorPayments,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerColorPayments,
            fgColor: headerColorPayments
          },
          font: {
            color: fontColorPayments,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataPayments.forEach((row, index) => {
    columnsNamePayments.forEach((column, subindex) => {
      wsPayments.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  //-------------------------------------------REQUEST PAYMENTS
  columnsNameRequestPayments.forEach((column, index) => {
    wsRequestPayments.column(index + 1).setWidth(column.width);
    wsRequestPayments.cell(1, index + 1)
      .string(column.name)
      .style(index === 0 ?
        wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerKeyColorRequestPayments,
            fgColor: headerKeyColorRequestPayments
          },
          font: {
            color: fontColorRequestPayments,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }) : wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: headerColorRequestPayment,
            fgColor: headerColorRequestPayment
          },
          font: {
            color: fontColorRequestPayments,
            size: 10,
            bold: true,
            name: 'Roboto'
          },
          alignment: {
            shrinkToFit: true,
            wrapText: true
          }
        }))
  });

  //filas de información
  rowsDataRequestPayment.forEach((row, index) => {
    columnsNameRequestPayments.forEach((column, subindex) => {
      wsRequestPayments.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
  });

  wb.write(path.resolve("./") + "/uploads/" + pdfName);
};

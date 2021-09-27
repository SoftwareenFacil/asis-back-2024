var path = require('path');
var xl = require('excel4node');
var wb = new xl.Workbook();
var wsRequests = wb.addWorksheet("Solicitudes");
var wsReservations = wb.addWorksheet("Reservas");
var wsEvaluations = wb.addWorksheet("Evaluaciones");
var wsResults = wb.addWorksheet("Resultados");

export default function createAnualExcel(
  pdfName,
  {
    columnsNameRequests,
    colummnsNameReservations,
    columnsNameEvaluations,
    columnsNameResults
  },
  {
    rowsDataRequests,
    rowsDataReservations,
    rowsDataEvaluations,
    rowsDataResults
  },
  {
    headerKeyColorRequests,
    headerKeyColorReservations,
    headerKeyColorEvaluations,
    headerKeyColorResults
  },
  {
    headersColorRequests,
    headersColorReservations,
    headerColorEvaluations,
    headerColorResults
  },
  {
    fontColorRequests,
    fontColorReservations,
    fontColorEvaluations,
    fontColorResults
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
    columnsNameRequests.forEach((column, subindex) => {
      wsRequests.cell(index + 2, subindex + 1)
        .string(row[column.requestName])
        .style(cellStyle)
    })
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

  wb.write(path.resolve("./") + "/uploads/" + pdfName);
};

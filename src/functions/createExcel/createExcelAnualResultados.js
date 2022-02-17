var path = require('path');
var xl = require('excel4node');

export default function createAnualExcelResultados(
  pdfName,
  { columnsNameResults },
  { rowsDataResults },
  { headerKeyColorResults },
  { headerColorResults },
  { fontColorResults }
) {
  var wb = new xl.Workbook();
  var wsResults = wb.addWorksheet("Resultados");

  var cellStyle = wb.createStyle({
    font: {
      color: '#000000',
      size: 9,
      name: 'Roboto'
    },
  })

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
}
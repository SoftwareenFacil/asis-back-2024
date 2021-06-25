var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");

export default function createPdfConsolidado(
  nombrePdf
) {
  const doc = new PDF();
  let generalSpace = 30;

  //--------------------------------------------------PDF----------------------------------------

  //--Logo
  doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/" + nombrePdf));
  doc.image(path.resolve("./") + "/src/assets/img/asis_logo.png", 225, generalSpace, {
    fit: [155, 155],
    align: "center",
    valign: "start",
  });

  generalSpace += 85;

  //--Texto de presentación
  doc.fontSize(9);
  doc
    .font("Helvetica-Bold")
    .text("SR. BESALCO MINA", 20, generalSpace, { align: "left" })
    .fillColor('grey', 0.14)

  generalSpace += 20;

  doc.fontSize(9);
  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica-Bold")
    .text("Estimado/s, hacemos llegar nómina Exámenes realizados en nuestras oficinas. Los valores contenidos en este documento son exentos de IVA.", 20, generalSpace, { align: "left" })

  generalSpace += 40;

  //--Aversion al riesgo
  doc.fontSize(9);
  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica")
    .text("EXAMEN", 20, generalSpace, { align: "left" })

  doc.fontSize(9);
  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica-Bold")
    .text("AVERSIÓN AL RIESGO", 80, generalSpace, { align: "left" })

  generalSpace += 20;

  //--CABECERA DE TABLA
  doc.fontSize(8);
  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica")
    .text("FECHA", 33, generalSpace + 16, { align: "left" })
    .rect(20, generalSpace + 10, 52, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica")
    .text("RUT CS", 88, generalSpace + 16, { align: "left" })
    .rect(74, generalSpace + 10, 60, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  doc.fillColor('#000', 0.6);
  doc
    .font("Helvetica")
    .text("RAZON SOCIAL CS", 200, generalSpace + 16, { align: "left" })
    .rect(136, generalSpace + 10, 200, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  generalSpace += 25;

  //--TABLA
  doc.fontSize(8);
  doc.fillColor('#000', 0.9);
  doc
    .font("Helvetica-Bold")
    .text("10-12-2021", 25, generalSpace + 16, { align: "left" })
    .rect(20, generalSpace + 10, 52, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  doc.end();
};
import MilesFormat from "../../formattedPesos.js";

var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");

export default function createPdfCobranza(
  nombrePdf,
  CP,
  CS,
  reserva,
  profesionalAsignado,
  evaluacion,
  cobranza
) {
  const doc = new PDF();
  let generalSpace = 30;

  //--Logo
  doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/" + nombrePdf));
  doc.image(path.resolve("./") + "/src/assets/img/asis_logo.png", 225, generalSpace, {
    fit: [155, 155],
    align: "center",
    valign: "start",
  });

  generalSpace += 85;

  //-- CABECERA
  doc.fontSize(9);
  doc
    .font("Helvetica-Bold")
    .text("RAZON SOCIAL CLIENTE:", 20, generalSpace, { align: "left" })
    .fillColor('grey', 0.14)

  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!CP ? CP.razon_social : '', 140, generalSpace, { align: "left" })
    .fillColor('grey', 0.14)

  generalSpace += 15;

  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("RUT CLIENTE:", 70, generalSpace, { align: "left" })
    .fillColor('grey', 0.14)

  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!CP ? CP.rut : '', 140, generalSpace, { align: "left" })
    .fillColor('grey', 0.14)

  generalSpace += 40;

  doc.fontSize(20);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("DETALLE COBRANZA INDIVIDUAL CLIENTE", 70, generalSpace, { align: "center" })
    .fillColor('grey', 0.14)

  //-----TITULO
  generalSpace += 40;

  doc.fillColor('#26C37C', 1);
  doc
    .rect(20, generalSpace, 576, 0.5)
    .fillColor('#299765', 0.7)
    .fillAndStroke('#299765');

  generalSpace += 1;

  doc.fillColor('grey', 1);
  doc
    .rect(40, generalSpace, 536, 20)
    .fillColor('grey', 0.7)
    .fillAndStroke('grey');

  //--PRESENTACION
  generalSpace += 30;

  doc.fontSize(10);
  doc.fillColor('#000', 0.75);
  doc
    .font("Helvetica")
    .text("Estimado (a)", 40, generalSpace, { align: "left" })
    .fillColor('grey', 0.24)

  generalSpace += 20;

  doc.fontSize(10);
  doc.fillColor('#000', 0.75);
  doc
    .font("Helvetica")
    .text("ASIS Consultores SPA hace envío del detalle de Cobro del Servicio solicitado de acuerdo al siguiente detalle: ", 40, generalSpace, { align: "left" })
    .fillColor('grey', 0.24)

  generalSpace += 30;

  doc.fontSize(10);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("NOMBRE SERVICIO:", 40, generalSpace, { align: "left" })
    .fillColor('grey', 0.24)

  doc.fontSize(10);
  doc.fillColor('#000', 0.75);
  doc
    .font("Helvetica")
    .text(!!reserva && reserva.nombre_servicio, 150, generalSpace, { align: "left" })
    .fillColor('grey', 0.24);

  generalSpace += 20;

  doc.fontSize(10);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("EVALUADOR:", 40, generalSpace, { align: "left" })
    .fillColor('grey', 0.24)

  doc.fontSize(10);
  doc.fillColor('#000', 0.75);
  doc
    .font("Helvetica")
    .text(!!profesionalAsignado ? profesionalAsignado.razon_social : '', 150, generalSpace, { align: "left" })
    .fillColor('grey', 0.24);

  //--CABECERA DE TABLA
  generalSpace += 25;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("CÓDIDO", 46, generalSpace + 16, { align: "left" })
    .rect(40, generalSpace + 10, 100, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("FECHA EV.", 148, generalSpace + 16, { align: "left" })
    .rect(142, generalSpace + 10, 52, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("NOMBRE EVALUADO", 203, generalSpace + 16, { align: "left" })
    .rect(196, generalSpace + 10, 160, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("RUT EVA.", 364, generalSpace + 16, { align: "left" })
    .rect(358, generalSpace + 10, 60, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("V. SERVICIO", 426, generalSpace + 16, { align: "left" })
    .rect(420, generalSpace + 10, 57, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("V. PAGADO", 485, generalSpace + 16, { align: "left", width: 200, lineBreak: false })
    .rect(479, generalSpace + 10, 54, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("SALDO", 540, generalSpace + 16, { align: "left", width: 200, lineBreak: false })
    .rect(535, generalSpace + 10, 40, 17)
    .fillColor('grey', 0.14)
    .fillAndStroke();

  //----TABLA
  generalSpace += 20;

  doc.fontSize(8);
  doc.fillColor('#000', 0.9);
  doc
    .font("Helvetica")
    .text(!!cobranza ? cobranza.codigo : '', 45, generalSpace + 16, { align: "left" })
    .rect(40, generalSpace + 10, 100, 17)
    .fillColor('grey', 0)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!evaluacion ? evaluacion.fecha_evaluacion : '', 148, generalSpace + 16, { align: "left" })
    .rect(142, generalSpace + 10, 52, 17)
    .fillColor('grey', 0)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!CS ? CS.razon_social : '', 203, generalSpace + 16, { align: "left" })
    .rect(196, generalSpace + 10, 160, 17)
    .fillColor('grey', 0)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!CS ? CS.rut : '', 364, generalSpace + 16, { align: "left" })
    .rect(358, generalSpace + 10, 60, 17)
    .fillColor('grey', 0)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!reserva ? `$${MilesFormat(reserva.valor_servicio)}` : '', 426, generalSpace + 16, { align: "left" })
    .rect(420, generalSpace + 10, 57, 17)
    .fillColor('grey', 0)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!cobranza ? `$${MilesFormat(cobranza.valor_cancelado)}` : '', 485, generalSpace + 16, { align: "left", width: 200, lineBreak: false })
    .rect(479, generalSpace + 10, 54, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text(!!cobranza ? `$${MilesFormat(cobranza.valor_deuda)}` : '', 538, generalSpace + 16, { align: "left", width: 200, lineBreak: false })
    .rect(535, generalSpace + 10, 40, 17)
    .fillColor('grey', 0.04)
    .fillAndStroke();

  //--AGRADECIMIENTOS
  generalSpace += 50;

  doc.fontSize(10);
  doc.fillColor('#000', 0.75);
  doc
    .font("Helvetica")
    .text("Agradecemos su preferencia y no dude en comunicarse con nosotros ante cualquier duda o requerimiento.", 40, generalSpace, { align: "left" })
    .fillColor('grey', 0.24)

  //--FORMAS DE PAGO
  generalSpace += 30;

  doc.fontSize(10);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("FORMA DE PAGO", 123, generalSpace + 18, { align: "left", width: 200, lineBreak: false })
    .rect(40, generalSpace + 10, 250, 25)
    .fillColor('grey', 0.2)
    .fillAndStroke();

  generalSpace += 30;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("PARA EFECTO DE PAGOS DE SERVICIOS, LA CUENTA CORRIENTE ASOCIADA AL RUT A LA QUE DEBE REALIZAR TRANSFERENCIAS Y DEPOSITOS ES:", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 40;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("CUENTA CORRIENTE N°78350350", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 10;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("BANCO SANTANDER", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 10;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("A NOMBRE DE: ASIS CONSULTORES SPA", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 10;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("RUT 77.249.223-5", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 25;

  doc.fontSize(8);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("ENVIAR COMPROBANTE DE PAGO A", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("finanzas@asisconsultores.cl", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 10;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("knunez@asisconsultores.cl", 40, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace -= 147;

  doc.fontSize(10);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica-Bold")
    .text("ORDEN DE TRABAJO", 393, generalSpace + 18, { align: "left", width: 200, lineBreak: false })
    .rect(320, generalSpace + 10, 250, 25)
    .fillColor('grey', 0.2)
    .fillAndStroke();

  generalSpace += 30;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("Razón: ASIS CONSULTORES SPA", 321, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("RUT: 77.249.223-5", 321, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("Giro: Servicios en asesorías, capacitación y exámenes de salud.", 321, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("Direccion: Blas Vial N°320 Salamanca, Fono: 053-2551499", 321, generalSpace + 16, { align: "left", width: 260, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("Av. Ignacio Silva 98, Oficinas 02 y 03, Illapel, Fono: +569 991283495 / 053-2521964", 362, generalSpace + 16, { align: "left", width: 200, lineBreak: false })
    .fillColor('grey', 0.04)

  //-- FOOTER
  generalSpace += 140;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("EMPRESA CERTIFICADA NORMA DE CALIDAD ISO 9001-2015", 40, generalSpace + 16, { align: "center", width: 545, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("BLAS VIAL N°320, SALAMANCA, FONO: 053-2551499 / AV. IGNACIO SILVA N°98 OF. 02 Y 03", 40, generalSpace + 16, { align: "center", width: 545, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("EDIFICIO MARAY, ILLAPEL FONO: 53-2521964 CEL 09-1283495", 40, generalSpace + 16, { align: "center", width: 545, lineBreak: false })
    .fillColor('grey', 0.04)

  generalSpace += 12;

  doc.fontSize(9);
  doc.fillColor('#000', 1);
  doc
    .font("Helvetica")
    .text("Página Web www.asisconsultores.cl E-MAIL examenes@asisconsultores.cl", 40, generalSpace + 16, { align: "center", width: 545, lineBreak: false })
    .fillColor('grey', 0.04)

  doc.end();
};
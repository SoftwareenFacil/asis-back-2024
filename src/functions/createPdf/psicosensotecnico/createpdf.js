var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");

import { generalInformation, resultadosEvaluaciones, piePageOne, examenesSensometricos, examenesPsicotecnicos, testEspeVelReaccion, examenSomnolencia, testPsicologico, testToleranciaMonotonia, testReacMultiples, testConoTransitoNacional } from "./constant";

export default function createPdf() {
    const doc = new PDF();
    let generalSpace = 30;
    let horizontalSpace = 0;
    let moreSpace = 0;

    //--------------------------------------------------PDF----------------------------------------

    //--Logo
    doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/example.pdf"));
    doc.image(path.resolve("./") + "/uploads/asis_logo.png", 225, generalSpace, {
        fit: [155, 155],
        align: "center",
        valign: "start",
    });

    generalSpace += 70;

    //--Titulo
    doc.fontSize(10);
    doc
        .font("Helvetica-Bold")
        .text("INFORME PSICOSENSOTECNICO RIGUROSO", 60, generalSpace, { align: "center" })
        .rect(80, 92, 450, 25)
        .fillColor('grey', 0.14)
        .fillAndStroke();
    doc.fontSize(10);

    generalSpace += 35;

    //-- Informacion general
    doc.fontSize(9);
    doc.fillColor('#000', 1);
    generalInformation.forEach(function (e) {
        doc.lineJoin("miter").rect(30, generalSpace, 200, 15).stroke();
        doc.lineJoin("miter").rect(230, generalSpace, 330, 15).stroke();
        doc
            .font("Helvetica-Bold")
            .text(e, 35, generalSpace + 4, { align: "left" });

        generalSpace += 15;
    });

    generalSpace += 25;

    //-- Resumen evaluaciones
    doc.fontSize(10);
    doc
        .font("Helvetica-Bold")
        .text("RESUMEN EVALUACIONES", 60, generalSpace + 8, { align: "center" })
        .rect(80, generalSpace, 450, 25)
        .fillColor('grey', 0.17)
        .fillAndStroke();

    generalSpace += 40;

    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text("EVALUACIONES", 104, generalSpace + 4)
        .rect(30, generalSpace, 230, 15)
        .fillColor('grey', 0.17)
        .fillAndStroke();
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text("RESULTADO", 280, generalSpace + 4)
        .rect(260, generalSpace, 100, 15)
        .fillColor('grey', 0.17)
        .fillAndStroke();
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text("OBSERVACIONES", 418, generalSpace + 4)
        .rect(360, generalSpace, 200, 15)
        .fillColor('grey', 0.17)
        .fillAndStroke();

    generalSpace += 15;

    doc.fontSize(9);

    resultadosEvaluaciones.forEach(function (e) {
        doc.lineJoin("miter").rect(30, generalSpace, 230, 20).stroke();
        doc.lineJoin("miter").rect(260, generalSpace, 100, 20).stroke();
        doc.lineJoin("miter").rect(360, generalSpace, 200, 20).stroke();

        doc.fillColor('#000', 1);
        doc
            .font("Helvetica-Bold")
            .text(e.nombre, 35, generalSpace + 6, { align: "left" });

        generalSpace += 20;
    });

    generalSpace += 20;

    doc.fontSize(10);
    doc
        .font("Helvetica-Bold")
        .text("CONCLUSIÓN Y RECOMENDACIONES", 60, generalSpace + 8, { align: "center" })
        .rect(80, generalSpace, 450, 25)
        .fillColor('grey', 0.17)
        .fillAndStroke();

    generalSpace += 40;

    doc.lineJoin("miter").rect(30, generalSpace, 530, 55).stroke();

    generalSpace += 63;

    doc.fontSize(7);

    piePageOne.forEach(function (e) {
        doc.fillColor('#000', 1);
        doc
            .font("Helvetica")
            .text(e, 35, generalSpace, { align: "center", valign: 'end' });

        generalSpace += 8;
    });

    //-----------------------------------------------------------------------Página 2
    doc.addPage();

    doc.fontSize(10);
    generalSpace = 40;

    //---------------------- Examenes Sensometricos
    doc
        .font("Helvetica-Bold")
        .text("DETALLE DE EVALUACIONES", 60, generalSpace + 8, { align: "center" })
        .rect(80, generalSpace, 450, 25)
        .fillColor('grey', 0.17)
        .fillAndStroke();

    generalSpace += 40;

    doc.fontSize(9);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(examenesSensometricos.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 40)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 25;
    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(examenesSensometricos.descripcion, 35, generalSpace, { align: "center", valign: 'end' });

    generalSpace += 30;
    horizontalSpace = 48;
    doc.lineJoin("miter").rect(40, generalSpace, 80, 45).stroke();
    doc.lineJoin("miter").rect(135, generalSpace, 90, 45).stroke();
    doc.lineJoin("miter").rect(245, generalSpace, 90, 45).stroke();
    doc.lineJoin("miter").rect(355, generalSpace, 90, 45).stroke();
    doc.lineJoin("miter").rect(460, generalSpace, 90, 45).stroke();

    doc.fontSize(7);

    doc
        .font("Helvetica-Bold")
        .text('AGUDEZA VISUAL', horizontalSpace + 2, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('Monocular derecha', horizontalSpace, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 98;
    doc
        .font("Helvetica-Bold")
        .text('AGUDEZA VISUAL', horizontalSpace + 3, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('Monocular izquierda', horizontalSpace, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 110;
    doc
        .font("Helvetica-Bold")
        .text('AGUDEZA VISUAL', horizontalSpace + 3, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('Visión binocular', horizontalSpace + 5, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 120;
    doc
        .font("Helvetica-Bold")
        .text('PERIMETRÍA', horizontalSpace + 3, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('', horizontalSpace + 5, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 100;
    doc
        .font("Helvetica-Bold")
        .text('PROFUNDIDAD', horizontalSpace + 3, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('', horizontalSpace + 5, generalSpace + 18, { align: "left", valign: 'end' });

    generalSpace += 53;
    horizontalSpace = 43;

    doc.lineJoin("miter").rect(40, generalSpace, 80, 45).stroke();
    doc.lineJoin("miter").rect(132, generalSpace, 70, 45).stroke();
    doc.lineJoin("miter").rect(215, generalSpace, 75, 45).stroke();
    doc.lineJoin("miter").rect(305, generalSpace, 75, 45).stroke();
    doc.lineJoin("miter").rect(390, generalSpace, 75, 45).stroke();
    doc.lineJoin("miter").rect(475, generalSpace, 75, 45).stroke();

    doc
        .font("Helvetica-Bold")
        .text('DISCRIMINACIÓN DE', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('COLORES', horizontalSpace + 18, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 113;

    doc
        .font("Helvetica-Bold")
        .text('VISIÓN', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('NOCTURNA', horizontalSpace - 8, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 83;

    doc
        .font("Helvetica-Bold")
        .text('PHORIA', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('VERTICAL', horizontalSpace - 4, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 90;

    doc
        .font("Helvetica-Bold")
        .text('PHORIA', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('HORIZONTAL', horizontalSpace - 9, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 70;

    doc
        .font("Helvetica-Bold")
        .text('RECUPERACIÓN', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('ENCANDILAMIENTO', horizontalSpace - 6, generalSpace + 18, { align: "left", valign: 'end' });

    horizontalSpace += 88;

    doc
        .font("Helvetica-Bold")
        .text('AUDIOMETRIA', horizontalSpace, generalSpace + 8, { align: "left", valign: 'end' });
    doc
        .font("Helvetica-Bold")
        .text('', horizontalSpace - 6, generalSpace + 18, { align: "left", valign: 'end' });

    generalSpace += 56;

    // doc.fontSize(8);
    // doc.fillColor('#000', 1);
    // doc
    //     .font("Helvetica-Bold")
    //     .text('Observaciones', 30, generalSpace, { align: "left" });

    // generalSpace += 20;

    //-- Agudeza visual monocular derecha
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.AgudezaVisualMonoDer[0], 30, generalSpace, { align: "left" });

    // generalSpace += 15;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoDer[1], 60, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoDer[2], 60, generalSpace, { align: "left" });

    // generalSpace += 29;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoDer[3], 60, generalSpace, { align: "left" });

    // //-- Agudeza visual monocular izquierda
    // generalSpace += 25;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.AgudezaVisualMonoIzq[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoIzq[1], 60, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoIzq[2], 60, generalSpace, { align: "left" });

    // generalSpace += 30;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.AgudezaVisualMonoIzq[3], 60, generalSpace, { align: "left" });

    // //-- Agudeza visual binocular
    // generalSpace += 25;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.agudezaVisualBinocular[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.agudezaVisualBinocular[1], 60, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.agudezaVisualBinocular[2], 60, generalSpace, { align: "left" });

    // generalSpace += 28;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.agudezaVisualBinocular[3], 60, generalSpace, { align: "left" });

    // //-- Perimetria
    // generalSpace += 25;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.perimetria[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.perimetria[1], 60, generalSpace, { align: "left" });

    // generalSpace += 15;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.perimetria[2], 60, generalSpace, { align: "left" });

    // //-- Profundidad
    // generalSpace += 15;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.profundidad[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.profundidad[1], 60, generalSpace, { align: "left" });

    // generalSpace += 15;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.profundidad[2], 60, generalSpace, { align: "left" });

    // //-- Discriminacion de colores
    // generalSpace += 15;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.discriminacionColores[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.discriminacionColores[1], 60, generalSpace, { align: "left" });

    // generalSpace += 15;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.discriminacionColores[2], 60, generalSpace, { align: "left" });

    // //-- Vision nocturna
    // generalSpace += 15;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.visionNocturna[0], 30, generalSpace, { align: "left" });
    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.visionNocturna[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.visionNocturna[2], 60, generalSpace, { align: "left" });

    //-----------------------------------------------------------------------Página 3
    // doc.addPage();
    //-----------Phoria vertical
    // generalSpace = 15;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.phoriaVertical[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.phoriaVertical[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.phoriaVertical[2], 60, generalSpace, { align: "left" });

    // //-----------Phoria horizontal
    // generalSpace += 18;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.phoriaHorizontal[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.phoriaHorizontal[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.phoriaHorizontal[2], 60, generalSpace, { align: "left" });

    // //-----------Recuperacion encandilamiento
    // generalSpace += 18;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.recuperacionEncandilamiento[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.recuperacionEncandilamiento[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.recuperacionEncandilamiento[2], 60, generalSpace, { align: "left" });

    // //-----------Audiometria oido derecho
    // generalSpace += 18;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.audiometriaOidoDerecho[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoDerecho[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoDerecho[2], 60, generalSpace, { align: "left" });

    // generalSpace += 25;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoDerecho[3], 60, generalSpace, { align: "left" });

    // //-----------Audiometria oido izquierdo
    // generalSpace += 25;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.audiometriaOidoIzquierdo[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoIzquierdo[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoIzquierdo[2], 60, generalSpace, { align: "left" });

    // generalSpace += 25;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaOidoIzquierdo[3], 60, generalSpace, { align: "left" });

    // //-----------Audiometria ambos oidos
    // generalSpace += 25;
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesSensometricos.audiometriaAmbosOidos[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaAmbosOidos[1], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaAmbosOidos[2], 60, generalSpace, { align: "left" });

    // generalSpace += 25;
    // doc
    //     .font("Helvetica")
    //     .text('3.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesSensometricos.audiometriaAmbosOidos[3], 60, generalSpace, { align: "left" });

    //---------------------- Examenes Psicotecnicos
    doc.fontSize(9);
    generalSpace += 30;
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 50)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 25;
    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(examenesPsicotecnicos.descripcion, 60, generalSpace, { align: "left" });

    generalSpace += 30;
    // doc
    //     .font("Helvetica-Bold")
    //     .text('Observaciones', 60, generalSpace, { align: "left" });

    generalSpace += 15;
    doc.lineJoin("miter").rect(60, generalSpace, 90, 52).stroke();
    doc.lineJoin("miter").rect(200, generalSpace, 130, 52).stroke();
    doc.lineJoin("miter").rect(370, generalSpace, 160, 52).stroke();

    generalSpace += 10;
    doc.fontSize(7);
    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.tiempoReaccion[0], 67, generalSpace, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.tiempoReaccion[1], 83, generalSpace + 8, { align: "left" });

    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.coordBimanual[0], 220, generalSpace, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.coordBimanual[1], 235, generalSpace + 8, { align: "left" });

    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.presCoordVisomotriz[0], 378, generalSpace, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(examenesPsicotecnicos.presCoordVisomotriz[1], 420, generalSpace + 8, { align: "left" });

    //-----------Test de reaccion
    // generalSpace += 51;
    // doc.fontSize(8);
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesPsicotecnicos.tiempoReaccion[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.tiempoReaccion[2], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.tiempoReaccion[3], 60, generalSpace, { align: "left" });

    // //-----------Coordinacion bimanual
    // generalSpace += 20;
    // doc.fontSize(8);
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesPsicotecnicos.coordBimanual[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.coordBimanual[2], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.coordBimanual[3], 60, generalSpace, { align: "left" });

    // //-----------Precision y coordinacion visomotriz
    // generalSpace += 20;
    // doc.fontSize(8);
    // doc
    //     .font("Helvetica-Bold")
    //     .text(examenesPsicotecnicos.presCoordVisomotriz[0], 30, generalSpace, { align: "left" });

    // generalSpace += 20;
    // doc
    //     .font("Helvetica")
    //     .text('1.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.presCoordVisomotriz[2], 60, generalSpace, { align: "left" });

    // generalSpace += 14;
    // doc
    //     .font("Helvetica")
    //     .text('2.- ', 45, generalSpace, { align: "left" });
    // doc
    //     .font("Helvetica")
    //     .text(examenesPsicotecnicos.presCoordVisomotriz[3], 60, generalSpace, { align: "left" });

    doc.fontSize(9);
    generalSpace += 70;
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(testEspeVelReaccion.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 50)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 25;
    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(testEspeVelReaccion.descripcion, 60, generalSpace, { align: "left" });

    generalSpace += 35;
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text('', 60, generalSpace + 9, { align: "center" })
        .rect(30, generalSpace, 530, 25)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 28;
    doc.lineJoin("miter").rect(30, generalSpace, 530, 0.5, { align: "center" }).stroke();

    doc.fontSize(9);
    generalSpace += 30;
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(examenSomnolencia.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 50)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 25;
    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(examenSomnolencia.descripcion, 60, generalSpace, { align: "center" });

    generalSpace += 27;
    doc.lineJoin("miter").rect(30, generalSpace, 260, 23, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(290, generalSpace, 40, 23, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(330, generalSpace, 230, 23, { align: "center" }).stroke();

    doc.lineJoin("miter").rect(30, generalSpace + 23, 260, 23, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(290, generalSpace + 23, 40, 23, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(330, generalSpace + 23, 230, 23, { align: "center" }).stroke();

    doc.fontSize(7);
    doc
        .font("Helvetica-Bold")
        .text('PROBABILIDAD DE SOMNOLENCIA', 100, generalSpace + 8, { align: "left" });

    generalSpace += 23;

    doc
        .font("Helvetica-Bold")
        .text('TEST DE EPWORTH', 125, generalSpace + 8, { align: "left" });

    doc.addPage();

    generalSpace = 30;
    doc.fontSize(9);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(testPsicologico.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 60)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 25;
    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(testPsicologico.descripcion, 60, generalSpace, { align: "center" });

    generalSpace += 37;
    doc
        .font("Helvetica-Bold")
        .text('PERFIL PSICOLÓGICO', 42, generalSpace + 8, { align: "left" });
    doc.lineJoin("miter").rect(30, generalSpace, 530, 115, { align: "center" }).stroke();

    generalSpace += 140;
    doc.fontSize(9);
    doc
        .font("Helvetica-Bold")
        .text(testToleranciaMonotonia.titulo, 60, generalSpace + 8, { align: "center" });

    doc.lineJoin("miter").rect(30, generalSpace, 530, 60, { align: "center" }).stroke();

    doc
        .font("Helvetica")
        .text('Aprobado', 60, generalSpace + 20, { align: "center" });

    doc
        .font("Helvetica-Bold")
        .text('(60 aciertos/0 errores)', 60, generalSpace + 30, { align: "center" });

    generalSpace += 80;
    doc.fontSize(9);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(testReacMultiples.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 60)
        .fillColor('white', 0)
        .fillAndStroke();

    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(testReacMultiples.descripcion, 60, generalSpace + 30, { align: "center" });

    generalSpace += 65;
    doc.lineJoin("miter").rect(30, generalSpace, 530, 30, { align: "center" }).stroke();

    doc
        .font("Helvetica-Bold")
        .text('Resultado', 60, generalSpace + 5, { align: "center" });
    doc
        .font("Helvetica")
        .text('Aprobado', 60, generalSpace + 15, { align: "center" });

    generalSpace += 60;
    doc.fontSize(9);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text(testConoTransitoNacional.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 60)
        .fillColor('white', 0)
        .fillAndStroke();

    doc.fontSize(8);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(testConoTransitoNacional.descripcion, 60, generalSpace + 30, { align: "center" });

    generalSpace += 65;

    doc.lineJoin("miter").rect(45, generalSpace, 87, 40, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(140, generalSpace, 280, 40, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 30, 40, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(470, generalSpace, 70, 40, { align: "center" }).stroke();

    generalSpace += 6;

    doc.fontSize(7);
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica-Bold")
        .text('EXAMENES TEÓRICOS', 52, generalSpace, { align: "left" });

    doc
        .font("Helvetica-Bold")
        .text('DE TRÁNSITO', 66, generalSpace + 10, { align: "left" });

    doc
        .font("Helvetica-Bold")
        .text('APROBADO', 484, generalSpace + 10, { align: "left" });


    doc.text(piePageOne[0], 200, doc.page.height - 40, {
        lineBreak: false,
        align: 'center'
    });

    doc.text(piePageOne[1], 60, doc.page.height - 30, {
        lineBreak: false,
        align: 'center'
    });

    doc.text(piePageOne[2], 100, doc.page.height - 20, {
        lineBreak: false,
        align: 'center'
    });

    doc.end();
}
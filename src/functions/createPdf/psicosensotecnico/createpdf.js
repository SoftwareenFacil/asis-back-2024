var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");

import {
    generalInformation,
    signByAssigmentProfessional,
    resultadosEvaluaciones,
    piePageOne,
    examenesSensometricos,
    examenesPsicotecnicos,
    testEspeVelReaccion,
    examenSomnolencia,
    testPsicologico,
    testToleranciaMonotonia,
    testReacMultiples,
    testConoTransitoNacional,
    nameFirma
} from "./constant";

export default function createPdf(InformacionPersonal, evaluaciones, conclusion_recomendaciones, e_sensometricos, e_psicotecnicos, test_espe_vel_anticipacion, examen_somnolencia, test_psicologico,
    test_espe_tol_monotonia, test_espe_reac_multiples, test_conocimiento_ley_nacional, nombrePdf, nombreQR) {
    const doc = new PDF();
    let generalSpace = 30;
    let horizontalSpace = 0;
    let moreSpace = 0;

    const {
        empresa,
        nombre,
        rut,
        rut_evaluador,
        cargo_evaluador,
        fecha_nacimiento,
        cargo,
        licencia_acreditar,
        ley,
        vencimiento_licencia,
        observaciones_licencia,
        fecha_examen,
        resultado,
        restricciones,
        vencimiento,
        evaluador } = InformacionPersonal;

    //--------------------------------------------------PDF----------------------------------------

    //--Logo
    doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/" + nombrePdf));
    doc.image(path.resolve("./") + "/src/assets/img/asis_logo.png", 225, generalSpace, {
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

    generalSpace -= 206;

    doc
        .font("Helvetica")
        .text(evaluador, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(empresa, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(nombre, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(rut, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(fecha_nacimiento, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(cargo, 242, generalSpace - 1, { align: "left" });

    generalSpace += 15;

    if (licencia_acreditar && licencia_acreditar.length > 0) {
        let leftSpace = 242;
        let contador = 1;
        licencia_acreditar.forEach(element => {
            doc
                .font("Helvetica")
                .text(`${element}, `, leftSpace, generalSpace, { align: "left" });
            leftSpace += 15
        });
    }
    else {
        doc
            .font("Helvetica")
            .text(licencia_acreditar, 242, generalSpace, { align: "left" });
    }

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(ley !== '' ? ley : 'No Aplica', 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(vencimiento_licencia, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(observaciones_licencia, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(fecha_examen, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(resultado, 242, generalSpace, { align: "left" });

    generalSpace += 15;

    doc
        .font("Helvetica")
        .text(restricciones, 242, generalSpace, { align: "left" });

    generalSpace += 16;

    doc
        .font("Helvetica")
        .text(vencimiento, 242, generalSpace, { align: "left" });


    generalSpace += 20;

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

    generalSpace -= 153;

    //datos
    evaluaciones.forEach(function (element, index) {

        if (index < 4) {
            doc
                .font("Helvetica")
                .text(element.resultado, 278, generalSpace, { align: "left" });

            doc
                .font("Helvetica")
                .text(element.obs, 370, generalSpace, { align: "left" });
        }
        if (index >= 4) {
            if (element.active) {
                doc
                    .font("Helvetica")
                    .text(element.resultado, 278, generalSpace, { align: "left" });

                doc
                    .font("Helvetica")
                    .text(element.obs, 370, generalSpace, { align: "left" });
            }
            else {
                doc
                    .font("Helvetica")
                    .text('No Requerido', 278, generalSpace, { align: "left" });
                doc
                    .font("Helvetica")
                    .text('No Aplica', 370, generalSpace, { align: "left" });
            }
        }

        generalSpace += 20
    });

    generalSpace += 10;

    doc.fontSize(10);
    doc
        .font("Helvetica-Bold")
        .text("CONCLUSIÓN Y RECOMENDACIONES", 60, generalSpace + 8, { align: "center" })
        .rect(80, generalSpace, 450, 25)
        .fillColor('grey', 0.17)
        .fillAndStroke();

    generalSpace += 40;

    doc.lineJoin("miter").rect(30, generalSpace, 530, 55).stroke();
    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(conclusion_recomendaciones, 40, generalSpace + 5, { align: "left" });

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

    //--datos
    generalSpace -= 25;
    horizontalSpace = 60;

    doc.fontSize(9);
    doc
        .font("Helvetica")
        .text(e_sensometricos[0].resultado, horizontalSpace, generalSpace, { align: "left" });

    horizontalSpace += 100;

    doc
        .font("Helvetica")
        .text(e_sensometricos[1].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 110;

    doc
        .font("Helvetica")
        .text(e_sensometricos[2].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 110;

    doc
        .font("Helvetica")
        .text(e_sensometricos[3].resultado, horizontalSpace, generalSpace - 10, { align: "left", valign: 'end' });

    horizontalSpace += 105;

    doc
        .font("Helvetica")
        .text(e_sensometricos[4].resultado, horizontalSpace, generalSpace - 10, { align: "left", valign: 'end' });

    generalSpace += 53;
    horizontalSpace = 58;

    doc
        .font("Helvetica")
        .text(e_sensometricos[5].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 90;

    doc
        .font("Helvetica")
        .text(e_sensometricos[6].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 85;

    doc
        .font("Helvetica")
        .text(e_sensometricos[7].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 90;

    doc
        .font("Helvetica")
        .text(e_sensometricos[8].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 83;

    doc
        .font("Helvetica")
        .text(e_sensometricos[9].resultado, horizontalSpace, generalSpace, { align: "left", valign: 'end' });

    horizontalSpace += 84;

    doc
        .font("Helvetica")
        .text(e_sensometricos[9].resultado, horizontalSpace, generalSpace - 10, { align: "left", valign: 'end' });

    generalSpace += 56;


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

    //--datos
    doc.fontSize(9);
    generalSpace += 18;
    horizontalSpace = 0;

    doc
        .font("Helvetica")
        .text(e_psicotecnicos[0].resultado, horizontalSpace - 332, generalSpace, { align: "center" });
    doc
        .font("Helvetica")
        .text(e_psicotecnicos[0].promedio, horizontalSpace - 332, generalSpace + 9, { align: "center" });

    horizontalSpace += 160;
    doc
        .font("Helvetica")
        .text(e_psicotecnicos[1].resultado, horizontalSpace - 170, generalSpace, { align: "center" });
    doc
        .font("Helvetica")
        .text(e_psicotecnicos[1].promedio, horizontalSpace - 170, generalSpace + 9, { align: "center" });

    horizontalSpace += 190;
    doc
        .font("Helvetica")
        .text(e_psicotecnicos[2].resultado, horizontalSpace + 12, generalSpace, { align: "center" });
    doc
        .font("Helvetica")
        .text(e_psicotecnicos[2].promedio, horizontalSpace + 12, generalSpace + 9, { align: "center" });

    generalSpace += 52;
    const isRequired = (permision) => permision ? true : false;

    //-------------------------------------------------TEST ESPECIFICO VELOCIDAD DE ANTICIPACION
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
        .text(isRequired(test_espe_vel_anticipacion.active) ? test_espe_vel_anticipacion.resultado : 'No Requerido', 60, generalSpace + 9, { align: "center" })
        .rect(30, generalSpace, 530, 25)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 28;
    doc.lineJoin("miter").rect(30, generalSpace, 530, 0.5, { align: "center" }).stroke();

    //-------------------------------------------------EXAMEN DE SOMNOLENCIA
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

    doc.fontSize(8);
    doc
        .font("Helvetica-Bold")
        .text('PROBABILIDAD DE SOMNOLENCIA', 100, generalSpace + 8, { align: "left" });

    doc
        .font("Helvetica")
        .text(isRequired(examen_somnolencia.active) ? examen_somnolencia.probabilidad : 'No Requerido', 320, generalSpace + 8, { align: "center" });

    generalSpace += 23;

    doc
        .font("Helvetica-Bold")
        .text('TEST DE EPWORTH', 125, generalSpace + 8, { align: "left" });

    doc
        .font("Helvetica-Bold")
        .text(isRequired(examen_somnolencia.active) ? examen_somnolencia.punto : '0', 76, generalSpace + 8, { align: "center" });

    doc
        .font("Helvetica")
        .text(isRequired(examen_somnolencia.active) ? examen_somnolencia.epworth : 'No Requerido', 320, generalSpace + 8, { align: "center" });

    doc.addPage();
    doc.page.margins.bottom = 0;

    //------------------------------------------- TEST PSICOLOGICO
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

    doc.fillColor('#000', 1);
    doc
        .font("Helvetica")
        .text(isRequired(test_psicologico.active) ? test_psicologico.obs : 'No Requerido', 42, generalSpace + 22, { align: "left" })
        .rect(30, generalSpace, 530, 120)
        .fillColor('white', 0)
        .fillAndStroke();

    generalSpace += 145;
    doc.fillColor('#000', 1);

    //------------------------------------- TEST ESPECIFICO TOLERANCIA A LA MONOTIA
    doc.fontSize(9);
    doc
        .font("Helvetica-Bold")
        .text(testToleranciaMonotonia.titulo, 60, generalSpace + 8, { align: "center" });

    doc.lineJoin("miter").rect(30, generalSpace, 530, 60, { align: "center" }).stroke();

    doc
        .font("Helvetica")
        .text(isRequired(test_espe_tol_monotonia.active) ? test_espe_tol_monotonia.resultado : 'No Requerido', 60, generalSpace + 20, { align: "center" });

    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_espe_tol_monotonia.active) ? test_espe_tol_monotonia.aciertos : '', 60, generalSpace + 32, { align: "center" });

    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_espe_tol_monotonia.active) ? test_espe_tol_monotonia.obs : '', 60, generalSpace + 44, { align: "center" });

    //------------------------------------ TEST ESPECIFICO REACCIONES MULTIPLES
    generalSpace += 80;
    doc.fontSize(9);
    doc.fillColor('#000', 1);

    doc
        .font("Helvetica-Bold")
        .text(testReacMultiples.titulo, 60, generalSpace + 8, { align: "center" })
        .rect(30, generalSpace, 530, 60)
        .fillColor('white', 0)
        .fillAndStroke();

    doc.fontSize(9);
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
        .text(isRequired(test_espe_reac_multiples.active) ? test_espe_reac_multiples.resultado : 'No Requerido', 60, generalSpace + 15, { align: "center" });

    generalSpace += 60;
    doc.fontSize(9);
    doc.fillColor('#000', 1);

    //----------------------------------- TEST ESPECIFICO CONOCIMIENTO LEY DE TRANSITO

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

    //-- titulos examenes y cuadros
    doc.lineJoin("miter").rect(45, generalSpace, 87, 40, { align: "center" }).stroke();
    doc.lineJoin("miter")
        .rect(140, generalSpace, 200, 80, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(420, generalSpace, 40, 80, { align: "center" }).stroke();
    doc.lineJoin("miter").rect(480, generalSpace, 70, 80, { align: "center" }).stroke();


    generalSpace += 6;

    //------------- conocimientos
    doc
        .font("Helvetica")
        .text('Conocimientos legales', 150, generalSpace, { align: "left" });
    doc
        .font("Helvetica")
        .text('Conocimientos reglamentarios', 150, generalSpace + 15, { align: "left" });
    doc
        .font("Helvetica")
        .text('Conocimientos de mecánica', 150, generalSpace + 30, { align: "left" });
    doc
        .font("Helvetica")
        .text('Conocimientos de señales viales', 150, generalSpace + 45, { align: "left" });
    doc
        .font("Helvetica")
        .text('Conducta vial', 150, generalSpace + 60, { align: "left" });

    //------------- porcentajes

    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_conocimiento_ley_nacional.active) ? `${test_conocimiento_ley_nacional.porce_conocimientos_legales}%` : '0%', 434, generalSpace, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_conocimiento_ley_nacional.active) ? `${test_conocimiento_ley_nacional.porce_conocimientos_reglamentarios}%` : '0%', 434, generalSpace + 15, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_conocimiento_ley_nacional.active) ? `${test_conocimiento_ley_nacional.porce_conocimientos_mecanica}%` : '0%', 434, generalSpace + 30, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_conocimiento_ley_nacional.active) ? `${test_conocimiento_ley_nacional.porce_conocimientos_senales_viales}%` : '0%', 434, generalSpace + 45, { align: "left" });
    doc
        .font("Helvetica-Bold")
        .text(isRequired(test_conocimiento_ley_nacional.active) ? `${test_conocimiento_ley_nacional.porce_conducta_vial}%` : '0%', 434, generalSpace + 60, { align: "left" });

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
        .text(isRequired(test_conocimiento_ley_nacional.active) ? test_conocimiento_ley_nacional.resultado : 'No Requerido', 497, generalSpace + 30, { align: "left" });


    //--QR code
    doc.image(nombreQR, 410, generalSpace + 98, {
        fit: [100, 100],
        align: "right",
        valign: "center",
    });

    //------------------------------------------------------------ FIRMA -----------------------------------------------

    // const signSelected = signByAssigmentProfessional.find(el => el.rut === rut_evaluador);

    // generalSpace += 65;
    // moreSpace = 5
    // if (signSelected && Object.entries(signSelected).length > 0) {
    //     doc.image(path.resolve("./") + `/src/assets/img/${(signSelected && Object.entries(signSelected).length > 0) ? signSelected.sign : 'firma.jpeg'}`, 250, generalSpace + 22, {
    //         fit: [100, 100],
    //         align: "center",
    //         valign: "center",
    //     });
    // }

    generalSpace += 65;
    moreSpace = 5
    if (signSelected && Object.entries(signSelected).length > 0) {
        doc.image(path.resolve("./") + `/src/assets/img/firma_12398638-5.png`, 250, generalSpace + 22, {
            fit: [100, 100],
            align: "center",
            valign: "center",
        });
    }

    generalSpace += 110;
    doc
        .font("Helvetica-Bold")
        .text(evaluador && evaluador.toUpperCase(), 45, generalSpace + moreSpace, { align: "center" });

    moreSpace += 8;

    doc
        .font("Helvetica-Bold")
        .text(cargo_evaluador && cargo_evaluador.toUpperCase(), 45, generalSpace + moreSpace, { align: "center" });

    moreSpace += 8;

    nameFirma.forEach(function (elemento) {
        doc
            .font("Helvetica-Bold")
            .text(elemento, 45, generalSpace + moreSpace, { align: "center" });

        moreSpace += 8;
    });

    doc.fontSize(6);
    doc
        .font("Helvetica")
        .text(piePageOne[0], 0.5 * (doc.page.width - 200), doc.page.height - 42, { align: "center", width: 200, lineBreak: false });
    doc
        .font("Helvetica")
        .text(piePageOne[1], 0.5 * (doc.page.width - 430), doc.page.height - 34, { align: "center", width: 430, lineBreak: false });
    doc
        .font("Helvetica")
        .text(piePageOne[2], 0.5 * (doc.page.width - 340), doc.page.height - 26, { align: "center", width: 340, lineBreak: false });

    doc.end();
}
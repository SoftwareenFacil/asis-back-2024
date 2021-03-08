var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");
var base64 = require('base64-stream');

import {
  calculateIndicators,
  getResultsTest,
  getResultTest,
  finalResponseTest,
  testResult,
  paraPhrases,
  paraPhrasesTitles,
  getAverage,
  getAverageNumbers,
  footer,
  getFormatBar
} from "../../../functions/createPdf/aversionRiesgo/calculateResults";
import {
  titles,
  generalInformation,
  intelectual,
  adecuacionNormas,
  estabilidadEmocional,
  actPrevencionRiesgos,
  motivacionCargo,
  conclusion,
  nameFirma,
  signByAssigmentProfessional
} from "./constant";


//I - Analisis de indicadores
//AN - Adecuacion a las normas
//EE - Estabilidad emocional
//APR - Actitud a la prevencion de los riesgos
//MC - Motivacion por el cargo

export default function createPdf(
  I,
  AN,
  EE,
  APR,
  MC,
  conclusionRiesgos,
  informacionPersonal,
  nombrePdf,
  nombreQR,
  fecha_vigencia,
  observacionConclusion,
  TOTAL_I,
  TOTAL_AN,
  TOTAL_EE,
  TOTAL_APR,
  TOTAL_MC
) {
  //Intelectual
  const { razonamiento_abstracto, percepcion_concentracion, comprension_instrucciones } = I;
  const { acato_autoridad, relacion_grupo_pares, comportamiento_social } = AN;
  const { locus_control_impulsividad, manejo_frustracion, empatia, grado_ansiedad } = EE;
  const { actitud_prevencion_accidentes, confianza_acciones_realizadas, capacidad_modificar_ambiente_seguridad } = APR;
  const { orientacion_tarea, energia_vital } = MC;

  const { rut_evaluador } = informacionPersonal;

  let generalSpace = -15;
  let moreSpace = 5;
  let finalResults = [];
  let name = "";
  let weight = 1;
  let cantItems = 0;
  let results = [];
  let elecciones = ['Bajo', 'Promedio', 'Alto'];
  let fortalezas = [
    {
      id: 1,
      nombre: 'Intelectual',
      items: []
    },
    {
      id: 2,
      nombre: 'Adecuación a las Normas',
      items: []
    },
    {
      id: 3,
      nombre: 'Estabilidad emocional',
      items: []
    },
    {
      id: 4,
      nombre: 'Actitud a la prevención de los riesgos',
      items: []
    },
    {
      id: 5,
      nombre: 'Motivación por el cargo',
      items: []
    }
  ];
  let areas_mejorar = [
    {
      id: 1,
      nombre: 'Intelectual',
      items: []
    },
    {
      id: 2,
      nombre: 'Adecuación a las Normas',
      items: []
    },
    {
      id: 3,
      nombre: 'Estabilidad emocional',
      items: []
    },
    {
      id: 4,
      nombre: 'Actitud a la prevención de los riesgos',
      items: []
    },
    {
      id: 5,
      nombre: 'Motivación por el cargo',
      items: []
    }
  ];

  const doc = new PDF();

  //-----------------------------------------PDF------------------------------------------------

  doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/" + nombrePdf));

  //Insercion del logo y titulo
  doc.image(path.resolve("./") + "/src/assets/img/asis_logo.png", 225, generalSpace, {
    fit: [155, 155],
    align: "center",
    valign: "center",
  });
  generalSpace += 120;

  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("INFORME AVERSIÓN AL RIESGO", 60, generalSpace, { align: "center" });
  doc.fontSize(10);
  generalSpace += 25;
  doc
    .font("Helvetica-Bold")
    .text(`Este informe tiene vigencia hasta el ${fecha_vigencia}`, 60, generalSpace, {
      align: "right",
    })
    .rect(290, 125, 253, 20)
    .stroke();

  // 1.- Informacion personal
  doc.fontSize(9);
  generalSpace += 30;
  doc
    .font("Helvetica-Bold")
    .text("I    Información Personal", 60, generalSpace, { align: "left" });

  //2 .- Creacion de tabla para informacion general
  generalSpace += 15;
  generalInformation.forEach(function (e) {
    doc.lineJoin("miter").rect(50, generalSpace, 200, 15).stroke();
    doc.font("Helvetica-Bold").text(e, 60, generalSpace + 4, { align: "left" });
    doc.lineJoin("miter").rect(250, generalSpace, 310, 15).stroke();

    generalSpace += 15;
  });

  generalSpace -= 135;
  doc.font("Helvetica").text(informacionPersonal.empresa, 260, generalSpace - 25, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.nombre, 260, generalSpace - 10, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.edad, 260, generalSpace + 5, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.rut, 260, generalSpace + 20, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.educacion, 260, generalSpace + 35, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.cargo, 260, generalSpace + 50, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.maquinarias_conducir, 260, generalSpace + 65, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.ciudad, 260, generalSpace + 80, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.evaluador, 260, generalSpace + 95, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.fecha_evaluacion, 260, generalSpace + 110, { align: "left" });
  doc.font("Helvetica").text(fecha_vigencia, 260, generalSpace + 125, { align: "left" });

  //-----------------------------------------------------GRAFICO DE RESULTADOS
  generalSpace += 145;
  let verticalSpace = 60;
  doc
    .font("Helvetica-Bold")
    .text("II    Gráfico", 60, generalSpace + 6, { align: "left" });
  doc.lineJoin("miter").rect(50, generalSpace, 510, 165).stroke();

  //------Ejes
  doc
    .lineJoin('miter')
    .rect(verticalSpace + 110, generalSpace + 20, 0.5, 120)
    .fill('#000')//y
  doc
    .lineJoin('miter')
    .rect(verticalSpace + 110, generalSpace + 140, 290, 0.5)
    .fill('#000')//x

  doc.fontSize(7)

  //------Eje Y
  //------Bajo
  doc
    .lineJoin('miter')
    .rect(verticalSpace + 105, generalSpace + 110, 10, 1)
    .fill('#000')
  doc
    .font("Helvetica-Bold")
    .text("Bajo", verticalSpace + 80, generalSpace + 108, { align: "left" })

  //------Promedio
  doc
    .lineJoin('miter')
    .rect(verticalSpace + 105, generalSpace + 70, 10, 1)
    .fill('#000')
  doc
    .font("Helvetica-Bold")
    .text("Promedio", verticalSpace + 65, generalSpace + 68, { align: "left" })

  //------Alto
  doc
    .lineJoin('miter')
    .rect(verticalSpace + 105, generalSpace + 30, 10, 1)
    .fill('#000')
  doc
    .font("Helvetica-Bold")
    .text("Alto", verticalSpace + 80, generalSpace + 28, { align: "left" })


  //------Resultados en barras
  let chartResults = getFormatBar(getResultTest(getAverage(Object.values(I))));

  doc
    .rect(verticalSpace + chartResults.vertical, generalSpace + chartResults.space, 20, chartResults.height)
  doc.fill(chartResults.color);
  doc.fill('#000')
  doc
    .font("Helvetica")
    .text("Intelectual", 183, generalSpace + 145, { align: "left" })

  verticalSpace += 60
  chartResults = getFormatBar(getResultTest(getAverage(Object.values(AN))));
  doc
    .rect(verticalSpace + chartResults.vertical, generalSpace + chartResults.space, 20, chartResults.height)
  doc.fill(chartResults.color);
  doc.fill('#000')
  doc
    .font("Helvetica")
    .text("Adecuación", 240, generalSpace + 145, { align: "left" })
  doc
    .text("a las Normas", 238, generalSpace + 152, { align: "left" })

  verticalSpace += 60
  chartResults = getFormatBar(getResultTest(getAverage(Object.values(EE))));
  doc
    .rect(verticalSpace + chartResults.vertical, generalSpace + chartResults.space, 20, chartResults.height)
  doc.fill(chartResults.color);
  doc.fill('#000')
  doc
    .font("Helvetica")
    .text("Estabilidad", 300, generalSpace + 145, { align: "left" })
  doc
    .text("Emocional", 302, generalSpace + 152, { align: "left" })

  verticalSpace += 60
  chartResults = getFormatBar(getResultTest(getAverage(Object.values(APR))));
  doc
    .rect(verticalSpace + chartResults.vertical, generalSpace + chartResults.space, 20, chartResults.height)
  doc.fill(chartResults.color);
  doc.fontSize(6)
  doc.fill('#000')
  doc
    .font("Helvetica")
    .text("Actitud a la", 367, generalSpace + 145, { align: "left" })
  doc
    .text("Prevención de Riesgos", 348, generalSpace + 152, { align: "left" })
  doc.fontSize(7)

  verticalSpace += 60
  chartResults = getFormatBar(getResultTest(getAverage(Object.values(MC))));
  doc
    .rect(verticalSpace + chartResults.vertical, generalSpace + chartResults.space, 20, chartResults.height)
  doc.fill(chartResults.color);
  doc.fill('#000')
  doc
    .font("Helvetica")
    .text("Motivación", 423, generalSpace + 145, { align: "left" })
  doc
    .text("por el Cargo", 421, generalSpace + 152, { align: "left" })


  //-----------------------------------------------------CUADRO RESUMEN
  doc.fill('black')
  generalSpace += 170;
  doc
    .font("Helvetica-Bold")
    .text("III    Cuadro resumen", 60, generalSpace + 6, { align: "left" });

  //----pintar cada cuadro del resumen 
  doc.lineJoin("miter").rect(50, generalSpace, 510, 20).stroke();

  doc.lineJoin("miter").rect(50, generalSpace + 20, 135, 35).stroke();
  doc.lineJoin("miter").rect(185, generalSpace + 20, 375, 35).stroke();
  doc.lineJoin("miter").rect(50, generalSpace + 55, 135, 36).stroke();
  doc.lineJoin("miter").rect(185, generalSpace + 55, 375, 36).stroke();
  doc.lineJoin("miter").rect(50, generalSpace + 91, 135, 36).stroke();
  doc.lineJoin("miter").rect(185, generalSpace + 91, 375, 36).stroke();
  doc.lineJoin("miter").rect(50, generalSpace + 127, 135, 45).stroke();
  doc.lineJoin("miter").rect(185, generalSpace + 127, 375, 45).stroke();
  doc.lineJoin("miter").rect(50, generalSpace + 172, 135, 40).stroke();
  doc.lineJoin("miter").rect(185, generalSpace + 172, 375, 40).stroke();

  generalSpace += 7;

  //.-------intelectual
  doc.fontSize(8);
  doc
    .font("Helvetica-Bold")
    .text("Intelectual ", 85, generalSpace + 28, { align: "left" });
  doc
    .font("Helvetica")
    .text(`${getResultTest(TOTAL_I.reduce((acc, el) => acc + el) / TOTAL_I.length)} - ${paraPhrasesTitles(0, getAverageNumbers(getResultTest(getAverage(Object.values(I)))))}`, 200, generalSpace + 20, { align: "left", width: 360 });
  generalSpace += 40;
  //.-------adecuacion a las normas
  doc
    .font("Helvetica-Bold")
    .text("Adecuacion a las normas ", 63, generalSpace + 25, { align: "left" });
  doc
    .font("Helvetica")
    .text(`${getResultTest(TOTAL_AN.reduce((acc, el) => acc + el) / TOTAL_AN.length)} - ${paraPhrasesTitles(1, getAverageNumbers(getResultTest(getAverage(Object.values(AN)))))}`, 200, generalSpace + 20, { align: "left", width: 360 });

  generalSpace += 30;
  //.-------estabilidad emocional
  doc
    .font("Helvetica-Bold")
    .text("Estabilidad Emocional ", 65, generalSpace + 30, { align: "left" });
  doc
    .font("Helvetica")
    .text(`${getResultTest(TOTAL_EE.reduce((acc, el) => acc + el) / TOTAL_EE.length)} - ${paraPhrasesTitles(2, getAverageNumbers(getResultTest(getAverage(Object.values(EE)))))}`, 200, generalSpace + 23, { align: "left", width: 360 });

  generalSpace += 30;
  //.-------Actitud a la Prevensión de los Riesgos
  doc
    .font("Helvetica-Bold")
    .text("Actitud a la Prevención ", 65, generalSpace + 30, { align: "left" });
  doc
    .font("Helvetica-Bold")
    .text("de los Riesgos ", 65, generalSpace + 40, { align: "left" });
  doc
    .font("Helvetica")
    .text(`${getResultTest(TOTAL_APR.reduce((acc, el) => acc + el) / TOTAL_APR.length)} - ${paraPhrasesTitles(3, getAverageNumbers(getResultTest(getAverage(Object.values(APR)))))}`, 200, generalSpace + 30, { align: "left", width: 360 });

  generalSpace += 52;
  //.-------Motivación por el cargo
  doc
    .font("Helvetica-Bold")
    .text("Motivación por el cargo ", 65, generalSpace + 20, { align: "left" });
  doc
    .font("Helvetica")
    .text(`${getResultTest(TOTAL_MC.reduce((acc, el) => acc + el) / TOTAL_MC.length)} - ${paraPhrasesTitles(4, getAverageNumbers(getResultTest(getAverage(Object.values(MC)))))}`, 200, generalSpace + 20, { align: "left" });


  // doc.lineJoin("miter").rect(50, generalSpace, 510, 160).stroke();

  //---------------------------------------------------------------------------------------------------- PAGE 2
  doc.addPage();
  generalSpace = 10;

  //4 .- Analisis de indicadores
  doc.fontSize(9);
  generalSpace += 20;
  doc
    .font("Helvetica-Bold")
    .text("IV    Análisis de Indicadores", 60, generalSpace, { align: "left" });

  //4.- Creacion cuadros de tablas de analisis de indicadores
  //--------------------------------------------------------------------Intelectual
  generalSpace += 20;
  name = "intelectual";

  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Intelectual", 100, generalSpace + 25, { align: "left" });

  //----cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 60).stroke();
  //-----------
  //----cabeceras
  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
  //------------
  //--------textos cabeceras
  doc
    .font("Helvetica-Bold")
    .text(titles[0], 35, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[1], 250, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[2], 390, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[3], 515, generalSpace + 4, { align: "center" });
  //-------------
  intelectual.forEach(function (e) {
    generalSpace += 15;

    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();

    doc
      .font("Helvetica")
      .text(e.name, 210, generalSpace + 3, { align: "left" });
  });

  generalSpace -= 30;

  //----marcas de resultado
  switch (razonamiento_abstracto.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push(`Razonamiento abstracto: ${elecciones[0]} - ${paraPhrases[0].descriptions[0]}`);
      results.push(1);
      break;

    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Razonamiento abstracto: ${elecciones[1]} - ${paraPhrases[0].descriptions[1]}`);
      results.push(2);
      break;

    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Razonamiento abstracto: ${elecciones[2]} - ${paraPhrases[0].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (percepcion_concentracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push(`Percepción y concentración: ${elecciones[0]} - ${paraPhrases[1].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Percepción y concentración: ${elecciones[1]} - ${paraPhrases[1].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Percepción y concentración: ${elecciones[2]} - ${paraPhrases[1].descriptions[2]}`);
      results.push(3);
      break;
  }
  cantItems++;
  generalSpace += 15;

  switch (comprension_instrucciones.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push(`Comprensión de instrucciones: ${elecciones[0]} - ${paraPhrases[2].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Comprensión de instrucciones: ${elecciones[1]} - ${paraPhrases[2].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push(`Comprensión de instrucciones: ${elecciones[2]} - ${paraPhrases[2].descriptions[2]}`);
      results.push(3);
      break;
  }
  cantItems++;


  finalResults.push({
    name,
    weight,
    cantItems,
    results
  });

  cantItems = 0;
  results = [];

  //--------------------------------------------------------------------Adecuacion a las normas
  name = "adecuacion normas"
  generalSpace += 36;
  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Adecuación a las Normas", 63, generalSpace + 25, { align: "left" });

  //----cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 60).stroke();
  //-----------------
  //----cabeceras
  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
  //------------
  //--------textos cabeceras
  doc
    .font("Helvetica-Bold")
    .text(titles[0], 35, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[1], 250, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[2], 390, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[3], 515, generalSpace + 4, { align: "center" });
  //-------------
  adecuacionNormas.forEach(function (e) {
    generalSpace += 15;

    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();

    doc
      .font("Helvetica")
      .text(e.name, 210, generalSpace + 3, { align: "left" });

  });

  generalSpace -= 30;

  switch (acato_autoridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push(`Acato a la autoridad: ${elecciones[0]} - ${paraPhrases[3].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Acato a la autoridad: ${elecciones[1]} - ${paraPhrases[3].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Acato a la autoridad: ${elecciones[2]} - ${paraPhrases[3].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (relacion_grupo_pares.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push(`Relación con grupos de pares: ${elecciones[0]} - ${paraPhrases[4].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Relación con grupos de pares: ${elecciones[1]} - ${paraPhrases[4].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Relación con grupos de pares: ${elecciones[2]} - ${paraPhrases[4].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (comportamiento_social.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push(`Comportamiento social: ${elecciones[0]} - ${paraPhrases[5].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Comportamiento social: ${elecciones[1]} - ${paraPhrases[5].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push(`Comportamiento social: ${elecciones[2]} - ${paraPhrases[5].descriptions[2]}`);
      results.push(3);
      break;
  }
  cantItems++;

  finalResults.push({
    name,
    weight,
    cantItems,
    results
  });

  cantItems = 0;
  results = [];

  //--------------------------------------------------------------------Estabilidad emocional
  name = "estabilidad emocional";
  generalSpace += 36;
  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Estabilidad emocional", 72, generalSpace + 30, { align: "left" });

  //-- cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 75).stroke();
  //-------
  //----cabeceras
  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
  //------------
  //--------textos cabeceras
  doc
    .font("Helvetica-Bold")
    .text(titles[0], 35, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[1], 250, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[2], 390, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[3], 515, generalSpace + 4, { align: "center" });
  //-------------
  estabilidadEmocional.forEach(function (e) {
    generalSpace += 15;

    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();

    doc
      .font("Helvetica")
      .text(e.name, 210, generalSpace + 3, { align: "left" });
  });

  generalSpace -= 45;

  switch (locus_control_impulsividad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push(`Locus de control / impulsivilidad: ${elecciones[0]} - ${paraPhrases[6].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Locus de control / impulsivilidad: ${elecciones[1]} - ${paraPhrases[6].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Locus de control / impulsivilidad: ${elecciones[2]} - ${paraPhrases[6].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (manejo_frustracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push(`Manejo de la frustración: ${elecciones[0]} - ${paraPhrases[7].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Manejo de la frustración: ${elecciones[1]} - ${paraPhrases[7].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Manejo de la frustración: ${elecciones[2]} - ${paraPhrases[7].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (empatia.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push(`Empatía: ${elecciones[0]} - ${paraPhrases[8].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Empatía: ${elecciones[1]} - ${paraPhrases[8].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Empatía: ${elecciones[2]} - ${paraPhrases[8].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (grado_ansiedad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push(`Grado de ansiedad: ${elecciones[0]} - ${paraPhrases[9].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Grado de ansiedad: ${elecciones[1]} - ${paraPhrases[9].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push(`Grado de ansiedad: ${elecciones[2]} - ${paraPhrases[9].descriptions[2]}`);
      results.push(3);
      break;
  }
  cantItems++;

  finalResults.push({
    name,
    weight,
    cantItems,
    results
  });

  cantItems = 0;
  results = [];

  //--------------------------------------------------------------------Actitud a la prevencion de los riesgos
  name = "actitud prevención de riesgos"
  generalSpace += 35;
  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Actitud a la prevención", 72, generalSpace + 35, { align: "left" });
  doc
    .font("Helvetica-Bold")
    .text("de los riesgos", 90, generalSpace + 47, { align: "left" });

  //-- cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 135).stroke();
  //----------
  //----cabeceras
  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
  //------------
  //--------textos cabeceras
  doc
    .font("Helvetica-Bold")
    .text(titles[0], 35, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[1], 250, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[2], 390, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[3], 515, generalSpace + 4, { align: "center" });
  //-------------
  generalSpace += 15;
  actPrevencionRiesgos.forEach(function (e) {
    doc.lineJoin("miter").rect(200, generalSpace, 160, 40).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 40).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 40).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 40).stroke();

    let moreSpace = 5;
    e.name.forEach(function (n) {
      doc
        .font("Helvetica")
        .text(n, 210, generalSpace + moreSpace, { align: "left" });
      moreSpace += 9;
    });

    generalSpace += 40;
  });

  generalSpace -= 110;

  switch (actitud_prevencion_accidentes.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[3].items.push(`Actitud general hacia la prevención de accidentes de trabajo: ${elecciones[0]} - ${paraPhrases[10].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push(`Actitud general hacia la prevención de accidentes de trabajo: ${elecciones[1]} - ${paraPhrases[10].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push(`Actitud general hacia la prevención de accidentes de trabajo: ${elecciones[2]} - ${paraPhrases[10].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 40;

  switch (confianza_acciones_realizadas.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[3].items.push(`Confianza en acciones realizadas: ${elecciones[0]} - ${paraPhrases[11].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push(`Confianza en acciones realizadas: ${elecciones[1]} - ${paraPhrases[11].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push(`Confianza en acciones realizadas: ${elecciones[2]} - ${paraPhrases[11].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;

  // generalSpace += 30;
  // doc.fontSize(9);
  // doc.lineJoin("miter").rect(50, generalSpace, 510, 30).stroke();
  // //----------
  // actPrevencionRiesgosTwo.forEach(function (e) {
  //   doc.lineJoin("miter").rect(200, generalSpace, 160, 30).stroke();

  //   doc.lineJoin("miter").rect(360, generalSpace, 70, 30).stroke();

  //   doc.lineJoin("miter").rect(430, generalSpace, 70, 30).stroke();

  //   doc.lineJoin("miter").rect(500, generalSpace, 60, 30).stroke();

  //   e.name.forEach(function (n) {
  //     doc
  //       .font("Helvetica")
  //       .text(n, 210, generalSpace + moreSpace, { align: "left" });
  //     moreSpace += 10;
  //   });

  //   generalSpace += 40;
  // });

  // generalSpace -= 40;

  generalSpace += 40;

  switch (capacidad_modificar_ambiente_seguridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 12, { align: "left" });
      areas_mejorar[3].items.push(`Capacidad para modificar el ambiente a favor de la seguridad ${elecciones[0]} - ${paraPhrases[12].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 12, { align: "left" });
      fortalezas[3].items.push(`Capacidad para modificar el ambiente a favor de la seguridad ${elecciones[1]} - ${paraPhrases[12].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 12, { align: "left" });
      fortalezas[3].items.push(`Capacidad para modificar el ambiente a favor de la seguridad ${elecciones[2]} - ${paraPhrases[12].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 40;

  finalResults.push({
    name,
    weight,
    cantItems,
    results
  });

  cantItems = 0;
  results = [];

  //--------------------------------------------------------------------Motivacion por el cargo
  name = "motivacion por cargo"
  generalSpace += 8;
  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Motivación por el cargo", 72, generalSpace + 20, { align: "left" });

  //-- cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 45).stroke();
  //-------------
  //----cabeceras
  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
  //------------
  //--------textos cabeceras
  doc
    .font("Helvetica-Bold")
    .text(titles[0], 35, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[1], 250, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[2], 390, generalSpace + 4, { align: "center" });
  doc
    .font("Helvetica-Bold")
    .text(titles[3], 515, generalSpace + 4, { align: "center" });
  //-------------
  motivacionCargo.forEach(function (e) {
    generalSpace += 15;

    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();

    doc
      .font("Helvetica")
      .text(e.name, 210, generalSpace + 3, { align: "left" });
  });

  generalSpace -= 15;

  switch (orientacion_tarea.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[4].items.push(`Orientación a la tarea: ${elecciones[0]} - ${paraPhrases[13].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push(`Orientación a la tarea: ${elecciones[1]} - ${paraPhrases[13].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push(`Orientación a la tarea: ${elecciones[2]} - ${paraPhrases[13].descriptions[2]}`);
      results.push(3);
      break;
  }

  cantItems++;
  generalSpace += 15;

  switch (energia_vital.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[4].items.push(`Energia vital: ${elecciones[0]} - ${paraPhrases[14].descriptions[0]}`);
      results.push(1);
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push(`Energia vital: ${elecciones[1]} - ${paraPhrases[14].descriptions[1]}`);
      results.push(2);
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push(`Energia vital: ${elecciones[2]} - ${paraPhrases[14].descriptions[2]}`);
      results.push(3);
      break;
  }
  cantItems++;

  finalResults.push({
    name,
    weight,
    cantItems,
    results
  });

  cantItems = 0;
  results = [];

  //------------------Resultados de los calculos
  // const numberResults = calculateIndicators(finalResults);
  // const preResults = getResultsTest(numberResults);
  // const resultBajo = finalResponseTest(preResults, 'bajo');
  // const resultPromedio = finalResponseTest(preResults, 'promedio');
  // const resultAlto = finalResponseTest(preResults, 'alto');
  // const numberConclusion = finalResponseTest(preResults, 'bajo');
  const result_I = TOTAL_I.reduce((acc, el) => acc + el) / TOTAL_I.length;
  const result_AN = TOTAL_AN.reduce((acc, el) => acc + el) / TOTAL_AN.length;
  const result_EE = TOTAL_EE.reduce((acc, el) => acc + el) / TOTAL_EE.length;
  const result_APR = TOTAL_APR.reduce((acc, el) => acc + el) / TOTAL_APR.length;
  const result_MC = TOTAL_MC.reduce((acc, el) => acc + el) / TOTAL_MC.length;

  console.log('I', TOTAL_I.reduce((acc, el) => acc + el))
  console.log('AN', TOTAL_AN.reduce((acc, el) => acc + el))
  console.log('EE', TOTAL_EE.reduce((acc, el) => acc + el))
  console.log('APR', TOTAL_APR.reduce((acc, el) => acc + el))
  console.log('MC', TOTAL_MC.reduce((acc, el) => acc + el))

  console.log('I LENGTH', TOTAL_I.length)
  console.log('AN LENGTH', TOTAL_AN.length)
  console.log('EE LENGTH', TOTAL_EE.length)
  console.log('APR LENGTH', TOTAL_APR.length)
  console.log('MC LENGTH', TOTAL_MC.length)

  console.log('I SUB TOTAL', TOTAL_I.reduce((acc, el) => acc + el) / TOTAL_I.length)
  console.log('AN SUB TOTAL', TOTAL_AN.reduce((acc, el) => acc + el) / TOTAL_AN.length)
  console.log('EE SUB TOTAL', TOTAL_EE.reduce((acc, el) => acc + el) / TOTAL_EE.length)
  console.log('APR SUB TOTAL', TOTAL_APR.reduce((acc, el) => acc + el) / TOTAL_APR.length)
  console.log('MC SUB TOTAL', TOTAL_MC.reduce((acc, el) => acc + el) / TOTAL_MC.length)

  console.log('result', [(result_I + result_AN + result_EE + result_APR + result_MC) / 5])

  const finalDecision = testResult((result_I + result_AN + result_EE + result_APR + result_MC) / 5);
  //------------------------------------------------------------------------------------------ PAGE 3
  doc.addPage();
  generalSpace = 10;

  //----------------------------------------------------------------- Analisis cualitativo
  //----------------FORTALEZAS
  let heightCuantitativo = 22;
  let spaceCuantitativo = 77;

  doc.fontSize(9);
  generalSpace += 30;
  doc
    .font("Helvetica-Bold")
    .text("V    Análisis cualitativo", 60, generalSpace, { align: "left" });

  generalSpace += 20;
  //----cabecera
  doc.lineJoin("miter").rect(50, generalSpace, 510, 15).stroke();
  //titulo cabecera
  doc
    .font("Helvetica-Bold")
    .text('Fortalezas', 55, generalSpace + 4, { align: "left" });

  generalSpace += 20;
  moreSpace = 5;
  doc.fillColor('#000', 1);
  doc.fontSize(8);
  doc
    .font("Helvetica")
    .text('El evaluado presenta las siguientes fortalezas :', 60, generalSpace + 4, { align: "left" });

  generalSpace += 15;

  //--array fortalezas
  fortalezas.forEach(fortaleza => {
    if (fortaleza.items.length > 0) {
      generalSpace += 10;
      heightCuantitativo += 10;
      doc
        .font("Helvetica-Bold")
        .text(fortaleza.nombre, 60, generalSpace + 4, { align: "left" });


      generalSpace += 13;
      heightCuantitativo += 13;

      fortaleza.items.forEach((item, index) => {
        // generalSpace += 24;
        // heightCuantitativo += 24;

        doc
          .font("Helvetica")
          .text(`${index + 1} .- ${item}`, 60, generalSpace + 4, { align: "left", width: 496 });

        generalSpace += 25;
        heightCuantitativo += 25;
      });
    }
  });

  doc.lineJoin("miter").rect(50, spaceCuantitativo, 510, heightCuantitativo).stroke();


  //--AREAS A MEJORAR
  spaceCuantitativo += heightCuantitativo + 10;
  heightCuantitativo = 22;
  doc.lineJoin("miter").rect(50, spaceCuantitativo, 510, 15).stroke();
  doc
    .font("Helvetica-Bold")
    .text('Areas a mejorar', 55, spaceCuantitativo + 5, { align: "left" });

  spaceCuantitativo += 24;

  doc
    .font("Helvetica")
    .text('El evaluado presenta las siguientes areas a mejorar :', 60, spaceCuantitativo, { align: "left" });

  generalSpace += 40;

  areas_mejorar.forEach(area => {
    if (area.items.length > 0) {
      generalSpace += 10;
      heightCuantitativo += 10;
      doc
        .font("Helvetica-Bold")
        .text(area.nombre, 60, generalSpace + 4, { align: "left" });


      generalSpace += 13;
      heightCuantitativo += 13;

      area.items.forEach((item, index) => {
        doc
          .font("Helvetica")
          .text(`${index + 1} .- ${item}`, 60, generalSpace + 4, { align: "left", width: 496 });

        generalSpace += 25;
        heightCuantitativo += 25;
      });
    }
  });

  doc.lineJoin("miter").rect(50, spaceCuantitativo - 6, 510, heightCuantitativo).stroke();

  // generalSpace += 2;

  // spaceCuantitativo += heightCuantitativo + 300;





  //--------------------------------------------------------------------Conclusión
  doc.addPage();
  generalSpace = 20;
  doc
    .font("Helvetica-Bold")
    .text('VI    Conclusión', 60, generalSpace + 4, { align: "left" });

  generalSpace += 18;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 15).stroke();

  doc
    .font("Helvetica-Bold")
    .text('Observaciones', 55, generalSpace + 5, { align: "left" });

  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 130).stroke();

  doc
    .font("Helvetica")
    .text(observacionConclusion, 60, generalSpace + 23, { align: "left" });

  //----------------titulos
  generalSpace += 148;
  moreSpace = 5;

  doc.lineJoin("miter").rect(50, generalSpace + 2, 165, 50).stroke();
  doc.lineJoin("miter").rect(223, generalSpace + 2, 165, 50).stroke();
  doc.lineJoin("miter").rect(395, generalSpace + 2, 165, 50).stroke();

  conclusion.forEach(function (e) {

    e.name.forEach(function (n) {
      doc
        .font("Helvetica-Bold")
        .text(n, 75 + e.verticalSpace, generalSpace + 10 + moreSpace, { align: "left" });

      moreSpace += 10;
    })

    moreSpace = 5

  });

  //--------------respuestas
  generalSpace += 53;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 165, 15).stroke();
  doc.lineJoin("miter").rect(223, generalSpace + 2, 165, 15).stroke();
  doc.lineJoin("miter").rect(395, generalSpace + 2, 165, 15).stroke();

  // el original es finalDecision , pero por ahora esta estático con conclusionRiesgos

  console.log('++++++++++++++++++++ FINAL DESCITION +++++++++++++++++++')
  console.log(conclusionRiesgos)

  switch (conclusionRiesgos) {
    case 3:
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text('X', 130, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('black')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          width: 500,
          continued: true
        }).fillColor('black')
        .text(`SR./SRA ${informacionPersonal.nombre && informacionPersonal.nombre.toUpperCase()} ACTUALMENTE NO PRESENTA CONDUCTAS DE RIESGO desde el punto de vista psicológico.`)
        .fillColor('grey')
      // .text('desde el punto de vista psicológico');
      break;

    case 2:
      doc.fontSize(11);
      doc
        .font("Helvetica")
        .text('X', 300, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('black')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          width: 500,
          continued: true
        }).fillColor('black')
        .text(`SR./SRA ${informacionPersonal.nombre && informacionPersonal.nombre.toUpperCase()} ACTUALMENTE PRESENTA BAJAS CONDUCTAS DE RIESGO desde el punto de vista psicológico.`)
        .fillColor('grey')
      // .text('desde el punto de vista psicológico');
      break;

    case 1:
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text('X', 470, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('black')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          width: 500,
          continued: true
        }).fillColor('black')
        .text(`SR./SRA ${informacionPersonal.nombre && informacionPersonal.nombre.toUpperCase()} ACTUALMENTE PRESENTA ALTAS CONDUCTAS DE RIESGO desde el punto de vista psicológico.`)
        .fillColor('grey')
      // .text('desde el punto de vista psicológico');
      break;
  }

  generalSpace += 63;

  //------------------------------------------------------------ FIRMA -----------------------------------------------
  const signSelected = signByAssigmentProfessional.find(el => el.rut === rut_evaluador);

  if (signSelected && Object.entries(signSelected).length > 0) {
    doc.image(path.resolve("./") + `/src/assets/img/${(signSelected && Object.entries(signSelected).length > 0) ? signSelected.sign : 'firma.jpeg'}`, 250, generalSpace + 22, {
      fit: [100, 100],
      align: "center",
      valign: "center",
    });
  }

  generalSpace += 125;
  moreSpace = 5

  doc
    .font("Helvetica-Bold")
    .text(informacionPersonal.evaluador && informacionPersonal.evaluador.toUpperCase(), 70, generalSpace + moreSpace, { align: "center" });

  moreSpace += 13;

  doc
    .font("Helvetica-Bold")
    .text(informacionPersonal.cargo_evaluador && informacionPersonal.cargo_evaluador.toUpperCase(), 70, generalSpace + moreSpace, { align: "center" });

  moreSpace += 13;

  nameFirma.forEach(function (e) {
    doc
      .font("Helvetica-Bold")
      .text(e, 70, generalSpace + moreSpace, { align: "center" });

    moreSpace += 13;
  });

  generalSpace += moreSpace;

  //--QR code
  doc.image(nombreQR, 410, generalSpace - 80, {
    fit: [100, 100],
    align: "right",
    valign: "center",
  });

  doc.fontSize(6)
  doc
    .font("Helvetica-Bold")
    .text(footer, 60, generalSpace + 226, { align: "center", width: 510 });

  doc.end();
}

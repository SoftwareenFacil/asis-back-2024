var PDF = require("pdfkit");
var fs = require("fs");
var path = require("path");
var base64 = require('base64-stream');


import {
  titles,
  generalInformation,
  intelectual,
  adecuacionNormas,
  estabilidadEmocional,
  actPrevencionRiesgosOne,
  actPrevencionRiesgosTwo,
  motivacionCargo,
  conclusion,
  nameFirma,
  generateQR
} from "./constant";


//I - Analisis de indicadores
//AN - Adecuacion a las normas
//EE - Estabilidad emocional
//APR - Actitud a la prevension de los riesgos
//MC - Motivacion por el cargo

export default function createPdf(I, AN, EE, APR, MC, fortalezas, areas_mejorar, conclusionRiesgos, informacionPersonal, nombrePdf, nombreQR, fecha_vigencia) {
  //Intelectual
  const { razonamiento_abstracto, percepcion_concentracion, comprension_instrucciones } = I;
  const { acato_autoridad, relacion_grupo_pares, comportamiento_social } = AN;
  const { locus_control_impulsividad, manejo_frustracion, empatia, grado_ansiedad } = EE;
  const { actitud_prevencion_accidentes, confianza_acciones_realizadas, capacidad_modificar_ambiente_seguridad } = APR;
  const { orientacion_tarea, energia_vital } = MC;
  let generalSpace = 0;
  let moreSpace = 5;
  let codeEva = 'ASIS-EVA-2020-000012';
  let strengths = 'Ea aliquip nostrud cillum adipisicing proident dolor id commodo anim velit in aliqua excepteur. Dolor labore non adipisicing velit incididunt commodo Lorem laboris in. Ex duis incididunt commodo id. Ex aute nostrud laborum dolor. Qui consequat amet nostrud cupidatat consectetur ut deserunt quis. Occaecat commodo nisi ipsum irure do dolore consectetur.';
  let bettersAreas = 'Sunt aute est ex labore ad ex cupidatat culpa. Ullamco id aliqua amet deserunt ut ullamco Lorem elit duis. Minim quis quis magna ut duis consectetur deserunt consequat occaecat nisi. Aute non in dolor quis. Est dolore aliquip sunt excepteur labore fugiat proident. Adipisicing labore cillum nulla cupidatat minim tempor do veniam.';
  const doc = new PDF();

  //-----------------------------------------PDF------------------------------------------------

  doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/" + nombrePdf));

  //Insercion del logo y titulo
  doc.image(path.resolve("./") + "/uploads/asis_logo.png", 225, generalSpace, {
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
    .rect(290, 140, 252, 20)
    .stroke();

  // 1.- Informacion personal
  doc.fontSize(9);
  generalSpace += 30;
  doc
    .font("Helvetica-Bold")
    .text("I    Información Personal", 60, generalSpace, { align: "left" });

  //2 .- Creacion de tabla para informacion general
  generalSpace += 30;
  generalInformation.forEach(function (e) {
    doc.lineJoin("miter").rect(50, generalSpace, 200, 15).stroke();
    doc.font("Helvetica-Bold").text(e, 60, generalSpace + 4, { align: "left" });
    doc.lineJoin("miter").rect(250, generalSpace, 310, 15).stroke();

    generalSpace += 15;
  });

  generalSpace -= 135;
  doc.font("Helvetica").text(informacionPersonal.empresa, 260, generalSpace + 4, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.nombre, 260, generalSpace + 19, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.edad, 260, generalSpace + 35, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.rut, 260, generalSpace + 50, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.educacion, 260, generalSpace + 65, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.cargo, 260, generalSpace + 80, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.maquinarias_conducir, 260, generalSpace + 95, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.ciudad, 260, generalSpace + 110, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.fecha_evaluacion, 260, generalSpace + 125, { align: "left" });

  generalSpace += 135

  //3 .- Analisis de indicadores
  doc.fontSize(9);
  generalSpace += 20;
  doc
    .font("Helvetica-Bold")
    .text("II    Análisis de Indicadores", 60, generalSpace, { align: "left" });

  //4.- Creacion cuadros de tablas de analisis de indicadores
  //--------------------------------------------------------------------Intelectual
  generalSpace += 20;

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

    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 5, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 5, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 5, { align: "left" });
  });

  generalSpace -= 30;

  //----marcas de resultado
  switch (razonamiento_abstracto.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (percepcion_concentracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (comprension_instrucciones.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  //--------------------------------------------------------------------Adecuacion a las normas
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

    //----marcas de resultado
    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 5, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 5, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 5, { align: "left" });
  });

  generalSpace -= 30;

  switch (acato_autoridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (relacion_grupo_pares.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (comportamiento_social.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  //--------------------------------------------------------------------Estabilidad emocional
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

    //----marcas de resultado
    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 5, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 5, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 5, { align: "left" });
  });

  generalSpace -= 45;

  switch (locus_control_impulsividad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (manejo_frustracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (empatia.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (grado_ansiedad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  //--------------------------------------------------------------------Actitud a la prevencion de los riesgos PT1
  generalSpace += 35;
  doc.fontSize(10);
  doc
    .font("Helvetica-Bold")
    .text("Actitud a la prevensión", 72, generalSpace + 35, { align: "left" });
  doc
    .font("Helvetica-Bold")
    .text("de los riesgos", 90, generalSpace + 47, { align: "left" });

  //-- cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 95).stroke();
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
  actPrevencionRiesgosOne.forEach(function (e) {
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

    //----marcas de resultado
    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 14, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 14, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 14, { align: "left" });

    generalSpace += 40;
  });

  generalSpace -= 70;

  switch (actitud_prevencion_accidentes.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 40;

  switch (confianza_acciones_realizadas.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  //---------------------- PAGE 2
  doc.addPage();
  generalSpace = 15;
  //--------------------------------------------------------------------Actitud a la prevencion de los riesgos PT2
  //-- cuadro general
  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 30).stroke();
  //----------
  actPrevencionRiesgosTwo.forEach(function (e) {
    doc.lineJoin("miter").rect(200, generalSpace, 160, 30).stroke();

    doc.lineJoin("miter").rect(360, generalSpace, 70, 30).stroke();

    doc.lineJoin("miter").rect(430, generalSpace, 70, 30).stroke();

    doc.lineJoin("miter").rect(500, generalSpace, 60, 30).stroke();

    e.name.forEach(function (n) {
      doc
        .font("Helvetica")
        .text(n, 210, generalSpace + moreSpace, { align: "left" });
      moreSpace += 10;
    });

    //----marcas de resultado
    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 14, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 14, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 14, { align: "left" });

    generalSpace += 40;
  });

  generalSpace -= 40;

  switch (capacidad_modificar_ambiente_seguridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 12, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 12, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 12, { align: "left" });
      break;
  }

  generalSpace += 40;

  //--------------------------------------------------------------------Motivacion por el cargo
  generalSpace += 15;
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

    //----marcas de resultado
    // if (e.bajo)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 393, generalSpace + 5, { align: "left" });
    // if (e.promedio)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 462, generalSpace + 5, { align: "left" });
    // if (e.alto)
    //   doc
    //     .font("Helvetica-Bold")
    //     .text("X", 530, generalSpace + 5, { align: "left" });
  });

  generalSpace -= 15;

  switch (orientacion_tarea.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  generalSpace += 15;

  switch (energia_vital.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      break;
  }

  //5 .- Analisis cualitativo
  doc.fontSize(9);
  generalSpace += 40;
  doc
    .font("Helvetica-Bold")
    .text("III    Análisis cualitativo", 60, generalSpace, { align: "left" });

  generalSpace += 30;
  //----cabecera
  doc.lineJoin("miter").rect(50, generalSpace, 510, 15).stroke();
  //titulo cabecera
  doc
    .font("Helvetica-Bold")
    .text('Fortalezas', 55, generalSpace + 4, { align: "left" });

  generalSpace += 16;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 130).stroke();

  generalSpace += 5;
  moreSpace = 5;

  doc
    .font("Helvetica")
    .text(fortalezas, 60, generalSpace + 4, { align: "left" });

  generalSpace += 135;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 15).stroke();

  doc
    .font("Helvetica-Bold")
    .text('Areas a mejorar', 55, generalSpace + 5, { align: "left" });

  generalSpace += 18;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 60).stroke();

  doc
    .font("Helvetica")
    .text(areas_mejorar, 60, generalSpace + 8, { align: "left" });

  //--------------------------------------------------------------------Conclusión
  generalSpace += 75;
  doc
    .font("Helvetica-Bold")
    .text('IV    Conclusión', 60, generalSpace + 4, { align: "left" });

  //----------------titulos
  generalSpace += 18;
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

  switch (conclusionRiesgos) {
    case 1:
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text('X', 130, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('grey')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          continued: true
        }).fillColor('black')
        .text('SR./SRA ACTUALMENTE NO PRESENTA CONDUCTAS DE RIESGO')
        .fillColor('grey')
        .text('desde el punto de vista psicológico');
      break;

    case 2:
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text('X', 300, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('grey')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          continued: true
        }).fillColor('black')
        .text('SR./SRA ACTUALMENTE PRESENTA BAJAS CONDUCTAS DE RIESGO')
        .fillColor('grey')
        .text('desde el punto de vista psicológico');
      break;

    case 3:
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text('X', 470, generalSpace + 5, { align: "left" });
      doc.fontSize(9);
      doc.fillColor('grey')
        .text('De los resultados se desprende que el ', 60, generalSpace + 25, {
          align: 'left',
          continued: true
        }).fillColor('black')
        .text('SR./SRA ACTUALMENTE PRESENTA ALTAS CONDUCTAS DE RIESGO')
        .fillColor('grey')
        .text('desde el punto de vista psicológico');
      break;
  }

  generalSpace += 63;

  //--firma
  doc.image(path.resolve("./") + "/src/assets/img/firma_archivos_asis.png", 225, generalSpace, {
    fit: [130, 130],
    align: "center",
    valign: "center",
  });

  generalSpace += 125;
  moreSpace = 5

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

  doc.end();
}

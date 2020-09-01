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

export default function createPdf(I, AN, EE, APR, MC, conclusionRiesgos, informacionPersonal, nombrePdf, nombreQR, fecha_vigencia, observacionConclusion) {
  //Intelectual
  const { razonamiento_abstracto, percepcion_concentracion, comprension_instrucciones } = I;
  const { acato_autoridad, relacion_grupo_pares, comportamiento_social } = AN;
  const { locus_control_impulsividad, manejo_frustracion, empatia, grado_ansiedad } = EE;
  const { actitud_prevencion_accidentes, confianza_acciones_realizadas, capacidad_modificar_ambiente_seguridad } = APR;
  const { orientacion_tarea, energia_vital } = MC;
  let generalSpace = 0;
  let moreSpace = 5;
  let elecciones = ['Promedio/Alto: Frase Promedio/Alto', 'Bajo: Frase Bajo'];
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
      nombre: 'Actitud a la prevensión de los riesgos',
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
      nombre: 'Actitud a la prevensión de los riesgos',
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
  generalSpace += 15;
  generalInformation.forEach(function (e) {
    doc.lineJoin("miter").rect(50, generalSpace, 200, 15).stroke();
    doc.font("Helvetica-Bold").text(e, 60, generalSpace + 4, { align: "left" });
    doc.lineJoin("miter").rect(250, generalSpace, 310, 15).stroke();

    generalSpace += 15;
  });

  generalSpace -= 135;
  doc.font("Helvetica").text(informacionPersonal.empresa, 260, generalSpace - 10, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.nombre, 260, generalSpace + 4, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.edad, 260, generalSpace + 19, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.rut, 260, generalSpace + 35, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.educacion, 260, generalSpace + 50, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.cargo, 260, generalSpace + 65, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.maquinarias_conducir, 260, generalSpace + 80, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.ciudad, 260, generalSpace + 95, { align: "left" });
  doc.font("Helvetica").text(informacionPersonal.evaluador, 260, generalSpace + 110, { align: "left" });
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
  });

  generalSpace -= 30;

  //----marcas de resultado
  switch (razonamiento_abstracto.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push('Razonamiento abstracto');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Razonamiento abstracto');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Razonamiento abstracto');
      break;
  }

  generalSpace += 15;

  switch (percepcion_concentracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push('Persepción y concentración');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Persepción y concentración');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Persepción y concentración');
      break;
  }

  generalSpace += 15;

  switch (comprension_instrucciones.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[0].items.push('Comprensión de instrucciones');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Comprensión de instrucciones');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[0].items.push('Comprensión de instrucciones');
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

  });

  generalSpace -= 30;

  switch (acato_autoridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push('Acato a la autoridad');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Acato a la autoridad');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Acato a la autoridad');
      break;
  }

  generalSpace += 15;

  switch (relacion_grupo_pares.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push('Relación con grupos de pares');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Relación con grupos de pares');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Relación con grupos de pares');
      break;
  }

  generalSpace += 15;

  switch (comportamiento_social.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[1].items.push('Comportamiento social');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Comportamiento social');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[1].items.push('Comportamiento social');
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
  });

  generalSpace -= 45;

  switch (locus_control_impulsividad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push('Locus de control / impulsivilidad');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Locus de control / impulsivilidad');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Locus de control / impulsivilidad');
      break;
  }

  generalSpace += 15;

  switch (manejo_frustracion.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push('Manejo de la frustración');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Manejo de la frustración');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Manejo de la frustración');
      break;
  }

  generalSpace += 15;

  switch (empatia.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push('Empatía');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Empatía');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Empatía');
      break;
  }

  generalSpace += 15;

  switch (grado_ansiedad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[2].items.push('Grado de ansiedad');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Grado de ansiedad');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[2].items.push('Grado de ansiedad');
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

    generalSpace += 40;
  });

  generalSpace -= 70;

  switch (actitud_prevencion_accidentes.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[3].items.push('Actitud general hacia la prevensión de accidentes de trabajo');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push('Actitud general hacia la prevensión de accidentes de trabajo');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push('Actitud general hacia la prevensión de accidentes de trabajo');
      break;
  }

  generalSpace += 40;

  switch (confianza_acciones_realizadas.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[3].items.push('Confianza en acciones realizadas');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push('Confianza en acciones realizadas');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[3].items.push('Confianza en acciones realizadas');
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

    generalSpace += 40;
  });

  generalSpace -= 40;

  switch (capacidad_modificar_ambiente_seguridad.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 12, { align: "left" });
      areas_mejorar[3].items.push('Capacidad para modificar el ambiente a favor de la seguridad');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 12, { align: "left" });
      fortalezas[3].items.push('Capacidad para modificar el ambiente a favor de la seguridad');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 12, { align: "left" });
      fortalezas[3].items.push('Capacidad para modificar el ambiente a favor de la seguridad');
      break;
  }

  generalSpace += 40;

  //--------------------------------------------------------------------Motivacion por el cargo
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
      areas_mejorar[4].items.push('Orientación a la tarea');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push('Orientación a la tarea');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push('Orientación a la tarea');
      break;
  }

  generalSpace += 15;

  switch (energia_vital.toLowerCase()) {
    case 'bajo':
      doc
        .font("Helvetica-Bold")
        .text("X", 393, generalSpace + 5, { align: "left" });
      areas_mejorar[4].items.push('Energia vital');
      break;
    case 'promedio':
      doc
        .font("Helvetica-Bold")
        .text("X", 462, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push('Energia vital');
      break;
    case 'alto':
      doc
        .font("Helvetica-Bold")
        .text("X", 525, generalSpace + 5, { align: "left" });
      fortalezas[4].items.push('Energia vital');
      break;
  }

  //5 .- Analisis cualitativo
  //----------------FORTALEZAS
  let heightCuantitativo = 22;
  let spaceCuantitativo = 160;

  doc.fontSize(9);
  generalSpace += 30;
  doc
    .font("Helvetica-Bold")
    .text("III    Análisis cualitativo", 60, generalSpace, { align: "left" });

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

  // generalSpace += 15;

  //--array fortalezas
  fortalezas.forEach(fortaleza => {
    if (fortaleza.items.length > 0) {
      generalSpace += 18;
      heightCuantitativo += 18;
      doc
        .font("Helvetica-Bold")
        .text(fortaleza.nombre, 60, generalSpace + 4, { align: "left" });


      fortaleza.items.forEach((item, index) => {
        generalSpace += 10;
        heightCuantitativo += 10;
        doc
          .font("Helvetica")
          .text(`${index + 1} .- ${item}`, 60, generalSpace + 4, { align: "left" });
        doc
          .font("Helvetica")
          .text(elecciones[0], 60, generalSpace + 4, { align: "right" });

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

  //--array areas a mejorar
  areas_mejorar.forEach(area => {
    if (area.items.length > 0) {
      heightCuantitativo += 18;
      spaceCuantitativo += 18;
      doc
        .font("Helvetica-Bold")
        .text(area.nombre, 60, spaceCuantitativo + 4, { align: "left" });


      area.items.forEach((item, index) => {
        spaceCuantitativo += 10;
        heightCuantitativo += 10;
        doc
          .font("Helvetica")
          .text(`${index + 1} .- ${item}`, 60, spaceCuantitativo + 4, { align: "left" });
        doc
          .font("Helvetica")
          .text(elecciones[1], 60, spaceCuantitativo + 4, { align: "right" });
      });
    }
  });

  generalSpace += 46;

  // spaceCuantitativo += heightCuantitativo + 300;
  doc.lineJoin("miter").rect(50, generalSpace, 510, heightCuantitativo).stroke();





  //--------------------------------------------------------------------Conclusión
  doc.addPage();
  generalSpace = 20;
  doc
    .font("Helvetica-Bold")
    .text('IV    Conclusión', 60, generalSpace + 4, { align: "left" });

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

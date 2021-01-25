"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createPdf;

var _constant = require("./constant");

var PDF = require("pdfkit");

var fs = require("fs");

var path = require("path");

function createPdf() {
  var generalSpace = 15;
  var moreSpace = 5;
  var strengths = 'Ea aliquip nostrud cillum adipisicing proident dolor id commodo anim velit in aliqua excepteur. Dolor labore non adipisicing velit incididunt commodo Lorem laboris in. Ex duis incididunt commodo id. Ex aute nostrud laborum dolor. Qui consequat amet nostrud cupidatat consectetur ut deserunt quis. Occaecat commodo nisi ipsum irure do dolore consectetur.';
  var bettersAreas = 'Sunt aute est ex labore ad ex cupidatat culpa. Ullamco id aliqua amet deserunt ut ullamco Lorem elit duis. Minim quis quis magna ut duis consectetur deserunt consequat occaecat nisi. Aute non in dolor quis. Est dolore aliquip sunt excepteur labore fugiat proident. Adipisicing labore cillum nulla cupidatat minim tempor do veniam.';
  var conclusionSelection = 'bajo';
  var doc = new PDF(); //-----------------------------------------PDF------------------------------------------------

  doc.pipe(fs.createWriteStream(path.resolve("./") + "/uploads/example.pdf")); //Insercion del logo y titulo

  doc.image(path.resolve("./") + "/uploads/asis_logo.png", 225, generalSpace, {
    fit: [155, 155],
    align: "center",
    valign: "center"
  });
  generalSpace += 120;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("INFORME AVERSIÓN AL RIESGO", 60, generalSpace, {
    align: "center"
  });
  doc.fontSize(10);
  generalSpace += 25;
  doc.font("Helvetica-Bold").text("Este informe tiene vigencia hasta el 31-12-2021", 60, generalSpace, {
    align: "right"
  }).rect(290, 153, 252, 20).stroke(); // 1.- Informacion personal

  doc.fontSize(9);
  generalSpace += 30;
  doc.font("Helvetica-Bold").text("I    Información Personal", 60, generalSpace, {
    align: "left"
  }); //2 .- Creacion de tabla para informacion general

  generalSpace += 30;

  _constant.generalInformation.forEach(function (e) {
    doc.lineJoin("miter").rect(50, generalSpace, 200, 15).stroke();
    doc.font("Helvetica-Bold").text(e, 60, generalSpace + 4, {
      align: "left"
    });
    doc.lineJoin("miter").rect(250, generalSpace, 310, 15).stroke();
    generalSpace += 15;
  }); //3 .- Analisis de indicadores


  doc.fontSize(9);
  generalSpace += 20;
  doc.font("Helvetica-Bold").text("II    Análisis de Indicadores", 60, generalSpace, {
    align: "left"
  }); //4.- Creacion cuadros de tablas de analisis de indicadores
  //--------------------------------------------------------------------Intelectual

  generalSpace += 20;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("Intelectual", 100, generalSpace + 25, {
    align: "left"
  }); //----cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 60).stroke(); //-----------
  //----cabeceras

  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke(); //------------
  //--------textos cabeceras

  doc.font("Helvetica-Bold").text(_constant.titles[0], 35, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[1], 250, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[2], 390, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[3], 515, generalSpace + 4, {
    align: "center"
  }); //-------------

  _constant.intelectual.forEach(function (e) {
    generalSpace += 15;
    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
    doc.font("Helvetica").text(e.name, 210, generalSpace + 3, {
      align: "left"
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 5, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 5, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 5, {
      align: "left"
    });
  }); //--------------------------------------------------------------------Adecuacion a las normas


  generalSpace += 36;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("Adecuación a las Normas", 63, generalSpace + 25, {
    align: "left"
  }); //----cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 60).stroke(); //-----------------
  //----cabeceras

  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke(); //------------
  //--------textos cabeceras

  doc.font("Helvetica-Bold").text(_constant.titles[0], 35, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[1], 250, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[2], 390, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[3], 515, generalSpace + 4, {
    align: "center"
  }); //-------------

  _constant.adecuacionNormas.forEach(function (e) {
    generalSpace += 15;
    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
    doc.font("Helvetica").text(e.name, 210, generalSpace + 3, {
      align: "left"
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 5, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 5, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 5, {
      align: "left"
    });
  }); //--------------------------------------------------------------------Estabilidad emocional


  generalSpace += 36;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("Estabilidad emocional", 72, generalSpace + 30, {
    align: "left"
  }); //-- cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 75).stroke(); //-------
  //----cabeceras

  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke(); //------------
  //--------textos cabeceras

  doc.font("Helvetica-Bold").text(_constant.titles[0], 35, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[1], 250, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[2], 390, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[3], 515, generalSpace + 4, {
    align: "center"
  }); //-------------

  _constant.estabilidadEmocional.forEach(function (e) {
    generalSpace += 15;
    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
    doc.font("Helvetica").text(e.name, 210, generalSpace + 3, {
      align: "left"
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 5, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 5, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 5, {
      align: "left"
    });
  }); //--------------------------------------------------------------------Actitud a la prevencion de los riesgos PT1


  generalSpace += 35;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("Actitud a la prevención", 72, generalSpace + 35, {
    align: "left"
  });
  doc.font("Helvetica-Bold").text("de los riesgos", 90, generalSpace + 47, {
    align: "left"
  }); //-- cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 95).stroke(); //----------
  //----cabeceras

  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke(); //------------
  //--------textos cabeceras

  doc.font("Helvetica-Bold").text(_constant.titles[0], 35, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[1], 250, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[2], 390, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[3], 515, generalSpace + 4, {
    align: "center"
  }); //-------------

  generalSpace += 15;

  _constant.actPrevencionRiesgosOne.forEach(function (e) {
    doc.lineJoin("miter").rect(200, generalSpace, 160, 40).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 40).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 40).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 40).stroke();
    var moreSpace = 5;
    e.name.forEach(function (n) {
      doc.font("Helvetica").text(n, 210, generalSpace + moreSpace, {
        align: "left"
      });
      moreSpace += 9;
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 14, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 14, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 14, {
      align: "left"
    });
    generalSpace += 40;
  }); //---------------------- PAGE 2


  doc.addPage();
  generalSpace = 15; //--------------------------------------------------------------------Actitud a la prevencion de los riesgos PT1
  //-- cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 30).stroke(); //----------

  _constant.actPrevencionRiesgosTwo.forEach(function (e) {
    doc.lineJoin("miter").rect(200, generalSpace, 160, 30).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 30).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 30).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 30).stroke();
    e.name.forEach(function (n) {
      doc.font("Helvetica").text(n, 210, generalSpace + moreSpace, {
        align: "left"
      });
      moreSpace += 10;
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 14, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 14, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 14, {
      align: "left"
    });
    generalSpace += 40;
  }); //--------------------------------------------------------------------Motivacion por el cargo


  generalSpace += 15;
  doc.fontSize(10);
  doc.font("Helvetica-Bold").text("Motivación por el cargo", 72, generalSpace + 20, {
    align: "left"
  }); //-- cuadro general

  doc.fontSize(9);
  doc.lineJoin("miter").rect(50, generalSpace, 510, 45).stroke(); //-------------
  //----cabeceras

  doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
  doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
  doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke(); //------------
  //--------textos cabeceras

  doc.font("Helvetica-Bold").text(_constant.titles[0], 35, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[1], 250, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[2], 390, generalSpace + 4, {
    align: "center"
  });
  doc.font("Helvetica-Bold").text(_constant.titles[3], 515, generalSpace + 4, {
    align: "center"
  }); //-------------

  _constant.motivacionCargo.forEach(function (e) {
    generalSpace += 15;
    doc.lineJoin("miter").rect(200, generalSpace, 160, 15).stroke();
    doc.lineJoin("miter").rect(360, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(430, generalSpace, 70, 15).stroke();
    doc.lineJoin("miter").rect(500, generalSpace, 60, 15).stroke();
    doc.font("Helvetica").text(e.name, 210, generalSpace + 3, {
      align: "left"
    }); //----marcas de resultado

    if (e.bajo) doc.font("Helvetica-Bold").text("X", 393, generalSpace + 5, {
      align: "left"
    });
    if (e.promedio) doc.font("Helvetica-Bold").text("X", 462, generalSpace + 5, {
      align: "left"
    });
    if (e.alto) doc.font("Helvetica-Bold").text("X", 530, generalSpace + 5, {
      align: "left"
    });
  }); //5 .- Analisis cualitativo


  doc.fontSize(9);
  generalSpace += 40;
  doc.font("Helvetica-Bold").text("III    Análisis cualitativo", 60, generalSpace, {
    align: "left"
  });
  generalSpace += 30; //----cabecera

  doc.lineJoin("miter").rect(50, generalSpace, 510, 15).stroke(); //titulo cabecera

  doc.font("Helvetica-Bold").text('Fortalezas', 55, generalSpace + 4, {
    align: "left"
  });
  generalSpace += 16;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 130).stroke();
  generalSpace += 5;
  moreSpace = 5;
  doc.font("Helvetica").text(strengths, 60, generalSpace + 4, {
    align: "left"
  });
  generalSpace += 135;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 15).stroke();
  doc.font("Helvetica-Bold").text('Areas a mejorar', 55, generalSpace + 5, {
    align: "left"
  });
  generalSpace += 18;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 510, 60).stroke();
  doc.font("Helvetica").text(bettersAreas, 60, generalSpace + 8, {
    align: "left"
  }); //--------------------------------------------------------------------Conclusión

  generalSpace += 75;
  doc.font("Helvetica-Bold").text('IV    Conclusión', 60, generalSpace + 4, {
    align: "left"
  }); //----------------titulos

  generalSpace += 18;
  moreSpace = 5;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 165, 50).stroke();
  doc.lineJoin("miter").rect(223, generalSpace + 2, 165, 50).stroke();
  doc.lineJoin("miter").rect(395, generalSpace + 2, 165, 50).stroke();

  _constant.conclusion.forEach(function (e) {
    e.name.forEach(function (n) {
      doc.font("Helvetica-Bold").text(n, 75 + e.verticalSpace, generalSpace + 10 + moreSpace, {
        align: "left"
      });
      moreSpace += 10;
    });
    moreSpace = 5;
  }); //--------------respuestas


  generalSpace += 53;
  doc.lineJoin("miter").rect(50, generalSpace + 2, 165, 15).stroke();
  doc.lineJoin("miter").rect(223, generalSpace + 2, 165, 15).stroke();
  doc.lineJoin("miter").rect(395, generalSpace + 2, 165, 15).stroke();
  doc.fontSize(11);

  switch (conclusionSelection) {
    case 'bajo':
      doc.font("Helvetica-Bold").text('X', 130, generalSpace + 5, {
        align: "left"
      });
      break;

    case 'promedio':
      doc.font("Helvetica-Bold").text('X', 300, generalSpace + 5, {
        align: "left"
      });
      break;

    case 'alto':
      doc.font("Helvetica-Bold").text('X', 470, generalSpace + 5, {
        align: "left"
      });
      break;
  }

  doc.end();
}
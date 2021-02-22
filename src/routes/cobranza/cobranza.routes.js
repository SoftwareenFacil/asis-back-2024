import { Router } from "express";
import textoPdf from "../../libs/html-pdf/carta_cobranza.js";
import QRCode from "qrcode";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";


//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("cobranza").find({ isActive: true }).toArray();
  return res.json(result);
});

//SELECT ONE
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db.collection('cobranza').findOne({_id: ObjectID(id)});

  return res.json(result);
})

//TEST CREACION DE PDF PARA ENVIO POR CORREO
router.get("/pdf", async (req, res) => {
  var fs = require("fs");
  var pdf = require("html-pdf");
  // var html = fs.readFileSync(TextoCarta('ASIS-2020-SOL-00001 MARIO CASANOVA RAMIREZ'), 'utf8');
  var options = { format: "Letter" };

  try {
    // const codeQR = generateQR();
    const generateQR = await QRCode.toDataURL('text');
    const body = textoPdf();
    const completeText = `${body}<img src="${generateQR}" width="150" height="150" align="center">`;

    pdf
      .create(completeText, options)
      .toFile("uploads/salida.pdf", function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });

      return res.status(201).json({
        msg: 'Codigo creado satisfactoriamente',
        code: codeQR
      });
  } catch (error) {
    return res.status(400).json({msg: error});
  }
});


//SELECT WITH PAGINATION
router.post('/pagination', async (req, res) =>{
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countCobranza = await db.collection("cobranza").find({ isActive: true }).count();
    const result = await db
      .collection("cobranza")
      .find({ isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.json({
      total_items: countCobranza,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countCobranza / nPerPage + 1),
      cobranzas: result,
    });
  } catch (error) {
    return res.status(501).json(error);
  }
})

//SELECT POR RUT Y RAZONS SOCIAL
router.post('/buscar', async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

  let rutFiltrado;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado = filtro;
    rutFiltrado.replace("k", "K");
  } else {
    rutFiltrado = filtro;
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countCobranza;
  
  try {
    if (identificador === 1) {
      countCobranza = await db
        .collection("cobranza")
        .find({ rut_cp: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("cobranza")
        .find({ rut_cp: rexExpresionFiltro, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countCobranza = await db
        .collection("cobranza")
        .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
        .count();
      result = await db
        .collection("cobranza")
        .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.json({
      total_items: countCobranza,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countCobranza / nPerPage + 1),
      cobranzas: result,
    });
  } catch (error) {
    return res.status(501).json({ mgs: `ha ocurrido un error ${error}` });
  }
})
// router.post("/buscar", async (req, res) => {
//   const { rutcp, tipocliente } = req.body;
//   const db = await connect();
//   const result = await db
//     .collection("cobranza")
//     .find({ rut_cp: rutcp, categoria_cliente: tipocliente })
//     .toArray();
//   res.json(result);
// });

router.post("/envio/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let obj = {};
  obj.fecha_creacion_carta = req.body.fecha_creacion_carta;
  obj.hora_creacion_carta = req.body.hora_creacion_carta;
  obj.fecha_envio_carta = req.body.fecha_envio_carta;
  obj.hora_envio_carta = req.body.hora_envio_carta;
  obj.observacion = req.body.observacion;
  obj.estado = "Enviado";

  const result = await db.collection("cobranza").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        estado: "En Cobranza",
      },
      $push: {
        cartas_cobranza: obj,
      },
    }
  );

  return res.json(result);
});

// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("cobranza")
//       .updateMany({}, {
//         $set: {
//           isActive: true
//         }
//       });
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ msg: String(error) });
//   }
// });

export default router;

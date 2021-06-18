import { Router } from "express";
import textoPdf from "../../libs/html-pdf/carta_cobranza.js";
import QRCode from "qrcode";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { SB_TEMPLATE_SEND_COLLECTION_LETTER, CURRENT_ROL } from "../../constant/var.js";
import MilesFormat from "../../functions/formattedPesos.js";
import { ERROR } from "../../constant/text_messages.js";
import sendinblue from "../../libs/sendinblue/sendinblue";
import { verifyToken } from "../../libs/jwt.js";


//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const result = await db.collection("cobranza").find({ isActive: true }).toArray();
  res.json(result);
  conn.close();
});

//SELECT ONE
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  const result = await db.collection('cobranza').findOne({ _id: ObjectID(id) });

  res.json(result);

  conn.close();
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
    return res.status(400).json({ msg: error });
  }
});

//SEND MAIL COBRANZA
router.post('/sendmail/:id', async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const cobranza = await db.collection('cobranza').findOne({ _id: ObjectID(id) });

    if (!cobranza) return { err: 98, msg: 'El registro de cobranza no existe en el sistema', res: null };

    const clientePrincipal = await db
      .collection("gi")
      .findOne({ rut: cobranza.rut_cp, categoria: 'Empresa/Organizacion' });

    const clienteSecundario = await db
      .collection("gi")
      .findOne({ rut: cobranza.rut_cs, categoria: 'Persona Natural' });

    const reserva = await db
      .collection('reservas')
      .findOne({ codigo: cobranza.codigo.replace('COB', 'AGE') });

    const factura = await db
      .collection('facturaciones')
      .findOne({ codigo: cobranza.codigo.replace('COB', 'FAC') });

    sendinblue(
      datos.emailsArray,
      SB_TEMPLATE_SEND_COLLECTION_LETTER,
      {
        RAZON_SOCIAL_CP_SOLICITUD: clientePrincipal.razon_social || '',
        CODIGO_COBRANZA: cobranza.codigo,
        NOMBRE_SERVICIO_SOLICITUD: cobranza.nombre_servicio,
        SUCURSAL_SOLICITUD: cobranza.sucursal,
        JORNADA_RESERVA: reserva?.jornada || '',
        FECHA_FACTURACION: cobranza.fecha_facturacion,
        NRO_FACTURA: factura?.nro_factura || '',
        DIAS_CREDITO_CP: clientePrincipal.dias_credito,
        VALOR_SERVICIO: `$ ${MilesFormat(cobranza.valor_servicio || 0)}`,
        VALOR_PAGADO: `$ ${MilesFormat(cobranza.valor_cancelado || 0)}`,
        VALOR_DEUDA: `$ ${MilesFormat(cobranza.valor_deuda || 0)}`,
        RUT_CLIENTE_SECUNDARIO: clienteSecundario.rut || '',
        NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario.razon_social || '',
      }
    );

    return res.status(200).json({ err: null, msg: 'Cobranza enviada satisfactoriamente', res: [] })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  } finally {
    conn.close();
  }
});

//SELECT WITH PAGINATION
router.post('/pagination', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  const dataToken = await verifyToken(token);

  try {
    let countCobranza;
    let result;

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countCobranza = await db.collection("cobranza").find({ rut_cp: dataToken.rut, isActive: true }).count();
      result = await db
        .collection("cobranza")
        .find({ rut_cp: dataToken.rut, isActive: true })
        .sort({ codigo: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else {
      countCobranza = await db.collection("cobranza").find({ isActive: true }).count();
      result = await db
        .collection("cobranza")
        .find({ isActive: true })
        .sort({ codigo: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.status(200).json({
      total_items: countCobranza,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countCobranza / nPerPage + 1),
      cobranzas: result,
    });
  } catch (error) {
    return res.status(500).status(501).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 1,
      cobranzas: null,
      err: String(error)
    });
  }
})

//SELECT POR RUT Y RAZONS SOCIAL
router.post('/buscar', async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  const token = req.headers['x-access-token'];

  const dataToken = await verifyToken(token);
  // let rutFiltrado;

  // if (identificador === 1 && filtro.includes("k")) {
  //   rutFiltrado = filtro;
  //   rutFiltrado.replace("k", "K");
  // } else {
  //   rutFiltrado = filtro;
  // }

  // const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  };

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countCobranza;

  try {
    // if (identificador === 1) {
    //   countCobranza = await db
    //     .collection("cobranza")
    //     .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("cobranza")
    //     .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // } else {
    //   countCobranza = await db
    //     .collection("cobranza")
    //     .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //     .count();
    //   result = await db
    //     .collection("cobranza")
    //     .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countCobranza = await db
        .collection("cobranza")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .count();
      result = await db
        .collection("cobranza")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .sort({ codigo: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else{
      countCobranza = await db
        .collection("cobranza")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();
      result = await db
        .collection("cobranza")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .sort({ codigo: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }


    return res.status(200).json({
      total_items: countCobranza,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countCobranza / nPerPage + 1),
      cobranzas: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      cobranzas: null,
      err: String(error)
    });
  } finally {
    conn.close()
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
  const conn = await connect();
  const db = conn.db('asis-db');
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

  res.json(result);

  conn.close();
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

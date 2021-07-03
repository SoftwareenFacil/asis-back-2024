import { Router } from "express";
import textoPdf from "../../libs/html-pdf/carta_cobranza.js";
import QRCode from "qrcode";

import { v4 as uuid } from "uuid";
var fs = require("fs");

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { SB_TEMPLATE_SEND_COLLECTION_LETTER, CURRENT_ROL, CONSOLIDATED_REPORT_PDF, AWS_BUCKET_NAME, SB_TEMPLATE_SEND_CONSOLIDATED_REPORT } from "../../constant/var.js";
import MilesFormat from "../../functions/formattedPesos.js";
import { ERROR } from "../../constant/text_messages.js";
import sendinblue from "../../libs/sendinblue/sendinblue";
import { verifyToken } from "../../libs/jwt.js";
import createPdfCobranza from '../../functions/createPdf/cobranza/createPdfCobranza';
import createPdfConsolidado from '../../functions/createPdf/cobranza/createPdfConsolidado';

import { uploadFileToS3 } from "../../libs/aws";


//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const result = await db.collection("cobranza").find({ isActive: true }).toArray();
  res.json(result);
  conn.close();
});

//SELECT FILTER
router.get('/gifilter/:rut', async (req, res) => {
  const { rut } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const cobranzas = await db.collection('cobranza').find({ rut_cp: rut }).toArray();
    if(!cobranzas) return { err: 98, msg: 'No se encontraron cobranzas para el GI seleccionado', res: null };

    return res.status(200).json({ err: null, msg: 'Cobranzas encontradas', res: cobranzas })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }
  finally{
    conn.close();
  }
});

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

router.post("/pdfconsolidado", async (req, res) => {
  const { gi, cobranzas, emails, filtrofecha = null, filtrocontrato = null, filtrofaena = null } = req.body;
  // const conn = await connect();
  // const db = conn.db('asis-db');
  try {
    const nameFIle = `informe_consolidado_${gi.razon_social}_${uuid()}`;
    //sacar los distintos tipos de examenes que hay
    let listExam = [];
    if(!!cobranzas && !!cobranzas.length){
      listExam = cobranzas.reduce((acc, current) => {
        const aux = acc.find((element) => element === current.nombre_servicio);
        if(!aux){
          acc.push(current.nombre_servicio)
        }
        return acc;
      }, []);
    }

    createPdfConsolidado(CONSOLIDATED_REPORT_PDF, gi, listExam, cobranzas, 'cobranzas', filtrofecha, filtrocontrato, filtrofaena);

    setTimeout(() => {
      const fileContent = fs.readFileSync(`uploads/${CONSOLIDATED_REPORT_PDF}`);

      const params = {
        Bucket: AWS_BUCKET_NAME,
        Body: fileContent,
        Key: nameFIle,
        ContentType: 'application/pdf'
      };

      uploadFileToS3(params);

      sendinblue(
        emails,
        SB_TEMPLATE_SEND_CONSOLIDATED_REPORT,
        {
          RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
        },
        [
          {
            content: Buffer.from(fileContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `${nameFIle}.pdf`
          }
        ]
      );

    }, 2000);

    return res.status(200).json({ err: null, msg: 'Informe enviado correctamente', res: [] })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(err), msg: ERROR, res: null });
  } finally {
    // conn.close();
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

    console.log(cobranza.codigo.replace('COB', 'EVA'))
    const evaluacion = await db.collection('evaluaciones').findOne({ codigo: cobranza.codigo.replace('COB', 'EVA') });
    console.log(evaluacion)

    const profesionalAsignado = await db.collection('gi').findOne({ _id: reserva.id_GI_personalAsignado });

    createPdfCobranza('cobranza_ejemplo.pdf', clientePrincipal, clienteSecundario, reserva, profesionalAsignado, evaluacion, cobranza);

    setTimeout(() => {
      const fileContent = fs.readFileSync(`uploads/cobranza_ejemplo.pdf`);

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
        },
        [
          {
            content: Buffer.from(fileContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `ASISCONSULTORES_${cobranza.codigo}.pdf`
          }
        ]
      );
    }, 2000);

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

//SELECT POR RUT Y RAZON SOCIAL
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
    else {
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
});


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

import { Router } from "express";
import { getMinusculas } from "../../functions/changeToMiniscula";
import { getDate } from "../../functions/getDateNow";
import { getFechaPago } from "../../functions/calculateFechaPago";
import multer from "../../libs/multer";
import { v4 as uuid } from "uuid";
import { uploadFileToS3 } from "../../libs/aws";
import moment from 'moment';

import { verifyToken } from "../../libs/jwt";

import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR, SUCCESSFULL_INSERT, SUCCESSFULL_UPDATE } from "../../constant/text_messages";

const router = Router();

var path = require("path");
var AWS = require('aws-sdk');
var fs = require("fs");

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, OTHER_NAME_PDF, FORMAT_DATE } from "../../constant/var";

//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const result = await db.collection("facturaciones").find({ isActive: true }).toArray();
  const empresa = await db.collection("empresa").findOne({});
  conn.close();
  return res.json({
    datos: result,
    empresa: empresa,
  });
});

router.get('/asis', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const empresa = await db.collection("empresa").findOne({});
    return res.status(200).json({
      empresa: empresa,
      err: null
    });
  } catch (error) {
    return res.status(500).json({
      empresa: null,
      err: String(error)
    });
  }finally {
    conn.close()
  }
});

//-------------------------------------------------------MASSIVE LOAD
router.get("/getoc", async (req, res) => {
  try {
    const conn = await connect();
    const db = conn.db('asis-db');
    const result = await db.collection('facturaciones').find({ oc: 'Si', estado: 'Ingresado' }).toArray();
    return res.status(200).json({ err: null, msg: 'Facturaciones cargadas', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

router.get("/getconfirmoc", async (req, res) => {
  try {
    const conn = await connect();
    const db = conn.db('asis-db');
    const result = await db.collection('facturaciones').find({ oc: 'Si', estado: 'En Revisión' }).toArray();
    return res.status(200).json({ err: null, msg: 'Facturaciones cargadas', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

router.get("/getinvoices", async (req, res) => {
  try {
    const conn = await connect();
    const db = conn.db('asis-db');
    const result = await db.collection('facturaciones').find({ estado: 'En Facturacion' }).toArray();
    return res.status(200).json({ err: null, msg: 'Facturaciones cargadas', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

//SELECT ONE 
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection('facturaciones').findOne({ _id: ObjectID(id) });
    const empresa = await db.collection('empresa').findOne();

    return res.status(200).json({
      facturaciones: result,
      empresa: empresa
    });
  } catch (error) {
    return res.status(500).json({ msg: ERROR, error });
  }finally {
    conn.close()
  }
})

//------------------------------------------------------

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countFac = await db.collection("facturaciones")
    //   .find(dataToken.rol === 'Clientes' ? { rut_cp: dataToken.rut, isActive: true } : { isActive: true }).count();
    // const empresa = await db.collection("empresa").findOne({});
    // const result = await db
    //   .collection("facturaciones")
    //   .find(dataToken.rol === 'Clientes' ? { rut_cp: dataToken.rut, isActive: true } : { isActive: true })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .toArray();

    const countFac = await db.collection("facturaciones").find({ isActive: true }).count();
    const empresa = await db.collection("empresa").findOne({});
    const result = await db
      .collection("facturaciones")
      .find({ isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      // auth: AUTHORIZED,
      total_items: countFac,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countFac / nPerPage + 1),
      empresa,
      facturaciones: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      facturaciones: null,
      err: String(error)
    });
  }finally {
    conn.close()
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  // if (identificador === 1 && filtro.includes("k")) {
  //   rutFiltrado = filtro;
  //   rutFiltrado.replace("k", "K");
  // } else {
  //   rutFiltrado = filtro;
  // }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countFac;

  try {
    // if (dataToken.rol !== 'Clientes') {
    //   if (identificador === 1) {
    //     countFac = await db
    //       .collection("facturaciones")
    //       .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //       .count();

    //     result = await db
    //       .collection("facturaciones")
    //       .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countFac = await db
    //       .collection("facturaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //       .count();
    //     result = await db
    //       .collection("facturaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }
    // else {
    //   if (identificador === 1) {
    //     countFac = await db
    //       .collection("facturaciones")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .count();

    //     result = await db
    //       .collection("facturaciones")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countFac = await db
    //       .collection("facturaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .count();
    //     result = await db
    //       .collection("facturaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }

    countFac = await db
      .collection("facturaciones")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .count();
    result = await db
      .collection("facturaciones")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countFac,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countFac / nPerPage + 1),
      facturaciones: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      facturaciones: null,
    });
  }finally {
    conn.close()
  }
});

//EDIT
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const factura = JSON.parse(req.body.data);
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  if (req.file) factura.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
  };

  try {
    const result = await db.collection("facturaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          nro_factura: factura.nro_factura,
          archivo_factura: archivo,
          monto_neto: factura.monto_neto,
          porcentaje_impuesto: factura.porcentaje_impuesto,
          valor_impuesto: factura.valor_impuesto,
          sub_total: factura.sub_total,
          exento: factura.exento,
          descuento: factura.descuento,
          total: factura.total,
        },
      }
    );

    return res.status(200).json({
      message: SUCCESSFULL_UPDATE,
      result,
    });
  } catch (error) {
    return res.status(500).json({ msg: ERROR, error });
  }finally {
    conn.close()
  }
});

//INSERTAR DATOS DE FACTURACION
router.post("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let archivo = '';

    const obs = {
      obs: datos.observacion_factura,
      fecha: getDate(new Date()),
      estado: "Cargado"
    };

    let result = "";

    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `Factura_${datos.codigo}_${uuid()}`

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    };

    result = await db.collection("facturaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha_facturacion: datos.fecha_facturacion,
          estado_archivo: "Cargado",
          nro_factura: datos.nro_factura,
          archivo_factura: archivo,
          monto_neto: datos.monto_neto,
          porcentaje_impuesto: datos.porcentaje_impuesto,
          valor_impuesto: datos.valor_impuesto,
          sub_total: datos.sub_total,
          exento: datos.exento,
          descuento: datos.descuento,
          total: datos.total,
          representante: datos.representante,
          razon_social_empresa: datos.razon_social_empresa,
          email_empresa: datos.email_empresa,
        },
        $push: {
          observacion_factura: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Factura cargada exitosamente', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }

});

//INSERTAR FACTURA MASIVO
router.post("/", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let new_array = [];

    const obs = {
      obs: datos[0].observacion_factura,
      fecha: getDate(new Date()),
      estado: 'Cargado',
    };

    let result = "";

    datos[1].ids.forEach((element) => {
      new_array.push(ObjectID(element));
    });

    let archivo = '';
    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `INVOICE_GROUP_${datos[0].nro_factura}_${uuid()}`

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    };

    result = await db.collection("facturaciones").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          fecha_facturacion: datos[0].fecha_facturacion,
          estado_archivo: "Cargado",
          nro_factura: datos[0].nro_factura,
          archivo_factura: archivo,
          monto_neto: datos[0].monto_neto,
          porcentaje_impuesto: datos[0].porcentaje_impuesto,
          valor_impuesto: datos[0].valor_impuesto,
          sub_total: datos[0].sub_total,
          exento: datos[0].exento,
          descuento: datos[0].descuento,
          total: datos[0].total,
          representante: datos[0].representante,
          razon_social_empresa: datos[0].razon_social_empresa,
          email_empresa: datos[0].email_empresa,
        },
        $push: {
          observacion_factura: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Facturas cargas satisfactoriamente', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

//SUBIR OC
router.post("/subiroc/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const obs = {
    obs: datos.observacion_oc,
    fecha: getDate(new Date()),
    estado: "Cargado",
  };


  // if (req.file) {
  //   archivo = {
  //     name: req.file.originalname,
  //     size: req.file.size,
  //     path: req.file.path,
  //     type: req.file.mimetype,
  //   };
  // }

  try {
    let archivo = '';
    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `OC_${datos.codigo}_${uuid()}`

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    };

    const result = await db.collection("facturaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          archivo_oc: archivo,
          fecha_oc: datos.fecha_oc,
          hora_oc: datos.hora_oc,
          nro_oc: datos.nro_oc,
          estado_archivo: "Cargado",
          estado: "En Revisión",
        },
        $push: {
          observacion_oc: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Orden de compra cargada', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

//GET FILE FROM AWS S3
router.get('/downloadfile/:id/:type', async (req, res) => {
  const { id, type } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const evaluacion = await db.collection('facturaciones').findOne({ _id: ObjectID(id), isActive: true });
    if (!evaluacion) return res.status(500).json({ err: 98, msg: NOT_EXISTS, res: null });

    const pathPdf = type === 'oc' ? evaluacion.archivo_oc : type === 'invoice' ? evaluacion.archivo_factura : '';

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.status(500).json({ err: String(error), msg: 'error s3 get file', res: null });
      }
      else {
        return res.status(200).json({
          err: null,
          msg: 'Archivo descargado',
          res: data.Body,
          filename: pathPdf
        });
      };
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: 'Error al obtener archivo', res: null });
  }finally {
    conn.close()
  }
});

//SUBIR OC MASIVO
router.post("/oc/subiroc/many", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  let new_array = [];
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let obs = {};
    obs.obs = datos[0].observacion_oc;
    obs.fecha = getDate(new Date());
    obs.estado = "Cargado";

    datos[1].ids.forEach((element) => {
      new_array.push(ObjectID(element));
    });

    let archivo = '';
    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `OC_GROUP_NRO_${datos[0].nro_oc}_${uuid()}`

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    };

    const result = await db.collection("facturaciones").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          archivo_oc: archivo,
          fecha_oc: datos[0].fecha_oc,
          hora_oc: datos[0].hora_oc,
          nro_oc: datos[0].nro_oc,
          estado_archivo: "Cargado",
          estado: "En Revisión",
        },
        $push: {
          observacion_oc: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'OC Subidas satisfactoriamente', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

//CONFIRMAR OC
router.post("/confirmaroc/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const obs = {
      obs: data.observacion_oc,
      fecha: getDate(new Date()),
      estado: data.estado_archivo,
    };

    let estado = "";
    data.estado_archivo == "Aprobado"
      ? (estado = "En Facturacion")
      : (estado = "Ingresado");

    const result = await db.collection("facturaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: estado,
          estado_archivo: data.estado_archivo,
        },
        $push: {
          observacion_oc: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Orden de compra confirmada', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

//CONFIRMAR OC MASIVO
router.post("/oc/confirmaroc/many", async (req, res) => {
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });


  try {
    const conn = await connect();
    const db = conn.db('asis-db');

    let new_array = [];

    const obs = {
      obs: data[0].observaciones,
      fecha: getDate(new Date()),
      estado: data[0].estado_archivo,
    };

    const estado = data[0].estado_archivo == "Aprobado"
      ? 'En Facturacion'
      : 'Ingresado'

    data[1].ids.forEach((element) => {
      new_array.push(ObjectID(element));
    });

    const result = await db.collection("facturaciones").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          estado: estado,
          estado_archivo: data[0].estado_archivo,
        },
        $push: {
          observacion_oc: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'OC confirmada satisfactoriamente', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

// VALIDAR FACTURA
router.post("/validar/:id", async (req, res) => {
  const { id } = req.params;
  const {
    estado_archivo,
    observaciones,
    nro_nota_credito,
    fecha_nota_credito,
    monto_nota_credito,
    factura_anular,
  } = req.body;

  console.log(req.body)

  const conn = await connect();
  const db = conn.db('asis-db');
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let obs = {
      obs: observaciones,
      fecha: getDate(new Date()),
      estado: estado_archivo
    };

    let estado = "";

    estado_archivo == "Rechazado"
      ? (estado = "En Facturacion")
      : (estado = "Facturado");

    let result = await db.collection("facturaciones").findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: estado,
          estado_archivo: estado_archivo,
          nro_nota_credito: nro_nota_credito,
          fecha_nota_credito: fecha_nota_credito,
          monto_nota_credito: monto_nota_credito,
          factura_anular: factura_anular,
        },
        $push: {
          observacion_factura: obs,
        },
      }
    );

    if (estado_archivo == "Aprobado") {
      //insertar pago en modulo pago
      let codAsis = result.value.codigo;
      let gi = await db.collection("gi").findOne({
        rut: result.value.rut_cp,
        razon_social: result.value.razon_social_cp,
      });
      let servicio = await db
        .collection("solicitudes")
        .findOne({ codigo: codAsis.replace("FAC", "SOL") });

      await db.collection("pagos").insertOne({
        codigo: codAsis.replace("FAC", "PAG"),
        nombre_servicio: result.value.nombre_servicio,
        id_GI_personalAsignado: result.value.id_GI_personalAsignado,
        faena_seleccionada_cp: result.value.faena_seleccionada_cp,
        // valor_servicio: result.value.valor_servicio,
        rut_cp: result.value.rut_cp,
        razon_social_cp: result.value.razon_social_cp,
        rut_cs: result.value.rut_cs,
        razon_social_cs: result.value.razon_social_cs,
        lugar_servicio: result.value.lugar_servicio,
        sucursal: result.value.sucursal,
        estado: "No Pagado",
        fecha_facturacion: result.value.fecha_facturacion,
        nro_factura: result.value.nro_factura,
        credito: gi.credito,
        dias_credito: gi.dias_credito,
        valor_servicio: result.value.valor_servicio,
        valor_cancelado: 0,
        fecha_pago: getFechaPago(
          result.value.fecha_facturacion,
          Number(gi.dias_credito)
        ),
        pagos: [],
        isActive: true
      });

      console.log(gi)

      //si no tiene dias credito , pasa directo a cobranza
      if (getMinusculas(gi.credito) === "no" || (getMinusculas(gi.credito) === "si" && gi.dias_credito === 0)) {
        result = await db.collection("cobranza").insertOne({
          codigo: codAsis.replace("FAC", "COB"),
          nombre_servicio: result.value.nombre_servicio,
          faena_seleccionada_cp: result.value.faena_seleccionada_cp,
          valor_servicio: result.value.valor_servicio,
          categoria_cliente: gi.categoria,
          fecha_facturacion: result.value.fecha_facturacion,
          dias_credito: gi.dias_credito,
          rut_cp: result.value.rut_cp,
          razon_social_cp: result.value.razon_social_cp,
          rut_cs: result.value.rut_cs,
          razon_social_cs: result.value.razon_social_cs,
          lugar_servicio: result.value.lugar_servicio,
          sucursal: result.value.sucursal,
          estado: "Vencido",
          valor_servicio: result.value.valor_servicio,
          valor_cancelado: 0,
          valor_deuda: result.value.valor_servicio,
          cartas_cobranza: [],
          isActive: true
        });
      }
    }

    return res.status(200).json({ err: null, msg: 'Factura confirmada', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

//VALIDAR FACTURA MASIVO
router.post("/validar/factura/asis/many", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let estado = "";
    let estadoArchivo = "";
    let new_array = [];

    estadoArchivo = req.body[0].estado_archivo;

    const obs = {
      obs: req.body[0].observaciones,
      fecha: getDate(new Date()),
      estado: estadoArchivo,
    };

    estadoArchivo == "Rechazado"
      ? (estado = "En Facturacion")
      : (estado = "Facturado");

    req.body[1].ids.forEach((element) => {
      new_array.push(ObjectID(element));
    });

    let result = await db.collection("facturaciones").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          estado: estado,
          estado_archivo: req.body[0].estado_archivo,
          nro_nota_credito: req.body[0].nro_nota_credito,
          fecha_nota_credito: req.body[0].fecha_nota_credito,
          monto_nota_credito: req.body[0].monto_nota_credito,
          factura_anular: req.body[0].factura_anular,
        },
        $push: {
          observacion_factura: obs,
        },
      }
    );

    //si esta aprobada la factura, se ingresa a pagos
    if (req.body[0].estado_archivo == "Aprobado") {
      let resp = "";
      let codigoAsis = "";
      let arrayIDsCP = [];
      let serviciosArray = [];
      let arrayFacturaciones = [];
      let GIs = [];
      let gi = {};
      let Servicios = [];
      let servicio = {};

      resp = await db
        .collection("facturaciones")
        .find({ _id: { $in: new_array } })
        .toArray();

      resp.forEach((element) => {
        arrayIDsCP.push(element.rut_cp.toString());
      });

      resp.forEach((element) => {
        serviciosArray.push(element.codigo.replace("FAC", "SOL"));
      });

      GIs = await db
        .collection("gi")
        .find({
          rut: { $in: arrayIDsCP },
        })
        .toArray();

      Servicios = await db
        .collection("solicitudes")
        .find({ codigo: { $in: serviciosArray } })
        .toArray();

      resp.forEach((element) => {
        codigoAsis = element.codigo;
        codigoAsis = codigoAsis.replace("FAC", "PAG");
        //- se busca el gi correspondiente
        gi = GIs.find((gi) => gi.rut === element.rut_cp);
        //-
        //- se busca el servicio asociado
        servicio = Servicios.find(
          (serv) =>
            serv.codigo.replace("SOL", "FAC").toString() === element.codigo
        );
        //-
        arrayFacturaciones.push({
          codigo: codigoAsis,
          nombre_servicio: element.nombre_servicio,
          id_GI_personalAsignado: element.id_GI_personalAsignado,
          faena_seleccionada_cp: element.faena_seleccionada_cp,
          valor_servicio: element.valor_servicio,
          rut_cp: element.rut_cp,
          razon_social_cp: element.razon_social_cp,
          rut_cs: element.rut_cs,
          razon_social_cs: element.razon_social_cs,
          lugar_servicio: element.lugar_servicio,
          sucursal: element.sucursal,
          estado: "No Pagado",
          fecha_facturacion: element.fecha_facturacion,
          nro_factura: element.nro_factura,
          credito: gi.credito,
          dias_credito: gi.dias_credito,
          // valor_servicio: Number(servicio.precio),
          valor_cancelado: 0,
          fecha_pago: moment(element.fecha_facturacion, FORMAT_DATE).add(gi.dias_credito, 'days').format(FORMAT_DATE),
          pagos: [],
          isActive: true
        });
      });

      const resultPagos = await db
        .collection("pagos")
        .insertMany(arrayFacturaciones);

      //si no tiene dias credito , pasa directo a cobranza
      arrayFacturaciones = [];
      resp.forEach((element) => {
        //- se busca el gi correspondiente
        gi = GIs.find((gi) => gi.rut === element.rut_cp);
        //-
        //- se busca el servicio asociado
        servicio = Servicios.find(
          (serv) =>
            serv.codigo.replace("SOL", "FAC").toString() === element.codigo
        );
        //-
        if (getMinusculas(gi.credito) == "no") {
          arrayFacturaciones.push({
            codigo: servicio.codigo.replace("SOL", "COB"),
            nombre_servicio: element.nombre_servicio,
            faena_seleccionada_cp: element.faena_seleccionada_cp,
            valor_servicio: element.valor_servicio,
            categoria_cliente: gi.categoria,
            fecha_facturacion: element.fecha_facturacion,
            dias_credito: gi.dias_credito,
            rut_cp: element.rut_cp,
            razon_social_cp: element.razon_social_cp,
            rut_cs: element.rut_cs,
            razon_social_cs: element.razon_social_cs,
            lugar_servicio: element.lugar_servicio,
            sucursal: element.sucursal,
            estado: "Vencido",
            valor_servicio: Number(servicio.precio),
            valor_cancelado: 0,
            valor_deuda: Number(servicio.precio),
            cartas_cobranza: [],
            isActive: true
          });
        }
      });

      if (arrayFacturaciones.length > 0) {
        await db
          .collection("cobranza")
          .insertMany(arrayFacturaciones);

        // return res.json(resultCobranza);
      }
      // else {
      //   return res.json(resultPagos);
      // }
    }

    return res.status(200).json({ err: null, msg: 'Facturas confirmadas satisfactoriamente', res: [] })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }finally {
    conn.close()
  }
});

// ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("facturaciones")
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

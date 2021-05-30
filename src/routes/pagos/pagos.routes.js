import { Router } from "express";
import multer from "../../libs/multer";
import { v4 as uuid } from "uuid";
import { uploadFileToS3 } from "../../libs/aws";

const router = Router();
var AWS = require('aws-sdk');
var fs = require("fs");

import { verifyToken } from "../../libs/jwt";

import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR, SUCCESSFULL_INSERT, SUCCESSFULL_UPDATE } from "../../constant/text_messages";

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { AWS_BUCKET_NAME, OTHER_NAME_PDF } from "../../constant/var";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("pagos").find({ isActive: true }).toArray();
  return res.json(result);
});

//GET PENDING PAYMENTS
router.get("/pending", async (req, res) => {
  try {
    const db = await connect();
    const result = await db.collection('pagos').find({}).toArray();
    const filtered = result.filter((payment) => payment.estado !== 'Pagado');
    return res.status(200).json({ err: null, msg: 'Pagos encontrados', res: filtered })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }
})

//SELECT ONE
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db.collection('pagos').findOne({ _id: ObjectID(id) });

  return res.json(result);

})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countPagos = await db.collection("pagos")
    //   .find(dataToken.rol === 'Clientes' ? { rut_cp: dataToken.rut, isActive: true } : { isActive: true }).count();
    // const result = await db
    //   .collection("pagos")
    //   .find(dataToken.rol === 'Clientes' ? { rut_cp: dataToken.rut, isActive: true } : { isActive: true })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .toArray();

    const countPagos = await db.collection("pagos")
      .find({ isActive: true }).count();
    const result = await db
      .collection("pagos")
      .find({ isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      // auth: AUTHORIZED,
      total_items: countPagos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countPagos / nPerPage + 1),
      pagos: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      pagos: null,
      err: String(error)
    });
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  console.log([identificador, filtro, headFilter, pageNumber, nPerPage])

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
  let countPagos;

  try {
    // if (dataToken.rol !== 'Clientes') {
    //   if (identificador === 1) {
    //     countPagos = await db
    //       .collection("pagos")
    //       .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //       .count();

    //     result = await db
    //       .collection("pagos")
    //       .find({ rut_cp: rexExpresionFiltro, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countPagos = await db
    //       .collection("pagos")
    //       .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //       .count();
    //     result = await db
    //       .collection("pagos")
    //       .find({ razon_social_cp: rexExpresionFiltro, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // } else {
    //   if (identificador === 1) {
    //     countPagos = await db
    //       .collection("pagos")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .count();

    //     result = await db
    //       .collection("pagos")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    // countPagos = await db
    //   .collection("pagos")
    //   .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //   .count();
    // result = await db
    //   .collection("pagos")
    //   .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .toArray();
    //   }
    // }

    countPagos = await db
      .collection("pagos")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .count();
    result = await db
      .collection("pagos")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countPagos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countPagos / nPerPage + 1),
      pagos: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      pagos: null,
      err: String(error)
    });
  }
});

//INGRESAR PAGO
router.post("/nuevo/:id", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const { id } = req.params;
  console.log(req.body.data)
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (req.file) archivo = {
  //   name: req.file.originalname,
  //   size: req.file.size,
  //   path: req.file.path,
  //   type: req.file.mimetype,
  // };

  console.log(datos)

  try {
    let archivo = '';

    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `PAGO_${datos.codigo}_${uuid()}`

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

    const obj = {
      id: uuid(),
      fecha_pago: datos.fecha_pago,
      hora_pago: datos.hora_pago,
      sucursal: datos.sucursal,
      tipo_pago: datos.tipo_pago,
      monto: datos.monto,
      descuento: datos.descuento,
      total: datos.total,
      observaciones: datos.observaciones,
      institucion_bancaria: datos.institucion_bancaria,
      archivo_adjunto: archivo,
      isActive: true
    };

    let result = await db.collection("pagos").findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $inc: {
          valor_cancelado: obj.total,
        },
        $push: {
          pagos: obj,
        },
      },
      { returnOriginal: false }
    );

    //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
    let codigoPAG = result.value.codigo;
    let codigoCOB = codigoPAG.replace("PAG", "COB");
    //--

    if (
      result.value.valor_cancelado > 0 &&
      result.value.valor_cancelado < result.value.valor_servicio
    ) {
      result = await db.collection("pagos").updateOne(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Pago Parcial",
          },
        }
      );
    } else if (result.value.valor_cancelado === result.value.valor_servicio) {
      result = await db.collection("pagos").updateOne(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Pagado",
          },
        }
      );
    }

    //descontar de la deuda en cobranza si existe
    result = await db.collection("cobranza").findOneAndUpdate(
      { codigo: codigoCOB },
      {
        $inc: {
          valor_deuda: -obj.total,
          valor_cancelado: obj.total,
        },
      },
      { returnOriginal: false }
    );

    // y si la deuda se salda, pasar al estado al dia
    if (result && result.value?.valor_deuda === 0) {
      result = await db.collection("cobranza").updateOne(
        { codigo: codigoCOB },
        {
          $set: {
            estado: "Al Dia",
          },
        }
      );
    }

    return res.status(200).json({ err: null, msg: 'Pago ingresado correctamente', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

//INGRESO MASIVO DE PAGOS
router.post("/many", multer.single("archivo"), async (req, res) => {
  let datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {

    const db = await connect();

    let archivo = '';
    let new_array = [];

    datos[1].ids.forEach((element) => {
      new_array.push(ObjectID(element));
    });

    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `PAGO_GROUP_${uuid()}`

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

    let result = await db
      .collection("pagos")
      .find({ _id: { $in: new_array } })
      .forEach(function (c) {
        db.collection("pagos").updateOne(
          { _id: c._id },
          {
            $push: {
              pagos: {
                id: uuid(),
                fecha_pago: datos[0].fecha_pago,
                hora_pago: datos[0].hora_pago,
                sucursal: datos[0].sucursal,
                tipo_pago: datos[0].tipo_pago,
                monto: c.valor_servicio - c.valor_cancelado,
                descuento: datos[0].descuento,
                total: c.valor_servicio - c.valor_cancelado,
                observaciones: datos[0].observaciones,
                institucion_bancaria: datos[0].institucion_bancaria,
                archivo_adjunto: archivo,
                isActive: true
              },
            },
            $set: {
              valor_cancelado: c.valor_servicio,
              estado: "Pagado",
            },
          }
        );
      });

    //pasar los codigos de pago a cobranza
    let codesCobranza = datos[2].codes;
    codesCobranza = codesCobranza.map((e) => (e = e.replace("PAG", "COB")));

    result = await db
      .collection("cobranza")
      .find({ codigo: { $in: codesCobranza } })
      .forEach(function (c) {
        db.collection("cobranza").updateOne(
          { codigo: c.codigo },
          {
            $set: {
              valor_cancelado: c.valor_servicio,
              valor_deuda: 0,
              estado: "Al Dia",
            },
          }
        );
      });

    return res.status(200).json({
      err: null,
      msg: "Pagos realizados satisfactoriamente",
      res: result
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  }
});

//EDIT PAGO
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let datos = JSON.parse(req.body.data);
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let archivo = {};

  if (req.file) archivo = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
  };

  let obj = {};
  obj.id = datos.id;
  obj.fecha_pago = datos.fecha_pago;
  obj.hora_pago = datos.hora_pago;
  obj.sucursal = datos.sucursal;
  obj.tipo_pago = datos.tipo_pago;
  obj.monto = datos.monto;
  obj.descuento = datos.descuento;
  obj.total = datos.total;
  obj.observaciones = datos.observaciones;
  obj.institucion_bancaria = datos.institucion_bancaria;
  obj.archivo_adjunto = archivo;

  //1.- traigo la coleccion
  const coleccionPago = await db
    .collection("pagos")
    .findOne({ _id: ObjectID(id) });

  //2.- Edito el pago correspondiente en el array
  if (coleccionPago) {
    const arrayPagos = coleccionPago.pagos;
    const pagos = arrayPagos.map(function (e) {
      if (e.id === obj.id) {
        e.fecha_pago = obj.fecha_pago;
        e.hora_pago = obj.hora_pago;
        e.sucursal = obj.sucursal;
        e.tipo_pago = obj.tipo_pago;
        e.monto = obj.monto;
        e.descuento = obj.descuento;
        e.total = obj.total;
        e.observaciones = obj.observaciones;
        e.institucion_bancaria = obj.institucion_bancaria;
        e.archivo_adjunto = obj.archivo_adjunto;
      }
      return e;
    });

    //3.- sumo los totales de los pagos nuevamente
    const sumPrices = (sumador, nextItem) => sumador + nextItem.total;
    let total = pagos.reduce(sumPrices, 0);
    let deuda = coleccionPago.valor_servicio - total;

    //4.- edito la coleccion de pagos
    let result = await db.collection("pagos").findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: {
          valor_cancelado: total,
          pagos: pagos,
        },
      },
      { returnOriginal: false }
    );

    //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
    let codigoPAG = result.value.codigo;
    let codigoCOB = codigoPAG.replace("PAG", "COB");
    //--

    if (
      result.value.valor_cancelado > 0 &&
      result.value.valor_cancelado < result.value.valor_servicio
    ) {
      result = await db.collection("pagos").updateOne(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Pago Parcial",
          },
        }
      );
    } else if (result.value.valor_cancelado === result.value.valor_servicio) {
      result = await db.collection("pagos").updateOne(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Pagado",
          },
        }
      );
    }

    //descontar de la deuda en cobranza si existe
    result = await db.collection("cobranza").findOneAndUpdate(
      { codigo: codigoCOB },
      {
        $set: {
          valor_deuda: deuda,
          valor_cancelado: total,
        },
      },
      { returnOriginal: false }
    );

    // y si la deuda se salda, pasar al estado al dia
    if (result.value.valor_deuda === 0) {
      result = await db.collection("cobranza").updateOne(
        { codigo: codigoCOB },
        {
          $set: {
            estado: "Al Dia",
          },
        }
      );
    }

    return res.json(result);
  }
});

//DELETE PAGO
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const pago = JSON.parse(req.query.data);
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  //1.- traigo la coleccion
  const coleccionPago = await db
    .collection("pagos")
    .findOne({ _id: ObjectID(id) });

  let pagos = coleccionPago.pagos;

  if (coleccionPago) {
    for (let index = 0; index < pagos.length; index++) {
      const element = pagos[index];
      if (element.id === pago.id) {
        pagos.splice(index, 1);
      }
    }
  }

  //sumo los totales de los pagos nuevamente
  const sumPrices = (sumador, nextItem) => sumador + nextItem.total;
  let total = pagos.reduce(sumPrices, 0);
  let deuda = coleccionPago.valor_servicio - total;

  //edito la coleccion de pagos
  let result = await db.collection("pagos").findOneAndUpdate(
    { _id: ObjectID(id) },
    {
      $set: {
        valor_cancelado: total,
        pagos: pagos,
      },
    },
    { returnOriginal: false }
  );

  //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
  let codigoPAG = result.value.codigo;
  let codigoCOB = codigoPAG.replace("PAG", "COB");
  //--

  if (
    result.value.valor_cancelado > 0 &&
    result.value.valor_cancelado < result.value.valor_servicio
  ) {
    result = await db.collection("pagos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: "Pago Parcial",
        },
      }
    );
  } else if (result.value.valor_cancelado === result.value.valor_servicio) {
    result = await db.collection("pagos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: "Pagado",
        },
      }
    );
  }

  //descontar de la deuda en cobranza si existe
  result = await db.collection("cobranza").findOneAndUpdate(
    { codigo: codigoCOB },
    {
      $set: {
        valor_deuda: deuda,
        valor_cancelado: total,
      },
    },
    { returnOriginal: false }
  );

  // y si la deuda se salda, pasar al estado al dia
  if (result.value.valor_deuda === 0) {
    result = await db.collection("cobranza").updateOne(
      { codigo: codigoCOB },
      {
        $set: {
          estado: "Al Dia",
        },
      }
    );
  };

  return res.json(result);
});

// ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("pagos")
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

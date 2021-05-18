import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getMinusculas } from "../../functions/changeToMiniscula";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";
import sendinblue from "../../libs/sendinblue/sendinblue";
import { isRolReservas } from "../../functions/isRol";

import { verifyToken } from "../../libs/jwt";

import {
  MESSAGE_UNAUTHORIZED_TOKEN,
  UNAUTHOTIZED,
  ERROR_MESSAGE_TOKEN,
  AUTHORIZED, ERROR,
  SUCCESSFULL_UPDATE,
  CONFIRM_SUCCESSFULL,
  DELETE_SUCCESSFULL
} from "../../constant/text_messages";


const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { NOT_EXISTS } from "../../constant/var";

//SELECT
router.get('/', async (req, res) => {
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED, ERROR });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection("reservas").find({ isActive: true }).toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: ERROR, error });
  }

})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED, ERROR });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countRes = await db.collection("reservas").find({...isRolReservas(dataToken.rol, dataToken.id), isActive: true}).count();
    const countRes = await db.collection("reservas").find({ isActive: true }).count();
    // const result = await db
    //   .collection("reservas")
    //   .find({...isRolReservas(dataToken.rol, dataToken.id), isActive: true})
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .sort({ codigo: -1 })
    //   .toArray();
    const result = await db
      .collection("reservas")
      .find({ isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .sort({ codigo: -1 })
      .toArray();

    return res.status(200).json({
      // auth: AUTHORIZED,
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      reservas: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      reservas: null,
      err: String(error)
    });
  }
});

//SELECT RESERVATIONS TO CONFIRM
router.get('/ingresadas', async (req, res) => {
  try {
    const db = await connect();
    const result = await db.collection('reservas').find({ estado: 'Ingresado' }).toArray();

    return res.status(200).json({
      err: null,
      msg: 'Reservas encontradas',
      res: result
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: String(error),
      msg: 'No se ha podido cargar las reservas',
      res: null
    });
  }
});

//SELECT ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection("reservas").findOne({ _id: ObjectID(id), isActive: true });
    return res.status(200).json({ err: null, msg: '', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

//BUSCAR POR RUT O NOMBRE
router.post('/buscar', async (req, res) => {
  const { identificador, filtro, pageNumber, headFilter, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();
  let rutFiltrado;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countRes;

  try {

    // if (dataToken.rol === 'Clientes') {
    //   countRes = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else if (dataToken.rol === 'Colaboradores') {
    //   countRes = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else {
    //   countRes = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("reservas")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // };

    countRes = await db
      .collection("reservas")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .count();

    result = await db
      .collection("reservas")
      .find({ [headFilter]: rexExpresionFiltro, isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      reservas: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      reservas: null,
      err: String(error)
    });
  }
})

//EDITAR RESERVA
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  const { id } = req.params;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let archivo = {};

  const obs = {
    obs: datos.observacion,
    fecha: getDate(new Date())
  }

  if (req.file) archivo = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
  };

  try {
    await db.collection("reservas").updateOne(
      { _id: ObjectID(id), isActive: true },
      {
        $set: {
          fecha_reserva: datos.fecha_reserva,
          hora_reserva: datos.hora_reserva,
          fecha_reserva_fin: datos.fecha_reserva_fin,
          hora_reserva_fin: datos.hora_reserva_fin,
          jornada: datos.jornada,
          mes: datos.mes,
          anio: datos.anio,
          id_GI_personalAsignado: datos.id_GI_personalAsignado,
          sucursal: datos.sucursal,
          url_file_adjunto: archivo,
        },
        $push: {
          observacion: obs,
        },
      }
    );
    return res.status(200).json({ err: null, msg: SUCCESSFULL_UPDATE, res: [] });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }

});

//CONFIRMAR RESERVA
router.post("/confirmar/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const datos = JSON.parse(req.body.data);
  const db = await connect();
  // const token = req.headers['x-access-token'];

  // let archivo = {};

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  const obs = {
    obs: datos.observacion,
    fecha: getDate(new Date())
  }

  let result = [];
  let codAsis = "";

  // if (req.file) {
  //   archivo = {
  //     name: req.file.originalname,
  //     size: req.file.size,
  //     path: req.file.path,
  //     type: req.file.mimetype,
  //   };
  // }

  try {
    result = await db.collection("reservas").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha_reserva: datos.fecha_reserva,
          fecha_reserva_fin: datos.fecha_reserva_fin,
          hora_reserva: datos.hora_reserva,
          hora_reserva_fin: datos.hora_reserva_fin,
          id_GI_personalAsignado: datos.id_GI_personalAsignado,
          sucursal: datos.sucursal,
          url_file_adjunto_confirm: {},
          estado: "Reservado",
          reqEvaluacion: getMinusculas(datos.reqEvaluacion),
        },
        $push: {
          observacion: obs,
        },
      }
    );
    const reserva = await db
      .collection("reservas")
      .findOne({ _id: ObjectID(id) });

    if (getMinusculas(datos.reqEvaluacion) == "si" && result.result.ok == 1) {
      //insertamos la evaluacion
      codAsis = reserva.codigo;
      codAsis = codAsis.replace("AGE", "EVA");

      await db.collection("evaluaciones").insertOne({
        id_GI_personalAsignado: reserva.id_GI_personalAsignado,
        codigo: codAsis,
        valor_servicio: reserva.valor_servicio,
        faena_seleccionada_cp: reserva.faena_seleccionada_cp,
        fecha_evaluacion: reserva.fecha_reserva,
        fecha_evaluacion_fin: reserva.fecha_reserva_fin,
        hora_inicio_evaluacion: reserva.hora_reserva,
        hora_termino_evaluacion: reserva.hora_reserva_fin,
        mes: reserva.mes,
        anio: reserva.anio,
        nombre_servicio: reserva.nombre_servicio,
        rut_cp: reserva.rut_cp,
        razon_social_cp: reserva.razon_social_cp,
        rut_cs: reserva.rut_cs,
        razon_social_cs: reserva.razon_social_cs,
        lugar_servicio: reserva.lugar_servicio,
        sucursal: reserva.sucursal,
        observaciones: [],
        estado_archivo: "Sin Documento",
        estado: "Ingresado",
        isActive: true
      });
    } else {
      //verificar si tiene OC o no el GI
      let gi = await db
        .collection("gi")
        .findOne({ rut: reserva.rut_cp, categoria: "Empresa/Organización" });
      var isOC = "";
      let estado_archivo = "";
      let estado = "";

      if (gi) {
        isOC = gi.orden_compra;
        if (isOC == "Si") {
          (estado_archivo = "Sin Documento"), (estado = "Ingresado");
        } else {
          (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
        }
      } else {
        isOC = "No";
        (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
      }
      //pasa directo a facturaciones
      codAsis = reserva.codigo;
      codAsis = codAsis.replace("AGE", "FAC");
      result = await db.collection("facturaciones").insertOne({
        codigo: codAsis,
        nombre_servicio: reserva.nombre_servicio,
        id_GI_personalAsignado: reserva.id_GI_personalAsignado,
        faena_seleccionada_cp: reserva.faena_seleccionada_cp,
        valor_servicio: reserva.valor_servicio,
        rut_cp: reserva.rut_cp,
        razon_social_cp: reserva.razon_social_cp,
        rut_cs: reserva.rut_cs,
        razon_social_cs: reserva.razon_social_cs,
        lugar_servicio: reserva.lugar_servicio,
        sucursal: reserva.sucursal,
        condicionantes: "",
        vigencia_examen: "",
        oc: isOC,
        archivo_oc: null,
        fecha_oc: "",
        hora_oc: "",
        nro_oc: "",
        observacion_oc: [],
        observacion_factura: [],
        estado: estado,
        estado_archivo: estado_archivo,
        fecha_facturacion: "",
        nro_factura: "",
        archivo_factura: null,
        monto_neto: 0,
        porcentaje_impuesto: "",
        valor_impuesto: 0,
        sub_total: 0,
        exento: 0,
        descuento: 0,
        total: 0,
        isActive: true
      });
    }

    // const profesionalAsignado = await db
    //   .collection("gi")
    //   .findOne({ _id: ObjectID(datos.id_GI_profesional_asignado) });

    // const clientePrincipal = await db
    //   .collection("gi")
    //   .findOne({ _id: ObjectID(reserva.id_GI_Principal) });

    // const clienteSecundario = await db
    //   .collection("gi")
    //   .findOne({ _id: ObjectID(reserva.id_GI_Secundario) });

    return res.status(200).json({
      err: null,
      msg: CONFIRM_SUCCESSFULL,
      res: []
    });
  } catch (error) {
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  }
});

//CONFIRMACION MASIVA DE RESERVAS
router.post("/confirmar", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let datosJson = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores' || dataToken.rol === 'Emppleados')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let new_array = [];
  // let archivo = {};

  const obs = {
    obs: datosJson[0].observacion,
    fecha: getDate(new Date())
  };

  //verificar si hay archivo o no
  // if (req.file) archivo = {
  //   name: req.file.originalname,
  //   size: req.file.size,
  //   path: req.file.path,
  //   type: req.file.mimetype,
  // };

  datosJson[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  // Se editan las reservas de forma masiva
  const result = db.collection("reservas").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        fecha_reserva: datosJson[0].fecha_reserva,
        fecha_reserva_fin: datosJson[0].fecha_reserva_fin,
        hora_reserva: datosJson[0].hora_reserva,
        hora_reserva_fin: datosJson[0].hora_reserva_fin,
        id_GI_personalAsignado: datosJson[0].id_GI_personalAsignado,
        sucursal: datosJson[0].sucursal,
        url_file_adjunto_confirm: {},
        estado: "Reservado",
        reqEvaluacion: getMinusculas(datosJson[0].reqEvaluacion),
      },
      $push: {
        observacion: obs,
      },
    }
  );

  let resp = "";
  let codigoAsis = "";
  let arrayEvaluaciones = [];

  // Se insertan las evaluaciones o las facturaciones dependiendo del caso
  resp = await db
    .collection("reservas")
    .find({ _id: { $in: new_array } })
    .toArray();

  if (getMinusculas(datosJson[0].reqEvaluacion) === "si" && result) {
    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("AGE", "EVA");
      arrayEvaluaciones.push({
        id_GI_personalAsignado: element.id_GI_personalAsignado,
        codigo: codigoAsis,
        valor_servicio: element.valor_servicio,
        faena_seleccionada_cp: element.faena_seleccionada_cp,
        fecha_evaluacion: element.fecha_reserva,
        fecha_evaluacion_fin: element.fecha_reserva_fin,
        hora_inicio_evaluacion: element.hora_reserva,
        hora_termino_evaluacion: element.hora_reserva_fin,
        mes: element.mes,
        anio: element.anio,
        nombre_servicio: element.nombre_servicio,
        rut_cp: element.rut_cp,
        razon_social_cp: element.razon_social_cp,
        rut_cs: element.rut_cs,
        razon_social_cs: element.razon_social_cs,
        lugar_servicio: element.lugar_servicio,
        sucursal: element.sucursal,
        observaciones: [],
        estado_archivo: "Sin Documento",
        estado: "Ingresado",
        isActive: true
      });
    });

    const resultEva = await db
      .collection("evaluaciones")
      .insertMany(arrayEvaluaciones);

    return res.status(200).json({
      err: null,
      msg: 'Reservas confirmadas correctamente',
      res: resultEva
    });

  } else {
    let arrayIDsCP = [];
    let isOC = "";
    let estado_archivo = "";
    let estado = "";

    resp.forEach((element) => {
      arrayIDsCP.push(ObjectID(element.id_GI_Principal));
    });

    let GIs = await db
      .collection("gi")
      .find({ _id: { $in: arrayIDsCP }, categoria: "Empresa/Organización" })
      .toArray();

    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("AGE", "FAC");
      // gi = GIs.map((gi) => gi._id === element.id_GI_Principal);
      const gi = GIs.find(
        (gi) => gi._id.toString() === element.id_GI_Principal
      );

      if (gi) {
        isOC = gi.orden_compra;
        if (isOC == "Si") {
          (estado_archivo = "Sin Documento"), (estado = "Ingresado");
        } else {
          (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
        }
      } else {
        isOC = "No";
        (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
      }

      arrayReservas.push({
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
        condicionantes: "",
        vigencia_examen: "",
        oc: isOC,
        archivo_oc: null,
        fecha_oc: "",
        hora_oc: "",
        nro_oc: "",
        observacion_oc: [],
        observacion_factura: [],
        estado: estado,
        estado_archivo: estado_archivo,
        fecha_facturacion: "",
        nro_factura: "",
        archivo_factura: null,
        monto_neto: 0,
        porcentaje_impuesto: "",
        valor_impuesto: 0,
        sub_total: 0,
        exento: 0,
        descuento: 0,
        total: 0,
        isActive: true
      });
    });

    const resultFac = await db
      .collection("facturaciones")
      .insertMany(arrayReservas);

    return res.status(200).json({
      err: null,
      msg: 'Reservas confirmadas correctamente',
      res: resultFac
    });
  }
});

//DELETE / ANULAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  try {
    const existReserva = await db.collection('reservas').findOne({ _id: ObjectID(id) });
    if (!existReserva) return res.status(200).json({ err: 98, msg: `${NOT_EXISTS}: reserva`, res: [] });
    // console.log(existReserva);
    const codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
    const existSolicitud = await db.collection('solicitudes').findOne({ codigo: codeSolicitud });

    if (!existSolicitud) return res.status(200).json({ err: 98, msg: `${NOT_EXISTS}: solicitud`, res: [] });

    await db.collection('reservas').updateOne({ _id: ObjectID(id) }, {
      $set: {
        isActive: false
      }
    });
    await db.collection('solicitudes').updateOne({ codigo: codeSolicitud }, {
      $set: {
        isActive: false
      }
    });
    return res.status(200).json({ err: null, msg: DELETE_SUCCESSFULL, res: [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

// ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("reservas")
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

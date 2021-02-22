import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getDate } from "../../functions/getDateNow";
import excelToJson from "../../functions/insertManyGis/excelToJson";
import sendinblue from "../../libs/sendinblue/sendinblue";
import { isRolSolicitudes } from "../../functions/isRol";
import createSolicitudes from "../../functions/insertManySolicitudes/createJsonSolForInsert";
import addCodeSolicitud from "../../functions/insertManySolicitudes/addCodeSolicitud";
// const addDays = require("add-days");
import moment from "moment";
moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
  weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
}
);

import { verifyToken } from "../../libs/jwt";

import { 
  MESSAGE_UNAUTHORIZED_TOKEN, 
  UNAUTHOTIZED, 
  ERROR_MESSAGE_TOKEN, 
  AUTHORIZED, ERROR, 
  SUCCESSFULL_INSERT, 
  SUCCESSFULL_UPDATE,
  DELETE_SUCCESSFULL } from "../../constant/text_messages";

import multer from "../../libs/multer";

const router = Router();
const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("solicitudes").find({ isActive: true }).toArray();

  return res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const countSol = await db.collection("solicitudes").find({...isRolSolicitudes(dataToken.rol, dataToken.id), isActive: true}).count();
    const result = await db
      .collection("solicitudes")
      .find({...isRolSolicitudes(dataToken.rol, dataToken.id), isActive: true})
      .skip(skip_page)
      .limit(nPerPage)
      .sort({ codigo: -1 })
      .toArray();

    return res.json({
      auth: AUTHORIZED,
      total_items: countSol,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSol / nPerPage + 1),
      solicitudes: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: ERROR, error });
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const db = await connect();
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  };

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countSol;

  try {

    if (dataToken.rol === 'Clientes') {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else if (dataToken.rol === 'Colaboradores') {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.status(200).json({
      total_items: countSol,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSol / nPerPage + 1),
      solicitudes: result,
    });

  } catch (error) {
    return res.status(500).json({ mgs: ERROR, error });
  }
});

//SELECT FIELDS TO CONFIRM SOLICITUD
router.get("/mostrar/:id", async (req, res) => {
  const db = await connect();
  const { id } = req.params;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const resultSol = await db
    .collection("solicitudes")
    .findOne({ _id: ObjectID(id) });
  const resultGI = await db
    .collection("gi")
    .findOne({ _id: ObjectID(resultSol.id_GI_Principal) });

  resultSol.email_gi = resultGI.email_central !== null ? resultGI.email_central : '';

  return res.status(200).json(resultSol);
});

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let newSolicitud = JSON.parse(req.body.data);
  const nuevaObs = newSolicitud.observacion_solicitud;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const items = await db.collection("solicitudes").find({isActive: true}).toArray();

  if (!items) return res.status(401).json({ msg: "No se ha podido encontrar la solicitud seleccionada" });

  (items.length > 0)
    ? newSolicitud.codigo = `ASIS-SOL-${YEAR}-${calculate(items[items.length - 1])}`
    : newSolicitud.codigo = `ASIS-SOL-${YEAR}-00001`;

  newSolicitud.observacion_solicitud = [];
  newSolicitud.observacion_solicitud.push({
    obs: nuevaObs,
    fecha: getDate(new Date()),
  });

  (req.file)
    ? newSolicitud.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    }
    : newSolicitud.url_file_adjunto = {};

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  try {
    newSolicitud.isActive = true;
    const result = await db.collection("solicitudes").insertOne(newSolicitud);

    //envio correo
    if (result.result.ok === 1) {
      const gi = await db
        .collection("gi")
        .findOne({ _id: ObjectID(result.ops[0].id_GI_Principal) });
    };

    return res.status(200).json({ msg: SUCCESSFULL_INSERT, result });

  } catch (error) {

    return res.status(500).json({ msg: ERROR, error });

  }

});

//TEST PARA RECIBIR EXCEL DE INGRESO MASIVO DE SOLICITUDES
router.post("/masivo", multer.single("archivo"), async (req, res) => {
  const { nombre } = req.body;
  const db = await connect();
  const data = excelToJson(req.file.path, "PLANTILLA SOL_ASIS");

  try {
    if (data.length > 0) {

      const gis = await db.collection('gi').find().toArray();
      let solicitudes = createSolicitudes(data, gis);

      if (solicitudes.length === 0) {
        return res.json({
          message: "Ha ocurrido un error y no se ha insertado el archivo",
          solicitudes
        });
      };

      const lastSolicitud = await db
        .collection("solicitudes")
        .find({})
        .sort({ codigo: -1 })
        .limit(1)
        .toArray();

      solicitudes = addCodeSolicitud(solicitudes, lastSolicitud[0], YEAR);

      const result = await db.collection('solicitudes').insertMany(solicitudes);

      return res.json({
        message: "Solicitudes Ingresadas",
        isOK: true,
        inserted: result
      });

    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "Algo ha salido mal",
      isOK: false,
      error: err,
    });
  }
});

//EDITAR SOLICITUD
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  if (req.file)
    solicitud.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };

  try {
    await db.collection("solicitudes").updateOne(
      { _id: ObjectID(id), isActive: true },
      {
        $set: {
          id_GI_Principal: solicitud.id_GI_Principal,
          id_GI_Secundario: solicitud.id_GI_Secundario,
          id_GI_PersonalAsignado: solicitud.id_GI_PersonalAsignado,
          rut_CP: solicitud.rut_CP,
          razon_social_CP: solicitud.razon_social_CP,
          nro_contrato_seleccionado_cp: solicitud.nro_contrato_seleccionado_cp,
          faena_seleccionada_cp: solicitud.faena_seleccionada_cp,
          rut_cs: solicitud.rut_cs,
          razon_social_cs: solicitud.razon_social_cs,
          fecha_solicitud: solicitud.fecha_solicitud,
          fecha_servicio_solicitado: solicitud.fecha_servicio_solicitado,
          mes_solicitud: solicitud.mes_solicitud,
          anio_solicitud: solicitud.anio_solicitud,
          nombre_receptor: solicitud.nombre_receptor,
          categoria1: solicitud.categoria1,
          categoria2: solicitud.categoria2,
          categoria3: solicitud.categoria3,
          nombre_servicio: solicitud.nombre_servicio,
          tipo_servicio: solicitud.tipo_servicio,
          monto_neto: solicitud.monto_neto,
          porcentaje_impuesto: solicitud.porcentaje_impuesto,
          valor_impuesto: solicitud.valor_impuesto,
          precio: solicitud.precio,
          costo_estimado: solicitud.costo_estimado,
          lugar_servicio: solicitud.lugar_servicio,
          sucursal: solicitud.sucursal,
          hora_servicio_solicitado: solicitud.hora_servicio_solicitado,
          fecha_servicio_solicitado_termino:
            solicitud.fecha_servicio_solicitado_termino,
          hora_servicio_solicitado_termino:
            solicitud.hora_servicio_solicitado_termino,
          jornada: solicitud.jornada,
          hora_solicitud: solicitud.hora_solicitud,
          estado: solicitud.estado,
          codigo: solicitud.codigo,
          url_file_adjunto: solicitud.url_file_adjunto,
        },
        $push: {
          observacion_solicitud: {
            obs: solicitud.observacion_solicitud,
            fecha: getDate(new Date()),
          },
        },
      }
    );

    return res.status(200).json({ msg: SUCCESSFULL_UPDATE });
  } catch (error) {
    return res.status(500).json({ msg: ERROR, error });
  }
});

//CONFIRMAR SOLICITUD
router.post("/confirmar/:id", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;

  let archivo = {};

  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  const obs = {
    obs: solicitud.observacion_solicitud,
    fecha: getDate(new Date())
  }

  //verificar si hay archivo o no
  if (req.file) archivo = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
  };

  //obtener mail del cliente principal
  const resultSol = await db.collection("solicitudes").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        fecha_confirmacion: solicitud.fecha_solicitud,
        hora_confirmacion: solicitud.hora_solicitud,
        medio_confirmacion: solicitud.medio_confirmacion,
        url_file_adjunto_confirm: archivo,
        estado: "Confirmado",
      },
      $push: {
        observacion_solicitud: obs,
      },
    }
  );

  if (resultSol.result.ok) {
    const resultGI = await db.collection("gi").updateOne(
      { _id: ObjectID(solicitud.id_GI_Principal) },
      {
        $set: {
          email_central: solicitud.email_central,
        },
      }
    );
    if (resultGI.result.ok) {
      //-------------------------------------CREAR LA RESERVA-----------------------
      const resp = await db
        .collection("solicitudes")
        .findOne({ _id: ObjectID(id) });

      let codigoAsis = resp.codigo;
      codigoAsis = codigoAsis.replace("SOL", "AGE");
      const newReserva = {
        codigo: codigoAsis,
        id_GI_Principal: resp.id_GI_Principal,
        id_GI_Secundario: resp.id_GI_Secundario,
        id_GI_personalAsignado: resp.id_GI_PersonalAsignado,
        faena_seleccionada_cp: resp.faena_seleccionada_cp,
        valor_servicio: resp.monto_total,
        rut_cp: resp.rut_CP,
        razon_social_cp: resp.razon_social_CP,
        rut_cs: resp.rut_cs,
        razon_social_cs: resp.razon_social_cs,
        fecha_reserva: resp.fecha_servicio_solicitado,
        hora_reserva: resp.hora_servicio_solicitado,
        fecha_reserva_fin: resp.fecha_servicio_solicitado_termino,
        hora_reserva_fin: resp.hora_servicio_solicitado_termino,
        jornada: resp.jornada,
        mes: resp.mes_solicitud,
        anio: resp.anio_solicitud,
        nombre_servicio: resp.nombre_servicio,
        lugar_servicio: resp.lugar_servicio,
        sucursal: resp.sucursal,
        url_file_adjunto: archivo,
        observacion: [],
        estado: "Ingresado",
        isActive: true
      };

      const resulReserva = await db
        .collection("reservas")
        .insertOne(newReserva);

      return res.json(resulReserva);
    }
  }
});

//CONFIRM MANY
router.post("/many", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let dataJson = JSON.parse(req.body.data);
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let new_array = [];
  let archivo = {};
  const obs = {
    obs: dataJson[0].observacion_solicitud,
    fecha: getDate(new Date())
  }
  // let obs = {};
  // obs.obs = dataJson[0].observacion_solicitud;
  // obs.fecha = getDate(new Date());

  dataJson[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  //verificar si hay archivo o no
  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }
  else {
    archivo = {};
  }

  try {
    db.collection("solicitudes").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          fecha_confirmacion: dataJson[0].fecha_solicitud,
          hora_confirmacion: dataJson[0].hora_solicitud,
          medio_confirmacion: dataJson[0].medio_confirmacion,
          url_file_adjunto_confirm: archivo,
          estado: "Confirmado",
        },
        $push: {
          observacion_solicitud: obs,
        },
      }
    );

    // se crea el array de objetos para la insercion de reservas
    let resp = "";
    let codigoAsis = "";
    let arrayReservas = [];

    resp = await db
      .collection("solicitudes")
      .find({ _id: { $in: new_array } })
      .toArray();

    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("SOL", "AGE");
      arrayReservas.push({
        codigo: codigoAsis,
        id_GI_Principal: element.id_GI_Principal,
        id_GI_Secundario: element.id_GI_Secundario,
        id_GI_personalAsignado: element.id_GI_PersonalAsignado,
        faena_seleccionada_cp: element.faena_seleccionada_cp,
        valor_servicio: element.precio,
        rut_cp: element.rut_CP,
        razon_social_cp: element.razon_social_CP,
        rut_cs: element.rut_cs,
        razon_social_cs: element.razon_social_cs,
        fecha_reserva: element.fecha_servicio_solicitado,
        hora_reserva: element.hora_servicio_solicitado,
        fecha_reserva_fin: element.fecha_servicio_solicitado_termino,
        hora_reserva_fin: element.hora_servicio_solicitado_termino,
        jornada: element.jornada,
        mes: element.mes_solicitud,
        anio: element.anio_solicitud,
        nombre_servicio: element.nombre_servicio,
        lugar_servicio: element.lugar_servicio,
        sucursal: element.sucursal,
        observacion: [],
        estado: "Ingresado",
        isActive: true
      });
    });

    const resultReserva = await db
      .collection("reservas")
      .insertMany(arrayReservas);

    return res.status(200).json({ msg: SUCCESSFULL_UPDATE, resultReserva });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: ERROR, error });
  }
});

//DELETE / ANULAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  try {
    await db.collection('solicitudes').updateOne({ _id: ObjectID(id) }, {
      $set:{
        isActive: false
      }
    });
    return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'ok' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: ERROR, err: String(error), status: 'error' });
  }
});

router.delete('/deletemany/many', async (req, res) => {
  const db = await connect();
  try {
    
    let ids = [];
    let contador = 6210;

    for (let i = 0; i < 533; i++) {
      ids.push(`ASIS-SOL-2021-0${contador}`);
      contador++;   
    };

    await db.collection('solicitudes').deleteMany({ codigo: { $in: ids } });

    return res.status(200).json({ msg: 'solicitudes eliminadas' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'error', err: String(error) });
  }
});

export default router;

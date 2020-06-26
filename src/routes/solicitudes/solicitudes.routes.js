import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getDate } from "../../functions/getDateNow";
const addDays = require("add-days");

import multer from "../../libs/multer";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("solicitudes").find({}).toArray();
  res.json(result);
});

//SELECT FIELDS TO CONFIRM SOLICITUD
router.get("/mostrar/:id", async (req, res) => {
  const db = await connect();
  const { id } = req.params;
  const resultFinal = {};
  const resultSol = await db
    .collection("solicitudes")
    .findOne({ _id: ObjectID(id) });
  const resultGI = await db
    .collection("gi")
    .findOne({ _id: ObjectID(resultSol.id_GI_Principal) });
  resultSol.email_gi = resultGI.email_central;
  res.json(resultSol);
});

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let newSolicitud = JSON.parse(req.body.data);
  const nuevaObs = newSolicitud.observacion_solicitud;
  const items = await db.collection("solicitudes").find({}).toArray();
  if (items.length > 0) {
    newSolicitud.codigo = `ASIS-SOL-${YEAR}-${calculate(
      items[items.length - 1]
    )}`;
  } else {
    newSolicitud.codigo = `ASIS-SOL-${YEAR}-00001`;
  }
  newSolicitud.observacion_solicitud = [];
  newSolicitud.observacion_solicitud.push({
    obs: nuevaObs,
    fecha: getDate(new Date()),
  });

  newSolicitud.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype
  };

  const result = await db.collection("solicitudes").insertOne(newSolicitud);
  res.json(result);
});

//EDITAR SOLICITUD
router.put("/:id", multer.single("archivo"), async (req, res) =>{
  const db = await connect()
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;

  solicitud.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype
  }

  try {
    const result = await db
      .collection("solicitudes")
      .replaceOne({ _id: ObjectID(id) }, solicitud);
    res.status(201).json({message: "Solicitud modificada correctamente"});
  } catch (error) {
    res.status(500).json({message: "ha ocurrido un error", error})
  }

  // const result = await db.collection("solicitudes").updateOne({_id: ObjectID(id)}, solicitud);
})

//CONFIRMAR SOLICITUD
router.post("/confirmar/:id", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;
  let obs = {};
  obs.obs = solicitud.observacion_solicitud;
  obs.fecha = getDate(new Date());
  //obtener mail del cliente principal
  const resultSol = await db.collection("solicitudes").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        fecha_confirmacion: solicitud.fecha_solicitud,
        hora_confirmacion: solicitud.hora_solicitud,
        medio_confirmacion: solicitud.medio_confirmacion,
        url_file_adjunto: {
          name: req.file.originalname,
          size: req.file.size,
          path: req.file.path,
          type: req.file.mimetype
        },
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
        valor_servicio: resp.precio,
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
        observacion: [],
        estado: "Ingresado",
      };

      const resulReserva = await db
        .collection("reservas")
        .insertOne(newReserva);
      res.json(resulReserva);
    }
  }
});

//CONFIRM MANY
router.post("/many", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let new_array = [];

  let obs = {};
  obs.obs = req.body[0].observacion_solicitud;
  obs.fecha = getDate(new Date());

  req.body[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  const result = db.collection("solicitudes").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        fecha_confirmacion: req.body[0].fecha_solicitud,
        hora_confirmacion: req.body[0].hora_solicitud,
        medio_confirmacion: req.body[0].medio_confirmacion,
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
    });
  });

  const resultReserva = await db.collection("reservas").insertMany(arrayReservas);

  res.json(resultReserva);
});

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db
    .collection("solicitudes")
    .deleteOne({ _id: ObjectID(id) });
  res.json(result);
});

export default router;

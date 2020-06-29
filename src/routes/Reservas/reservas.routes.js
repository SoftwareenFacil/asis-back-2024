import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getMinusculas } from "../../functions/changeToMiniscula";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("reservas").find({}).toArray();
  res.json(result);
});

//SELECT ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db.collection("reservas").findOne({ _id: ObjectID(id) });
  res.json(result);
});

//EDITAR RESERVA
router.put("/:id", multer.single('archivo'), async (req, res) =>{
  const { id } = req.params;
  const datos = JSON.parse(req.body.data);
  const db = await connect();
  let archivo = {}
  let obs = {};
  obs.obs = datos.observacion;
  obs.fecha = getDate(new Date());

  if(req.file){
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype
    };
  }

  const result = await db.collection("reservas").updateOne({_id: ObjectID(id)}, {
    $set:{
      fecha_reserva: datos.fecha_reserva,
      hora_reserva: datos.hora_reserva,
      fecha_reserva_fin: datos.fecha_reserva_fin,
      hora_reserva_fin: datos.hora_reserva_fin,
      jornada: datos.jornada,
      mes: datos.mes,
      anio: datos.anio,
      id_GI_personalAsignado: datos.id_GI_profesional_asignado,
      sucursal: datos.sucursal,
      url_file_adjunto: archivo
    },
    $push:{
      observacion: obs
    }
  })

  res.json(result)
})

//CONFIRMAR RESERVA
router.post("/confirmar/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const datos = JSON.parse(req.body.data);
  let archivo = {}
  const db = await connect();
  let obs = {};
  obs.obs = datos.observacion;
  obs.fecha = getDate(new Date());
  let result = null;
  let codAsis = "";

  if(req.file){
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype
    };
  }

  try {
    result = await db.collection("reservas").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha_reserva: datos.fecha_reserva,
          fecha_reserva_fin: datos.fecha_reserva_fin,
          hora_reserva: datos.hora_reserva,
          hora_reserva_fin: datos.hora_reserva_fin,
          id_GI_personalAsignado: datos.id_GI_profesional_asignado,
          sucursal: datos.sucursal,
          url_file_adjunto_confirm: archivo,
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
      });

    }

    res.json({
      status: 200,
      message: "Reserva Confirmada",
    });
  } catch (err) {

    res.json({
      status: 500,
      message: "No se pudo concretar la confirmacion de la reserva",
      error: err,
    });
  }
});

//CONFIRMACION MASIVA DE RESERVAS
router.post("/confirmar", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let datosJson = JSON.parse(req.body.data);
  let new_array = [];
  let archivo = {}
  let obs = {};
  obs.obs = datosJson[0].observacion;
  obs.fecha = getDate(new Date());

  //verificar si hay archivo o no 
  if(req.file){
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype
    }
  }

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
        id_GI_personalAsignado: datosJson[0].id_GI_profesional_asignado,
        sucursal: datosJson[0].sucursal,
        url_file_adjunto_confirm: archivo,
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
  let arrayReservas = [];

  // Se insertan las evaluaciones o las facturaciones dependiendo del caso
  resp = await db
    .collection("reservas")
    .find({ _id: { $in: new_array } })
    .toArray();

  if (getMinusculas(datosJson[0].reqEvaluacion) === "si" && result) {
    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("AGE", "EVA");
      arrayReservas.push({
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
      });
    });

    const resultEva = await db
      .collection("evaluaciones")
      .insertMany(arrayReservas);

    res.json(resultEva);
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
      const gi = GIs.find(gi => (gi._id).toString() === element.id_GI_Principal)

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
      });

    });

    const resultFac = await db
      .collection("facturaciones")
      .insertMany(arrayReservas);

    res.json(resultFac);
  }
});

export default router;

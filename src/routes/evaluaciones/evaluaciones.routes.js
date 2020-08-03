import { Router } from "express";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";
// import { calculate } from "../../functions/NewCode";
// import { getYear } from "../../functions/getYearActual";
// import { CalculateFechaVenc } from "../../functions/getFechaVenc";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("evaluaciones").find({}).toArray();
  res.json(result);
});

//SELECT ONE 
router.post('/:id', async (req, res) =>{
  const { id } = req.params;
  const db = await connect();
  
  const result = await db.collection("evaluaciones").findOne({_id: ObjectID(id)});

  res.json(result);
})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countEva = await db.collection("evaluaciones").find().count();
    const result = await db
      .collection("evaluaciones")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    res.status(501).json(error);
  }
});

//BUSCAR POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
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
  let countEva;

  try {
    if (identificador === 1) {
      countEva = await db
        .collection("evaluaciones")
        .find({ rut_cp: rexExpresionFiltro })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({ rut_cp: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countEva = await db
        .collection("evaluaciones")
        .find({ razon_social_cp: rexExpresionFiltro })
        .count();
      result = await db
        .collection("evaluaciones")
        .find({ razon_social_cp: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    res.json({
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    res.status(501).json({ mgs: `ha ocurrido un error ${error}` });
  }
});

//EDIT
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const evaluacion = JSON.parse(req.body.data);
  const db = await connect();

  if (req.file) {
    evaluacion.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  try {
    const result = await db.collection("evaluaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {},
      }
    );
    res.status(201).json({ message: "Evaluacion modificada correctamente" });
  } catch (error) {
    res.status(501).json({ message: "ha ocurrido un error", error });
  }
});

//PASAR A EN EVALUACION
router.post("/evaluar/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  let obs = {};
  let archivo = {};
  obs.obs = datos.observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  const result = await db.collection("evaluaciones").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        estado: "En Evaluacion",
        estado_archivo: "Cargado",
        archivo_examen: datos.archivo_examen,
        fecha_carga_examen: datos.fecha_carga_examen,
        hora_carga_examen: datos.hora_carga_examen,
        url_file_adjunto_EE: archivo,
      },
      $push: {
        observaciones: obs,
      },
    }
  );

  res.json(result);
});

//PASAR A EVALUADO
router.post("/evaluado/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = req.body;
  let estadoEvaluacion = "";
  let obs = {};
  obs.obs = datos.observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = datos.estado_archivo;

  if (
    datos.estado_archivo == "Aprobado" ||
    datos.estado_archivo == "Aprobado con Obs"
  ) {
    estadoEvaluacion = "Evaluado";
  } else {
    estadoEvaluacion = "Ingresado";
  }
  let result = await db.collection("evaluaciones").findOneAndUpdate(
    { _id: ObjectID(id) },
    {
      $set: {
        estado: estadoEvaluacion,
        estado_archivo: datos.estado_archivo,
        fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
        hora_confirmacion_examen: datos.hora_confirmacion_examen,
      },
      $push: {
        observaciones: obs,
      },
    },
    { sort: { codigo: 1 }, returnNewDocument: true }
  );

  if (
    result.ok == 1 &&
    (datos.estado_archivo == "Aprobado" ||
      datos.estado_archivo == "Aprobado con Obs")
  ) {
    let codAsis = result.value.codigo;
    codAsis = codAsis.replace("EVA", "RES");
    const resultinsert = await db.collection("resultados").insertOne({
      codigo: codAsis,
      nombre_servicio: result.value.nombre_servicio,
      id_GI_personalAsignado: result.value.id_GI_personalAsignado,
      faena_seleccionada_cp: result.value.faena_seleccionada_cp,
      valor_servicio: result.value.valor_servicio,
      rut_cp: result.value.rut_cp,
      razon_social_cp: result.value.razon_social_cp,
      rut_cs: result.value.rut_cs,
      razon_social_cs: result.value.razon_social_cs,
      lugar_servicio: result.value.lugar_servicio,
      sucursal: result.value.sucursal,
      condicionantes: [],
      vigencia_examen: "",
      observaciones: [],
      fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
      hora_confirmacion_examen: datos.hora_confirmacion_examen,
      estado: "En Revisión",
      estado_archivo: "Sin Documento",
      estado_resultado: "",
    });

    result = resultinsert;
  }

  res.json(result);
});

export default router;

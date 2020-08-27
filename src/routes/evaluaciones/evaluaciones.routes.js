import { Router } from "express";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";
import moment from "moment";
var fs = require("fs");
var path = require("path");
import pdfAversionRiesgo from "../../functions/createPdf/aversionRiesgo/createPdf";
// import pdfPsicosensotecnico from "../../functions/createPdf/psicosensotecnico/createpdf";
// import { generateQR } from "../../functions/createPdf/constant";
var path = require("path");
// import { getYear } from "../../functions/getYearActual";
// import { CalculateFechaVenc } from "../../functions/getFechaVenc";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { conclusion } from "../../functions/createPdf/aversionRiesgo/constant";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("evaluaciones").find({}).toArray();
  res.json(result);
});

//SELECT ONE 
router.post('/selectone/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db.collection("evaluaciones").findOne({ _id: ObjectID(id) });

  res.json(result);
})

//GENERAR PDF DE LA EVALUACION
router.post('/evaluacionmanual', async (req, res) => {
  const db = await connect();

  const data = req.body;
  const I = { razonamiento_abstracto: data.razonamiento_abstracto, percepcion_concentracion: data.percepcion_concentracion, comprension_instrucciones: data.comprension_instrucciones };

  const AN = { acato_autoridad: data.acato_autoridad, relacion_grupo_pares: data.relacion_grupo_pares, comportamiento_social: data.comportamiento_social };

  const EE = { locus_control_impulsividad: data.locus_control_impulsividad, manejo_frustracion: data.manejo_frustracion, empatia: data.empatia, grado_ansiedad: data.grado_ansiedad };

  const APR = { actitud_prevencion_accidentes: data.actitud_prevencion_accidentes, confianza_acciones_realizadas: data.confianza_acciones_realizadas, capacidad_modificar_ambiente_seguridad: data.capacidad_modificar_ambiente_seguridad };

  const MC = { orientacion_tarea: data.orientacion_tarea, energia_vital: data.energia_vital };

  const fortalezas = data.fortalezas;
  const areas_mejorar = data.area_mejora;
  const conclusionRiesgos = data.conclusion;
  const rutClienteSecundario = data.rut_cs;
  const rutClientePrincipal = data.rut_cp;
  const maquinariasConducir = data.maquinarias_conducir;
  const nombre_servicio = data.nombre_servicio;
  const nombrePdf = `RESULTADO_${data.codigo}_AVERSION_RIESGO.pdf`;

  let objFile = {};

  try {
    // generateQR(`${path.resolve("./")}/uploads/qr_sdsdsd.png`, 'sdsdsd');

    const cp = await db.collection('gi').findOne({ rut: rutClientePrincipal, categoria: 'Empresa/Organizacion' });
    const cs = await db.collection('gi').findOne({ rut: rutClienteSecundario, categoria: 'Persona Natural' });

    if (cp && cs) {
      const informacionPersonal = {
        empresa: cp.razon_social,
        nombre: cs.razon_social,
        edad: cs.edad_gi,
        rut: cs.rut,
        educacion: cs.nivel_educacional,
        cargo: cs.cargo,
        ciudad: cs.localidad,
        maquinarias_conducir: maquinariasConducir,
        fecha_evaluacion: conclusionRiesgos === 1 || conclusionRiesgos === 2 ? moment().format('DD-MM-YYYY') : '',
      };


      switch (nombre_servicio) {
        case 'Psicosensotecnico Riguroso':

          break;
        case 'Aversión al Riesgo':
          pdfAversionRiesgo(I, AN, EE, APR, MC, fortalezas, areas_mejorar, conclusionRiesgos, informacionPersonal, nombrePdf);
          break;
      }

      objFile = {
        name: nombrePdf,
        size: 0,
        path: "uploads/" + nombrePdf,
        type: "application/pdf"
      }

      const result = await db.collection('evaluaciones').updateOne({ codigo: data.codigo }, {
        $set: {
          url_file_adjunto_EE: objFile
        }
      });

      res.status(201).json({ msg: 'pdf creado', resApi: result, archivo: objFile });
    }
    else {
      res.status(400).json({ msg: 'Cliente secundario no encontrado' });
    }

  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ msg: 'error al crear el pdf', error: error })
  }
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

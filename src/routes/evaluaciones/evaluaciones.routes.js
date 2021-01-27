import { Router } from "express";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";
import moment from "moment";
import pdfAversionRiesgo from "../../functions/createPdf/aversionRiesgo/createPdf";
import pdfPsicosensotecnico from "../../functions/createPdf/psicosensotecnico/createpdf";
import { generateQR } from "../../functions/createPdf/aversionRiesgo/constant";
import { isRolEvaluaciones } from "../../functions/isRol";

import { verifyToken } from "../../libs/jwt";

import {
  MESSAGE_UNAUTHORIZED_TOKEN,
  UNAUTHOTIZED,
  ERROR_MESSAGE_TOKEN,
  AUTHORIZED, ERROR,
  SUCCESSFULL_INSERT,
  SUCCESSFULL_UPDATE,
  DELETE_SUCCESSFULL
} from "../../constant/text_messages";

var path = require("path");

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID, ObjectId } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db
    .collection("evaluaciones")
    .find({ isActive: true })
    .sort({ codigo: -1 })
    .toArray();
  res.json(result);
});

//SELECT ONE 
router.post('/selectone/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection("evaluaciones").findOne({ _id: ObjectID(id) });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: ERROR, error });
  }

});

//GENERAR PDF DE PSICOSENSOTECNICO
router.post('/evaluacionpsico', async (req, res) => {
  const db = await connect();
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const resultado = data.resultado;
  const restricciones = data.restricciones || 'Sin Restricciones';
  const vencimiento = moment().add(data.meses_vigencia, 'M').format('DD-MM-YYYY');
  const licencia = data.licencia;

  const obs = {
    obs: data.conclusion_recomendacion,
    fecha: getDate(new Date()),
    estado: "Cargado"
  };
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());
  // obs.estado = "Cargado";

  const nombrePdf = `RESULTADO_${data.codigo}_PSICOSENSOTECNICO.pdf`;
  const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_psicosensotecnico.png`;

  const rutClienteSecundario = data.rut_cs;
  const rutClientePrincipal = data.rut_cp;
  const conclusion_recomendaciones = data.conclusion_recomendacion;
  const idProfesionalAsignado = data.id_profesional_asignado;
  const e_psicotecnicos = [
    {
      resultado: data.tiempo_reaccion,
      promedio: data.promedio_tiempo_reaccion
    },
    {
      resultado: data.coordinacion_bimanual,
      promedio: data.promedio_coordinacion_bimanual
    },
    {
      resultado: data.precision_coordinacion_visomotriz,
      promedio: data.promedio_precision_coordinacion_vis
    }
  ];
  const evaluaciones = [
    {
      active: true,
      resultado: data.examen_sensometrico,
      obs: data.obs_examen_sensometrico
    },
    {
      active: true,
      resultado: data.examen_psicotecnico,
      obs: data.obs_examen_psicotecnico
    },
    {
      active: true,
      resultado: data.evaluacion_somnolencia,
      obs: data.obs_evaluacion_somnolencia
    },
    {
      active: true,
      resultado: data.evaluacion_psicologica,
      obs: data.obs_evaluacion_psicologica
    },
    {
      active: data.is_anticipacion,
      resultado: data.test_velocidad_anticipacion,
      obs: data.obs_test_velocidad_anticipacion
    },
    {
      active: data.is_monotonia,
      resultado: data.test_tolerancia_monotonia,
      obs: data.obs_test_tolerancia_monotonia
    },
    {
      active: data.is_reacciones_multiples,
      resultado: data.test_reacciones_multiples,
      obs: data.obs_test_reacciones_multiples
    },
    {
      active: data.is_ley_transito,
      resultado: data.evaluacion_transito_nacional,
      obs: data.obs_evaluacion_transito_nacional
    }
  ];
  const e_sensometricos = [
    {
      resultado: data.monocular_derecha
    },
    {
      resultado: data.monocular_izquierda
    },
    {
      resultado: data.vision_binocular
    },
    {
      resultado: data.perimetria
    },
    {
      resultado: data.profundidad
    },
    {
      resultado: data.discriminacion_colores
    },
    {
      resultado: data.vision_nocturna
    },
    {
      resultado: data.phoria_vertical
    },
    {
      resultado: data.phoria_horizontal
    },
    {
      resultado: data.recuperacion_encandilamiento
    },
    {
      resultado: data.audiometria
    }
  ];

  const test_espe_vel_anticipacion = {
    active: data.is_anticipacion,
    resultado: data.test_velocidad_anticipacion
  };

  const examen_somnolencia = {
    active: data.is_somnolencia,
    probabilidad: data.probabilidad_somnolencia,
    punto: data.punto,
    epworth: data.test_epworth
  };

  const test_psicologico = {
    active: data.is_psicologico,
    obs: data.observacion_psicologica
  };

  const test_espe_tol_monotonia = {
    active: data.is_monotonia,
    resultado: data.test_tolerancia_monotonia,
    aciertos: data.test_aciertos_tolerancia,
    obs: data.obs_test_tolerancia_monotonia
  };

  const test_espe_reac_multiples = {
    active: data.is_reacciones_multiples,
    resultado: data.test_reacciones_multiples
  };

  const test_conocimiento_ley_nacional = {
    active: data.is_ley_transito,
    resultado: data.test_estado_ley_transito,
    porce_conocimientos_legales: data.porcentaje_legales,
    porce_conocimientos_reglamentarios: data.porcentaje_reglamentarios,
    porce_conocimientos_mecanica: data.porcentaje_mecanica,
    porce_conocimientos_senales_viales: data.porcentaje_señales_viales,
    porce_conducta_vial: data.porcentaje_conducta_vial
  }

  generateQR(
    nombreQR,
    `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${data.codigo} Vencimiento: ${vencimiento} Resultado: ${resultado}`);


  try {
    let objFile = {};

    const cp = await db.collection('gi').findOne({ rut: rutClientePrincipal, categoria: 'Empresa/Organizacion' });
    const cs = await db.collection('gi').findOne({ rut: rutClienteSecundario, categoria: 'Persona Natural' });
    const pa = await db.collection('gi').findOne({ _id: ObjectId(idProfesionalAsignado) });

    if (cp && cs) {
      const informacionPersonal = {
        evaluador: pa.razon_social || '',
        empresa: cp.razon_social || '',
        rut_evaluador: pa.rut || '',
        cargo_evaluador: pa.cargo || '',
        nombre: cs.razon_social || '',
        rut: cs.rut || '',
        fecha_nacimiento: cs.fecha_inic_nac || '',
        cargo: cs.cargo || '',
        licencia_acreditar: licencia || '',
        ley: cs.ley_aplicable || '',
        vencimiento_licencia: cs.fecha_venc_licencia || '',
        observaciones_licencia: cs.estado_licencia || '',
        fecha_examen: moment().format('DD-MM-YYYY') || '',
        resultado: resultado || '',
        restricciones: restricciones || '',
        vencimiento: vencimiento || ''
      };

      // console.log(informacionPersonal);

      pdfPsicosensotecnico(informacionPersonal, evaluaciones, conclusion_recomendaciones, e_sensometricos, e_psicotecnicos, test_espe_vel_anticipacion, examen_somnolencia,
        test_psicologico, test_espe_tol_monotonia, test_espe_reac_multiples,
        test_conocimiento_ley_nacional, nombrePdf, nombreQR);

      objFile = {
        name: nombrePdf,
        size: 0,
        path: "uploads/" + nombrePdf,
        type: "application/pdf",
        option: "online"
      };

      // await db.collection('evaluaciones').updateOne({ codigo: data.codigo }, {
      //   $set: {
      //     url_file_adjunto_EE: objFile
      //   }
      // });

      const result = await db.collection("evaluaciones").updateOne(
        { codigo: data.codigo, isActive: true },
        {
          $set: {
            estado: "En Evaluacion",
            estado_archivo: "Cargado",
            archivo_examen: null,
            fecha_carga_examen: moment().format('DD-MM-YYYY'),
            hora_carga_examen: moment().format('HH:mm'),
            meses_vigencia: data.meses_vigencia,
            url_file_adjunto_EE: objFile,
          },
          $push: {
            observaciones: obs,
          },
        }
      );

      res.status(201).json({ msg: 'pdf creado', resApi: result, archivo: objFile });
    }
    else {
      res.json({ msg: 'Cliente secundario no encontrado' });
    }

  } catch (error) {
    console.log(error)
    res.json({ msg: 'error al crear el pdf', error: error });

  }
});

//GENERAR PDF DE AVERSION AL RIESGO
router.post('/evaluacionaversion', async (req, res) => {
  const db = await connect();
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const I = { 
    razonamiento_abstracto: data.razonamiento_abstracto, 
    percepcion_concentracion: data.percepcion_concentracion, 
    comprension_instrucciones: data.comprension_instrucciones 
  };

  const AN = { 
    acato_autoridad: data.acato_autoridad, 
    relacion_grupo_pares: data.relacion_grupo_pares, 
    comportamiento_social: data.comportamiento_social 
  };

  const EE = { 
    locus_control_impulsividad: data.locus_control_impulsividad, 
    manejo_frustracion: data.manejo_frustracion, 
    empatia: data.empatia, 
    grado_ansiedad: data.grado_ansiedad 
  };

  const APR = { 
    actitud_prevencion_accidentes: data.actitud_prevencion_accidentes, 
    confianza_acciones_realizadas: data.confianza_acciones_realizadas, 
    capacidad_modificar_ambiente_seguridad: data.capacidad_modificar_ambiente_seguridad 
  };

  const MC = {
    orientacion_tarea: data.orientacion_tarea, 
    energia_vital: data.energia_vital 
  };

  //-------
  const TOTAL_I = [
    data.total_razonamiento_abstracto, 
    data.total_percepcion_concentracion, 
    data.total_comprension_instrucciones 
  ];
  const TOTAL_AN = [
    data.total_acato_autoridad, 
    data.total_relacion_grupo_pares, 
    data.total_comportamiento_social
  ];
  const TOTAL_EE = [
    data.total_locus_control_impulsividad, 
    data.total_manejo_frustracion, 
    data.total_empatia, 
    data.total_grado_ansiedad
  ];
  const TOTAL_APR = [
    data.total_actitud_prevencion_accidentes, 
    data.total_confianza_acciones_realizadas, 
    data.total_capacidad_modificar_ambiente_seguridad
  ];
  const TOTAL_MC = [
    data.total_orientacion_tarea, 
    data.total_energia_vital
  ];

  const obs = {
    obs: data.observaciones_conclusion,
    fecha: getDate(new Date()),
    estado: "Cargado"
  };

  // const fortalezas = data.fortalezas;
  // const areas_mejorar = data.area_mejora;
  const conclusionRiesgos = data.conclusion;
  const rutClienteSecundario = data.rut_cs;
  const rutClientePrincipal = data.rut_cp;
  const maquinariasConducir = data.maquinaria;
  const observacionConclusion = data.observaciones_conclusion;
  // const nombre_servicio = data.nombre_servicio;
  const nombrePdf = `RESULTADO_${data.codigo}_AVERSION_RIESGO.pdf`;
  const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_aversionriesgo.png`;
  const fecha_vigencia = moment().add(data.meses_vigencia, 'M').format('DD-MM-YYYY');

  let resultado = '';
  if (conclusionRiesgos === 1) { resultado = 'No presenta conductas de riesgos' } else if (conclusionRiesgos === 2) { resultado = 'Presenta bajas conductas de riesgos' } else { resultado = 'Presenta altas conductas de riesgos' };

  generateQR(nombreQR,
    `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${data.codigo} Fecha vigencia: ${fecha_vigencia} Resultado: ${resultado}`
  );

  let objFile = {};

  const cp = await db.collection('gi').findOne({ rut: rutClientePrincipal, categoria: 'Empresa/Organizacion' });
  const cs = await db.collection('gi').findOne({ rut: rutClienteSecundario, categoria: 'Persona Natural' });
  const pa = await db.collection('gi').findOne({ _id: ObjectId(data.id_profesional_asignado) });


  if (cp && cs && pa) {
    const informacionPersonal = {
      empresa: cp.razon_social,
      evaluador: pa.razon_social,
      rut_evaluador: pa.rut,
      cargo_evaluador: pa.cargo || '',
      nombre: cs.razon_social,
      edad: cs.edad_gi,
      rut: cs.rut,
      educacion: cs.nivel_educacional,
      cargo: cs.cargo,
      ciudad: cs.localidad,
      maquinarias_conducir: maquinariasConducir,
      fecha_evaluacion: conclusionRiesgos === 1 || conclusionRiesgos === 2 ? moment().format('DD-MM-YYYY') : '',
    };

    try {

      objFile = {
        name: nombrePdf,
        size: 0,
        path: "uploads/" + nombrePdf,
        type: "application/pdf",
        option: "online"
      }

      const result = await db.collection("evaluaciones").updateOne(
        { codigo: data.codigo, isActive: true },
        {
          $set: {
            estado: "En Evaluacion",
            estado_archivo: "Cargado",
            archivo_examen: null,
            fecha_carga_examen: moment().format('DD-MM-YYYY'),
            hora_carga_examen: moment().format('HH:mm'),
            meses_vigencia: data.meses_vigencia,
            url_file_adjunto_EE: objFile,
          },
          $push: {
            observaciones: obs,
          },
        }
      );

      // console.log(data)

      pdfAversionRiesgo(
        I, 
        AN, 
        EE, 
        APR, 
        MC, 
        conclusionRiesgos, 
        informacionPersonal, 
        nombrePdf, 
        nombreQR, 
        fecha_vigencia, 
        observacionConclusion,
        TOTAL_I,
        TOTAL_AN,
        TOTAL_EE,
        TOTAL_APR,
        TOTAL_MC
      );

      res.status(200).json({ msg: 'pdf creado', resApi: result, archivo: objFile });
    } catch (error) {
      console.log(error)
      res.json({ msg: 'error al crear el pdf', error: error })
    }
  }
  else {
    res.json({ msg: 'Cliente secundario no encontrado' });
  }
})

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

    const mergedEvaluaciones = await db.collection('evaluaciones').aggregate([
      {
        $lookup:
        {
          from: "gi",
          localField: "id_GI_personalAsignado",
          foreignField: "ObjectId(_id)",
          as: "evaluador"
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$evaluador", 0] }, "$$ROOT"] } }
      },
      {
        $project: {
          id_GI_personalAsignado: 1,
          valor_servicio: 1,
          faena_seleccionada_cp: 1,
          fecha_evaluacion: 1,
          fecha_evaluacion_fin: 1,
          hora_inicio_evaluacion: 1,
          hora_termino_evaluacion: 1,
          mes: 1,
          anio: 1,
          nombre_servicio: 1,
          rut_cp: 1,
          razon_social_cp: 1,
          rut_cs: 1,
          razon_social_cs: 1,
          lugar_servicio: 1,
          sucursal: 1,
          observaciones: 1,
          estado_archivo: 1,
          estado: 1,
          razon_social: 1,
        }
      },
      {
        $match: { ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }
      },
    ]
    ).toArray();

    console.log('agregate', mergedEvaluaciones);

    const countEva = await db.collection("evaluaciones").find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }).count();
    const result = await db
      .collection("evaluaciones")
      .find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true })
      .skip(skip_page)
      .limit(nPerPage)
      .sort({ codigo: -1 })
      .toArray();

    return res.json({
      auth: AUTHORIZED,
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: ERROR, error });
  }
});

//BUSCAR POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }
  // else {
  //   rutFiltrado = filtro;
  // }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countEva;

  try {

    if (dataToken.rol === 'Clientes') {
      countEva = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else if (dataToken.rol === 'Colaboradores') {
      countEva = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else {
      countEva = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    // if (dataToken.rol === 'Clientes') {
    //   if (identificador === 1) {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut })
    //       .count();

    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ rut_cp: rexExpresionFiltro, rut_cp: dataToken.rut })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut })
    //       .count();
    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, rut_cp: dataToken.rut })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }
    // else if (dataToken.rol === 'Colaboradores') {
    //   if (identificador === 1) {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ rut_cp: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
    //       .count();

    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ id_cp: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
    //       .count();
    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }
    // else {
    //   if (identificador === 1) {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ rut_cp: rexExpresionFiltro })
    //       .count();

    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ rut_cp: rexExpresionFiltro })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countEva = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro })
    //       .count();
    //     result = await db
    //       .collection("evaluaciones")
    //       .find({ razon_social_cp: rexExpresionFiltro })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }

    res.status(200).json({
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    res.status(500).json({ mgs: ERROR, error });
  }
});

//EDITAR EVALUACION -----------> PENDIENTE
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const evaluacion = JSON.parse(req.body.data);
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  if (req.file) {
    evaluacion.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  try {
    await db.collection("evaluaciones").updateOne(
      { _id: ObjectID(id), isActive: true },
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
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let archivo = {};
  let obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: "Cargado"
  };
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());
  // obs.estado = "Cargado";

  if (req.file) archivo = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
    option: "file"
  };

  try {
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

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: ERROR, error })
  }
});

//PASAR A EVALUADO
router.post("/evaluado/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = req.body;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let estadoEvaluacion = "";
  let obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: datos.estado_archivo
  };

  try {

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
      const isOnline = result.value.url_file_adjunto_EE.option = "online" ? true : false;
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
        vigencia_examen: result.value.meses_vigencia || null,
        observaciones: [],
        fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
        hora_confirmacion_examen: datos.hora_confirmacion_examen,
        estado: "En Revisión",
        url_file_adjunto_res: result.value.url_file_adjunto_EE,
        estado_archivo: isOnline ? "Cargado" : "Sin Documento",
        estado_resultado: '',
        isActive: true
      });

      result = resultinsert;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: ERROR, error });
  }


});

//DELETE / ANULAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  try {
    const existEvaluacion = await db.collection('evaluaciones').findOne({ _id: ObjectID(id) });
    if (!existEvaluacion) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'evaluacion no existe' });

    const codeReserva = existEvaluacion.codigo.replace('EVA', 'AGE');
    const existReserva = await db.collection('reservas').findOne({ codigo: codeReserva });
    if (!existReserva) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'reserva no existe' });

    const codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
    const existSolicitud = await db.collection('solicitudes').findOne({ codigo: codeSolicitud });
    if (!existSolicitud) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'solicitud no existe no existe' });

    await db.collection('evaluaciones').updateOne({ _id: ObjectID(id) }, {
      $set: {
        isActive: false
      }
    });
    await db.collection('reservas').updateOne({ codigo: codeReserva }, {
      $set: {
        isActive: false
      }
    });
    await db.collection('solicitudes').updateOne({ codigo: codeSolicitud }, {
      $set: {
        isActive: false
      }
    });
    return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'ok' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: ERROR, err: String(error), status: 'error' });
  }
});

// ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("evaluaciones")
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

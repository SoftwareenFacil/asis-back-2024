import { Router } from "express";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";
import moment from "moment";
import pdfAversionRiesgo from "../../functions/createPdf/aversionRiesgo/createPdf";
import pdfPsicosensotecnico from "../../functions/createPdf/psicosensotecnico/createpdf";
import { generateQR } from "../../functions/createPdf/aversionRiesgo/constant";
import { isRolEvaluaciones } from "../../functions/isRol";

import { verifyToken } from "../../libs/jwt";
import { v4 as uuid } from "uuid";

import {
  MESSAGE_UNAUTHORIZED_TOKEN,
  UNAUTHOTIZED,
  ERROR_MESSAGE_TOKEN,
  AUTHORIZED,
  ERROR,
  SUCCESSFULL_INSERT,
  SUCCESSFULL_UPDATE,
  DELETE_SUCCESSFULL,
} from "../../constant/text_messages";

var path = require("path");
var AWS = require("aws-sdk");
var fs = require("fs");

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID, ObjectId } from "mongodb";
import { upperRutWithLetter } from "../../functions/uppercaseRutWithLetter";
import {
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  NOT_EXISTS,
  NAME_PSICO_PDF,
  NAME_AVERSION_PDF,
  ERROR_PDF,
  OTHER_NAME_PDF,
  FORMAT_DATE,
  CURRENT_ROL,
  COLABORATION_ROL,
} from "../../constant/var";
import { uploadFileToS3, getObjectFromS3 } from "../../libs/aws";
import { pipe } from "pdfkit";
import { TransformToCapitalize } from "../../functions/transformToCapitalize";

//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db("asis-db");
  const result = await db
    .collection("evaluaciones")
    .find({ isActive: true })
    .sort({ codigo: -1 })
    .toArray();
  conn.close();
  res.json(result);
});

//SELECT ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db("asis-db");
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db
      .collection("evaluaciones")
      .findOne({ _id: ObjectID(id) });
    console.log(result);
    if (!result) {
      return res.status(400).json({ err: 98, msg: NOT_EXISTS, res: null });
    }
    return res.status(200).json({ err: null, msg: "", res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close();
  }
});

//GENERAR PDF DE PSICOSENSOTECNICO
router.post("/evaluacionpsico", async (req, res) => {
  const conn = await connect();
  const db = conn.db("asis-db");
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const resultado = data.resultado;
  const restricciones = data.restricciones || "Sin Restricciones";
  const vencimiento = moment()
    .add(data.meses_vigencia, "M")
    .format("DD-MM-YYYY");
  const licencia = data.licencia_a_acreditar ?? [];

  console.log("LICENCIA", licencia);

  const obs = {
    obs: data.conclusion_recomendacion,
    fecha: getDate(new Date()),
    estado: "Cargado",
  };

  const nombrePdf = OTHER_NAME_PDF;
  const nombreQR = `${path.resolve("./")}/uploads/qr_${
    data.codigo
  }_psicosensotecnico.png`;

  const csFinded = await db
    .collection("gi")
    .findOne({ rut: data.rut_cs, categoria: "Persona Natural" });
  const cpFinded = await db
    .collection("gi")
    .findOne({ rut: data.rut_cp, categoria: "Empresa/Organizacion" });
  const serviceFinded = await db
    .collection("solicitudes")
    .findOne({ codigo: data.codigo.replace("EVA", "SOL") });

  const firstPartFileName = !!csFinded.razon_social
    ? csFinded.razon_social
    : "SinDatos";
  const secondPartFileName = data.rut_cs;
  const thirdPartFileName = !!serviceFinded.nombre_servicio
    ? serviceFinded.nombre_servicio
    : "SinDatos";
  const fourthPartFileName = data.codigo.split("-")[3];
  const fifthPartFileName = uuid();
  const sixPartFileName = !!cpFinded.nombre_fantasia
    ? cpFinded.nombre_fantasia
    : "SinDatos";

  const nameFIle = `${firstPartFileName}_${secondPartFileName}_${thirdPartFileName}_${fourthPartFileName}_${sixPartFileName}_${fifthPartFileName}.pdf`;

  const rutClienteSecundario = data.rut_cs;
  const rutClientePrincipal = data.rut_cp;
  const conclusion_recomendaciones = data.conclusion_recomendacion;
  const idProfesionalAsignado = data.id_GI_personalAsignado;
  const e_psicotecnicos = [
    {
      resultado: data.tiempo_reaccion,
      promedio: data.promedio_tiempo_reaccion,
    },
    {
      resultado: data.coordinacion_bimanual,
      promedio: data.promedio_coordinacion_bimanual,
    },
    {
      resultado: data.precision_coordinacion_visomotriz,
      promedio: data.promedio_precision_coordinacion_vis,
    },
  ];
  const e_sensometricos = [
    {
      resultado: data.monocular_derecha,
    },
    {
      resultado: data.monocular_izquierda,
    },
    {
      resultado: data.vision_binocular,
    },
    {
      resultado: data.perimetria,
    },
    {
      resultado: data.profundidad,
    },
    {
      resultado: data.discriminacion_colores,
    },
    {
      resultado: data.vision_nocturna,
    },
    {
      resultado: data.phoria_vertical,
    },
    {
      resultado: data.phoria_horizontal,
    },
    {
      resultado: data.recuperacion_encandilamiento,
    },
    {
      resultado: data.audiometria,
    },
  ];

  const evaluaciones = [
    {
      active: true,
      resultado: data.examen_sensometrico,
      obs: data.obs_examen_sensometrico,
    },
    {
      active: true,
      resultado: data.examen_psicotecnico,
      obs: data.obs_examen_psicotecnico,
    },
    {
      active: data.is_somnolencia,
      resultado: data.evaluacion_somnolencia,
      obs: data.obs_evaluacion_somnolencia,
    },
    {
      active: data.is_psicologico,
      resultado: data.evaluacion_psicologica,
      obs: data.obs_evaluacion_psicologica,
    },
    {
      active: data.is_anticipacion,
      resultado: data.test_velocidad_anticipacion,
      obs: data.obs_test_velocidad_anticipacion,
    },
    {
      active: data.is_monotonia,
      resultado: data.test_tolerancia_monotonia,
      obs: data.obs_test_tolerancia_monotonia,
    },
    {
      active: data.is_reacciones_multiples,
      resultado: data.test_reacciones_multiples,
      obs: data.obs_test_reacciones_multiples,
    },
    {
      active: data.is_ley_transito,
      resultado: data.evaluacion_transito_nacional,
      obs: data.obs_evaluacion_transito_nacional,
    },
  ];

  const test_espe_vel_anticipacion = {
    active: data.is_anticipacion,
    resultado: data.test_velocidad_anticipacion,
  };

  const examen_somnolencia = {
    active: data.is_somnolencia,
    probabilidad: data.probabilidad_somnolencia,
    punto: data.punto,
    epworth: data.test_epworth,
  };

  const test_psicologico = {
    active: data.is_psicologico,
    obs: data.observacion_psicologica,
  };

  const test_espe_tol_monotonia = {
    active: data.is_monotonia,
    resultado: data.test_tolerancia_monotonia,
    aciertos: data.test_aciertos_tolerancia,
    errores: data.test_errores_tolerancia,
    promedio_reaccion_monotonia: data.promedio_reaccion_monotonia,
    obs: data.obs_test_tolerancia_monotonia,
  };

  const test_espe_reac_multiples = {
    active: data.is_reacciones_multiples,
    resultado: data.test_reacciones_multiples,
  };

  const test_conocimiento_ley_nacional = {
    active: data.is_ley_transito,
    resultado: data.test_estado_ley_transito,
    porce_conocimientos_legales: data.porcentaje_legales,
    porce_conocimientos_reglamentarios: data.porcentaje_reglamentarios,
    porce_conocimientos_mecanica: data.porcentaje_mecanica,
    porce_conocimientos_senales_viales: data.porcentaje_señales_viales,
    porce_conducta_vial: data.porcentaje_conducta_vial,
  };

  generateQR(
    nombreQR,
    `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${
      data.codigo
    } Fecha de Evaluación: test Vencimiento: test2 Resultado: ${resultado}`
  );

  // generateQR(
  //   nombreQR,
  //   `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${
  //     data.codigo
  //   } Fecha de Evaluación: ${
  //     !!eva && !!eva.fecha_evaluacion
  //       ? moment(eva.fecha_evaluacion, FORMAT_DATE).format(FORMAT_DATE)
  //       : ""
  //   } Vencimiento: ${
  //     !!eva && !!eva.fecha_evaluacion
  //       ? moment(eva.fecha_evaluacion, FORMAT_DATE)
  //           .add(data.meses_vigencia, "M")
  //           .format(FORMAT_DATE)
  //       : ""
  //   } Resultado: ${resultado}`
  // );

  try {
    let objFile = {};

    const cp = await db.collection("gi").findOne({
      rut: upperRutWithLetter(rutClientePrincipal),
      categoria: "Empresa/Organizacion",
      activo_inactivo: true,
    });
    const cs = await db.collection("gi").findOne({
      rut: upperRutWithLetter(rutClienteSecundario),
      categoria: "Persona Natural",
      activo_inactivo: true,
    });
    const pa = await db
      .collection("gi")
      .findOne({ _id: ObjectId(idProfesionalAsignado), activo_inactivo: true });
    const eva = await db
      .collection("evaluaciones")
      .findOne({ codigo: data.codigo });

    // console.log("cs------", cs);

    console.log('mensaje qr-----', `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${
      data.codigo
    } Fecha de Evaluación: ${
      !!eva && !!eva.fecha_evaluacion
        ? moment(eva.fecha_evaluacion, FORMAT_DATE).format(FORMAT_DATE)
        : ""
    } Vencimiento: ${
      !!eva && !!eva.fecha_evaluacion
        ? moment(eva.fecha_evaluacion, FORMAT_DATE)
            .add(data.meses_vigencia, "M")
            .format(FORMAT_DATE)
        : ""
    } Resultado: ${resultado}`)

    if (cp && cs) {
      const informacionPersonal = {
        evaluador: pa.razon_social || "",
        empresa: cp.razon_social || "",
        rut_evaluador: pa.rut || "",
        cargo_evaluador: pa.cargo || "",
        nombre: cs.razon_social || "",
        rut: cs.rut || "",
        fecha_nacimiento: cs.fecha_inic_mac
          ? moment(cs.fecha_inic_mac, FORMAT_DATE).format(FORMAT_DATE)
          : "",
        cargo: cs.cargo || "",
        licencia_acreditar: licencia || "",
        ley: cs.ley_aplicable || "",
        vencimiento_licencia:
          cs.fecha_venc_licencia &&
          !!licencia &&
          !licencia.some((item) => item === "No tiene")
            ? moment(cs.fecha_venc_licencia, FORMAT_DATE).format(FORMAT_DATE)
            : "No Aplica",
        observaciones_licencia:
          cs.estado_licencia &&
          !!licencia &&
          !licencia.some((item) => item === "No tiene")
            ? cs.estado_licencia
            : "No Aplica",
        fecha_examen:
          !!eva && !!eva.fecha_evaluacion
            ? moment(eva.fecha_evaluacion, FORMAT_DATE).format(FORMAT_DATE)
            : "",
        // fecha_examen: moment().format(FORMAT_DATE),
        resultado: resultado || "",
        restricciones: restricciones || "",
        vencimiento:
          !!eva && !!eva.fecha_evaluacion
            ? moment(eva.fecha_evaluacion, FORMAT_DATE)
                .add(data.meses_vigencia, "M")
                .format(FORMAT_DATE)
            : "",
        codigo: data.codigo || "",
        nameFile: nameFIle,
      };

      // console.log("informacion personal--------", informacionPersonal);

      const signPerson = await db
        .collection("gi")
        .findOne({ rut: "12398638-5", categoria: "Persona Natural" });

      console.log("examenes", [examen_somnolencia, test_psicologico]);

      pdfPsicosensotecnico(
        informacionPersonal,
        evaluaciones,
        conclusion_recomendaciones,
        e_sensometricos,
        e_psicotecnicos,
        test_espe_vel_anticipacion,
        examen_somnolencia,
        test_psicologico,
        test_espe_tol_monotonia,
        test_espe_reac_multiples,
        test_conocimiento_ley_nacional,
        nombrePdf,
        nombreQR,
        signPerson || null
      );

      // objFile = {
      //   name: `psico_${data.codigo}`,
      //   size: 0,
      //   path: nameFIle,
      //   type: "application/pdf",
      //   option: "online"
      // };

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: nameFIle,
          ContentType: "application/pdf",
        };

        uploadFileToS3(params);
      }, 2000);

      const result = await db.collection("evaluaciones").updateOne(
        { codigo: data.codigo, isActive: true },
        {
          $set: {
            estado: "En Evaluacion",
            estado_archivo: "Cargado",
            archivo_examen: null,
            fecha_carga_examen: moment().format("DD-MM-YYYY"),
            hora_carga_examen: moment().format("HH:mm"),
            meses_vigencia: data.meses_vigencia,
            url_file_adjunto_EE: nameFIle,
          },
          $push: {
            observaciones: obs,
          },
        }
      );

      return res.status(201).json({
        err: null,
        msg: "Examen creado satisfactoriamente",
        res: result,
      });
    } else {
      return res.json({ err: 98, msg: NOT_EXISTS, res: null });
    }
  } catch (error) {
    console.log("error ruta evaluaciones-----", error);
    return res.json({
      err: String(error),
      msg: "Error al crear el examen",
      res: null,
    });
  } finally {
    conn.close();
  }
});

//GENERAR PDF DE AVERSION AL RIESGO
router.post("/evaluacionaversion", async (req, res) => {
  const conn = await connect();
  const db = conn.db("asis-db");
  const data = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const I = {
    razonamiento_abstracto: data.razonamiento_abstracto,
    percepcion_concentracion: data.percepcion_concentracion,
    comprension_instrucciones: data.comprension_instrucciones,
  };

  const AN = {
    acato_autoridad: data.acato_autoridad,
    relacion_grupo_pares: data.relacion_grupo_pares,
    comportamiento_social: data.comportamiento_social,
  };

  const EE = {
    locus_control_impulsividad: data.locus_control_impulsividad,
    manejo_frustracion: data.manejo_frustracion,
    empatia: data.empatia,
    grado_ansiedad: data.grado_ansiedad,
  };

  const APR = {
    actitud_prevencion_accidentes: data.actitud_prevencion_accidentes,
    confianza_acciones_realizadas: data.confianza_acciones_realizadas,
    capacidad_modificar_ambiente_seguridad:
      data.capacidad_modificar_ambiente_seguridad,
  };

  const MC = {
    orientacion_tarea: data.orientacion_tarea,
    energia_vital: data.energia_vital,
  };

  //-------
  const TOTAL_I = [
    data.total_razonamiento_abstracto || 0,
    data.total_percepcion_concentracion || 0,
    data.total_comprension_instrucciones || 0,
  ];
  const TOTAL_AN = [
    data.total_acato_autoridad || 0,
    data.total_relacion_grupo_pares || 0,
    data.total_comportamiento_social || 0,
  ];
  const TOTAL_EE = [
    data.total_locus_control_impulsividad || 0,
    data.total_manejo_frustracion || 0,
    data.total_empatia || 0,
    data.total_grado_ansiedad || 0,
  ];
  const TOTAL_APR = [
    data.total_actitud_prevencion_accidentes || 0,
    data.total_confianza_acciones_realizadas || 0,
    data.total_capacidad_modificar_ambiente_seguridad || 0,
  ];
  const TOTAL_MC = [
    data.total_orientacion_tarea || 0,
    data.total_energia_vital || 0,
  ];

  const obs = {
    obs: data.observaciones_conclusion,
    fecha: getDate(new Date()),
    estado: "Cargado",
  };

  const conclusionRiesgos = data.conclusion;
  const rutClienteSecundario = data.rut_cs;
  const rutClientePrincipal = data.rut_cp;
  const maquinariasConducir = data.maquinaria;
  const observacionConclusion = data.observaciones_conclusion;

  const nombrePdf = OTHER_NAME_PDF;
  const nombreQR = `${path.resolve("./")}/uploads/qr_${
    data.codigo
  }_aversionriesgo.png`;

  const csFinded = await db
    .collection("gi")
    .findOne({ rut: data.rut_cs, categoria: "Persona Natural" });
  const cpFinded = await db
    .collection("gi")
    .findOne({ rut: data.rut_cp, categoria: "Empresa/Organizacion" });
  const serviceFinded = await db
    .collection("solicitudes")
    .findOne({ codigo: data.codigo.replace("EVA", "SOL") });

  const firstPartFileName = !!csFinded.razon_social
    ? csFinded.razon_social
    : "SinDatos";
  const secondPartFileName = data.rut_cs;
  const thirdPartFileName = !!serviceFinded.nombre_servicio
    ? serviceFinded.nombre_servicio
    : "SinDatos";
  const fourthPartFileName = data.codigo.split("-")[3];
  const fifthPartFileName = uuid();
  const sixPartFileName = !!cpFinded.nombre_fantasia
    ? cpFinded.nombre_fantasia
    : "SinDatos";

  const nameFIle = `${firstPartFileName}_${secondPartFileName}_${thirdPartFileName}_${fourthPartFileName}_${sixPartFileName}_${fifthPartFileName}.pdf`;

  // const nameFIle = `${data.razon_social_cs.trim()}_${data.rut_cs}_${data.nombre_servicio.trim()}_${data.codigo.split('_')[3]}`;
  const fecha_vigencia =
    moment(data.fecha_evaluacion, FORMAT_DATE)
      .add(data.meses_vigencia, "M")
      .format(FORMAT_DATE) || "Sin Información";

  let resultado = "";
  if (conclusionRiesgos === 1) {
    resultado = "No presenta conductas de riesgos";
  } else if (conclusionRiesgos === 2) {
    resultado = "Presenta bajas conductas de riesgos";
  } else {
    resultado = "Presenta altas conductas de riesgos";
  }

  generateQR(
    nombreQR,
    `Empresa: ${rutClientePrincipal} Evaluado: ${rutClienteSecundario} Cod ASIS: ${data.codigo} Fecha vigencia: ${fecha_vigencia} Resultado: ${resultado}`
  );

  const cp = await db.collection("gi").findOne({
    rut: rutClientePrincipal,
    categoria: "Empresa/Organizacion",
    activo_inactivo: true,
  });
  const cs = await db.collection("gi").findOne({
    rut: rutClienteSecundario,
    categoria: "Persona Natural",
    activo_inactivo: true,
  });
  const pa = await db.collection("gi").findOne({
    _id: ObjectId(data.id_GI_personalAsignado),
    activo_inactivo: true,
  });

  if (cp && cs && pa) {
    const informacionPersonal = {
      empresa: cp.razon_social,
      evaluador: pa.razon_social,
      rut_evaluador: pa.rut,
      cargo_evaluador: pa.cargo || "",
      nombre: cs.razon_social,
      edad: cs.edad_gi,
      rut: cs.rut,
      educacion: cs.nivel_educacional,
      cargo: cs.cargo,
      ciudad: cs.localidad,
      maquinarias_conducir: maquinariasConducir,
      fecha_evaluacion: data.fecha_evaluacion || moment().format("DD-MM-YYYY"),
    };

    try {
      // objFile = {
      //   name: nombrePdf,
      //   size: 0,
      //   path: "uploads/" + nombrePdf,
      //   type: "application/pdf",
      //   option: "online"
      // }

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

      // objFile = {
      //   name: `aversion_${data.codigo}`,
      //   size: 0,
      //   path: nameFIle,
      //   type: "application/pdf",
      //   option: "online"
      // };

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: nameFIle,
          ContentType: "application/pdf",
        };

        uploadFileToS3(params);
      }, 2000);

      console.log("sdsdssdsdsds", data);

      const result = await db.collection("evaluaciones").updateOne(
        { codigo: data.codigo, isActive: true },
        {
          $set: {
            estado: "En Evaluacion",
            estado_archivo: "Cargado",
            archivo_examen: null,
            fecha_carga_examen: moment().format("DD-MM-YYYY"),
            hora_carga_examen: moment().format("HH:mm"),
            meses_vigencia: data.meses_vigencia,
            url_file_adjunto_EE: nameFIle,
          },
          $push: {
            observaciones: obs,
          },
        }
      );

      return res
        .status(200)
        .json({ err: null, msg: "Examen creado exitosamente", res: result });
    } catch (error) {
      console.log(error);
      return res.json({ err: 97, msg: ERROR_PDF, res: null });
    } finally {
      conn.close();
    }
  } else {
    conn.close();
    return res.json({
      err: 98,
      msg: "Cliente secundario no encontrado",
      res: null,
    });
  }
});

//GET FILE FROM AWS S3
router.get("/downloadfile/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db("asis-db");

  try {
    const evaluacion = await db
      .collection("evaluaciones")
      .findOne({ _id: ObjectID(id), isActive: true });
    // const { path: pathPdf, name } = evaluacion.url_file_adjunto_EE;
    const pathPdf = evaluacion.url_file_adjunto_EE;

    console.log(pathPdf);

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.json({
          err: String(error),
          msg: "error s3 get file",
          res: null,
        });
      } else {
        return res.status(200).json({
          err: null,
          msg: "Archivo descargado",
          res: data.Body,
          filename: pathPdf,
        });
      }
    });
  } catch (error) {
    return res.json({
      err: String(error),
      msg: "Error al obtener archivo",
      res: null,
    });
  } finally {
    conn.close();
  }
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db("asis-db");
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers["x-access-token"];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const mergedEvaluaciones = await db.collection('evaluaciones').aggregate([
    //   {
    //     $lookup:
    //     {
    //       from: "gi",
    //       localField: "id_GI_personalAsignado",
    //       foreignField: "ObjectId(_id)",
    //       as: "evaluador"
    //     }
    //   },
    //   {
    //     $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$evaluador", 0] }, "$$ROOT"] } }
    //   },
    //   {
    //     $project: {
    //       id_GI_personalAsignado: 1,
    //       valor_servicio: 1,
    //       faena_seleccionada_cp: 1,
    //       fecha_evaluacion: 1,
    //       fecha_evaluacion_fin: 1,
    //       hora_inicio_evaluacion: 1,
    //       hora_termino_evaluacion: 1,
    //       mes: 1,
    //       anio: 1,
    //       nombre_servicio: 1,
    //       rut_cp: 1,
    //       razon_social_cp: 1,
    //       rut_cs: 1,
    //       razon_social_cs: 1,
    //       lugar_servicio: 1,
    //       sucursal: 1,
    //       observaciones: 1,
    //       estado_archivo: 1,
    //       estado: 1,
    //       razon_social: 1,
    //     }
    //   },
    //   {
    //     $match: { isActive: true }
    //   },
    //   {
    //     $match: { ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }
    //   },
    // ]
    // ).toArray();

    // console.log('agregate', mergedEvaluaciones);

    // const countEva = await db.collection("evaluaciones").find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }).count();
    // const result = await db
    //   .collection("evaluaciones")
    //   .find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .sort({ codigo: -1 })
    //   .toArray();

    let countEva;
    let result;

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countEva = await db
        .collection("evaluaciones")
        .find({ rut_cp: dataToken.rut, isActive: true })
        .count();
      result = await db
        .collection("evaluaciones")
        .find({ rut_cp: dataToken.rut, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .toArray();
    } else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      countEva = await db
        .collection("evaluaciones")
        .find({ id_GI_personalAsignado: dataToken.id, isActive: true })
        .count();
      result = await db
        .collection("evaluaciones")
        .find({ id_GI_personalAsignado: dataToken.id, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .toArray();
    } else {
      countEva = await db
        .collection("evaluaciones")
        .find({ isActive: true })
        .count();
      result = await db
        .collection("evaluaciones")
        .find({ isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .toArray();
    }

    return res.json({
      // auth: AUTHORIZED,
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      evaluaciones: null,
      err: String(error),
    });
  } finally {
    conn.close();
  }
});

//BUSCAR POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db("asis-db");
  const token = req.headers["x-access-token"];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

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
    // if (dataToken.rol === 'Clientes') {
    //   countEva = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else if (dataToken.rol === 'Colaboradores') {
    //   countEva = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else {
    //   countEva = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("evaluaciones")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // };

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countEva = await db
        .collection("evaluaciones")
        .find({
          [headFilter]: rexExpresionFiltro,
          rut_cp: dataToken.rut,
          isActive: true,
        })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({
          [headFilter]: rexExpresionFiltro,
          rut_cp: dataToken.rut,
          isActive: true,
        })
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      countEva = await db
        .collection("evaluaciones")
        .find({
          [headFilter]: rexExpresionFiltro,
          id_GI_personalAsignado: dataToken.id,
          isActive: true,
        })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({
          [headFilter]: rexExpresionFiltro,
          id_GI_personalAsignado: dataToken.id,
          isActive: true,
        })
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countEva = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("evaluaciones")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .sort({ fecha_evaluacion_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.status(200).json({
      total_items: countEva,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEva / nPerPage + 1),
      evaluaciones: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      evaluaciones: null,
      err: String(error),
    });
  } finally {
    conn.close();
  }
});

//EDITAR EVALUACION -----------> PENDIENTE
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const evaluacion = JSON.parse(req.body.data);
  const conn = await connect();
  const db = conn.db("asis-db");
  const token = req.headers["x-access-token"];

  if (!token)
    return res
      .status(401)
      .json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0)
    return res
      .status(400)
      .json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === "Clientes" || dataToken.rol === "Colaboradores")
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
    return res
      .status(201)
      .json({ message: "Evaluacion modificada correctamente" });
  } catch (error) {
    return res.status(501).json({ message: "ha ocurrido un error", error });
  } finally {
    conn.close();
  }
});

//PASAR A EN EVALUACION
router.post("/evaluar/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db("asis-db");
  const datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let archivo = "";
  let obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: "Cargado",
  };

  // if (req.file) archivo = {
  //   name: req.file.originalname,
  //   size: req.file.size,
  //   path: req.file.path,
  //   type: req.file.mimetype,
  //   option: "file"
  // };

  try {
    if (req.file) {
      // const nombrePdf = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
      //   ? NAME_PSICO_PDF : datos.nombre_servicio === 'Aversión al Riesgo' ? NAME_AVERSION_PDF : OTHER_NAME_PDF;

      const nombrePdf = OTHER_NAME_PDF;

      // const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_psicosensotecnico.png`;
      // archivo = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
      //   ? `psico_${datos.codigo}_${uuid()}`
      //   : datos.nombre_servicio === 'Aversión al Riesgo'
      //     ? `aversion_${datos.codigo}_${uuid()}`
      //     : `${datos.codigo}_${uuid()}`;

      const evaluacionFinded = await db
        .collection("evaluaciones")
        .findOne({ codigo: datos.codigo });

      archivo = `${evaluacionFinded.razon_social_cs.split(" ").join("")}_${
        evaluacionFinded.rut_cs
      }_${datos.nombre_servicio.split(" ").join("")}_${
        evaluacionFinded.codigo.split("-")[3]
      }`;

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: "application/pdf",
        };

        uploadFileToS3(params);
      }, 2000);
    }

    const result = await db.collection("evaluaciones").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: "En Evaluacion",
          estado_archivo: "Cargado",
          fecha_carga_examen: datos.fecha_carga_examen,
          hora_carga_examen: datos.hora_carga_examen,
          url_file_adjunto_EE: archivo,
        },
        $push: {
          observaciones: obs,
        },
      }
    );

    return res
      .status(200)
      .json({ err: null, msg: "Examen cargado", res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close();
  }
});

//PASAR A EVALUADO
router.post("/evaluado/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db("asis-db");
  const datos = req.body;

  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let estadoEvaluacion = "";
  let obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: datos.estado_archivo,
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
      // const isOnline = result.value.url_file_adjunto_EE.option = "online" ? true : false;

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
        fecha_resultado: datos.fecha_confirmacion_examen,
        // fecha_resultado: result.value.fecha_evaluacion,
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
        // estado_archivo: isOnline ? "Cargado" : "Sin Documento",
        // estado_archivo: 'Sin Documento',
        estado_archivo: "Cargado",
        estado_resultado: "",
        isActive: true,
        fecha_resultado_format: new Date(
          moment(datos.fecha_confirmacion_examen, FORMAT_DATE)
        ),
      });

      result = resultinsert;
    }

    return res
      .status(200)
      .json({ err: null, msg: "Evaluacion realizada", res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close();
  }
});

//DELETE / ANULAR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db("asis-db");

  try {
    const resultEva = await db
      .collection("evaluaciones")
      .findOneAndUpdate({ _id: ObjectID(id) }, { $set: { isActive: false } });

    if (resultEva?.value?.codigo) {
      const codeEva = resultEva.value.codigo;

      await db
        .collection("solicitudes")
        .updateOne(
          { codigo: codeEva.replace("EVA", "SOL") },
          { $set: { isActive: false } }
        );
      await db
        .collection("reservas")
        .updateOne(
          { codigo: codeEva.replace("EVA", "AGE") },
          { $set: { isActive: false } }
        );
      await db
        .collection("resultados")
        .updateOne(
          { codigo: codeEva.replace("EVA", "RES") },
          { $set: { isActive: false } }
        );
      await db
        .collection("facturaciones")
        .updateOne(
          { codigo: codeEva.replace("EVA", "FAC") },
          { $set: { isActive: false } }
        );
      await db
        .collection("pagos")
        .updateOne(
          { codigo: codeEva.replace("EVA", "PAG") },
          { $set: { isActive: false } }
        );
      await db
        .collection("cobranza")
        .updateOne(
          { codigo: codeEva.replace("EVA", "COB") },
          { $set: { isActive: false } }
        );
    }

    return res
      .status(200)
      .json({ err: null, msg: DELETE_SUCCESSFULL, res: [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close();
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

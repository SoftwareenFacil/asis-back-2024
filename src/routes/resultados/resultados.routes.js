import { Router } from "express";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import { getDateEspecific } from "../../functions/getEspecificDate";
import multer from "../../libs/multer";
import { uploadFileToS3, getObjectFromS3 } from "../../libs/aws";
import moment from 'moment';
import sendinblue from "../../libs/sendinblue/sendinblue";

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
  DELETE_SUCCESSFULL
} from "../../constant/text_messages";

const router = Router();

var path = require("path");
var AWS = require('aws-sdk');
var fs = require("fs");

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { NOT_EXISTS, AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, OTHER_NAME_PDF, FORMAT_DATE, SB_TEMPLATE_SEND_RESULTS, CURRENT_ROL, COLABORATION_ROL, SB_TEMPLATE_SEND_CONSOLIDATED_RESULTS, CONSOLIDATED_REPORT_RESULTS_PDF, CONSOLIDATED_EXCEL_RESULTS, NUMBER_MONTHS, EXCEL_CONSOLIDATED_RESULTS, COLUMNS_NAME_RESULTS, SB_TEMPLATE_SEND_CONSOLIDATE_REQUESTS } from "../../constant/var";
import getCondicionatesString from "../../functions/transformCondicionantes";
import createPdfConsolidado from "../../functions/createPdf/cobranza/createPdfConsolidado";
// import createExcel from "../../functions/createExcel/createExcelConsolidado";
import createExcelConsolidadoResults from '../../functions/createExcel/createExcelConsolidadoResults';
import createExcelMensualResultados from '../../functions/createExcel/createExcelAnualResultados';

//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection("resultados")
      .find(dataToken.rol === 'Clientes' ? { id_GI_Principal: dataToken.id, isActive: true } : { isActive: true })
      .sort({ codigo: -1 })
      .toArray();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: ERROR, error })
  } finally {
    conn.close()
  }
});

//GENERATE CONSOLIDATED EXCEL SYSTEM
router.post("/consolidated/:anio/:mes", async (req, res) => {
  const { anio, mes } = req.params;
  const { emails } = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {

    console.log([anio, mes, emails])

    const regexDate = `-${NUMBER_MONTHS[mes.toLowerCase()]}-${anio}`

    const resultados = await db.collection("resultados").find({ isActive: true, fecha_resultado: { $regex: regexDate }}).toArray();

    const resultadosReduced = !!resultados ? resultados.map(resultado => {
      return {
        codigo_solicitud: !!resultado.codigo ? resultado.codigo.replace("RES", "SOL") : "",
        ...resultado
      }
    }): [];

    const pdfname = `${EXCEL_CONSOLIDATED_RESULTS}_${uuid()}.xlsx`;

    createExcelMensualResultados(
      pdfname,
      { columnsNameResults: COLUMNS_NAME_RESULTS },
      { rowsDataResults: resultadosReduced },
      { headerKeyColorResults: '#334ACD' },
      { headerColorResults: '#7B8497' },
      { fontColorResults: 'white' }
    );

    setTimeout(() => {
      const excelContent = fs.readFileSync(`uploads/${pdfname}`);

      const excelParams = {
        Bucket: AWS_BUCKET_NAME,
        Body: excelContent,
        Key: pdfname,
        ContentType: 'application/vnd.ms-excel'
      }

      uploadFileToS3(excelParams);

      sendinblue(
        emails,
        SB_TEMPLATE_SEND_CONSOLIDATE_REQUESTS,
        {
          CODIGO_SOLICITUD: ''
        },
        [
          {
            content: Buffer.from(excelContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `${pdfname}.xlsx`
          }
        ]
      );

      try {
        fs.unlinkSync(`uploads/${pdfname}`);
      } catch (error) {
        console.log('No se ha podido eliminar el archivo ', error)
      }
    }, 5000);

    return res.status(200).json({ err: null, msg: 'Informe generado correctamente', res: [] });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
})

//SELECT FILTER
router.get('/gifilter/:rut', async (req, res) => {
  const { rut } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const results = await db.collection('resultados').find({ rut_cp: rut, isActive: true }).toArray();
    if (!results) return { err: 98, msg: 'No se encontraron resultados para el GI seleccionado', res: null };

    return res.status(200).json({ err: null, msg: 'Resultados encontrados encontradas', res: results })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }
  finally {
    conn.close();
  }
});

//SEND MAIL WITH RESULTS
router.post('/sendmail/:id', async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const result = await db.collection('resultados').findOne({ _id: ObjectID(id) });

    if (!result) return { err: 98, msg: 'El Resultado no existe en los registros del sistema', res: null };

    const pathPdf = result.url_file_adjunto_res;

    const clientePrincipal = await db
      .collection("gi")
      .findOne({ rut: result.rut_cp, categoria: 'Empresa/Organizacion' });

    const profesionalAsignado = await db
      .collection("gi")
      .findOne({ _id: ObjectID(result.id_GI_personalAsignado) });

    const clienteSecundario = await db
      .collection("gi")
      .findOne({ rut: result.rut_cs, categoria: 'Persona Natural' });

    const reserva = await db
      .collection('reservas')
      .findOne({ codigo: result.codigo.replace('RES', 'AGE') });

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.json({ err: String(error), msg: 'No se ha podido encontrar el archivo', res: null });
      }
      else {
        sendinblue(
          datos.emailsArray,
          SB_TEMPLATE_SEND_RESULTS,
          {
            RAZON_SOCIAL_CP_SOLICITUD: clientePrincipal.razon_social || '',
            CODIGO_RESULTADO: result.codigo,
            NOMBRE_SERVICIO_SOLICITUD: result.nombre_servicio,
            SUCURSAL_SOLICITUD: result.sucursal,
            JORNADA_RESERVA: reserva.jornada || '',
            FECHA_EXAMEN_RESULTADO: result.fecha_resultado,
            RESULTADO_EXAMEN: result.estado_resultado,
            RESTRICCIONES_EXAMEN: getCondicionatesString(result.condicionantes),
            FECHA_VENCIMIENTO_EXAMEN: result.fecha_vencimiento_examen,
            RUT_CLIENTE_SECUNDARIO: clienteSecundario.rut || '',
            NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario.razon_social || '',
            RUT_PROFESIONAL_ASIGNADO: profesionalAsignado.rut || '',
            NOMBRE_PROFESIONAL_ASIGNADO: profesionalAsignado.razon_social || ''
          },
          [
            {
              content: Buffer.from(data.Body).toString('base64'), // Should be publicly available and shouldn't be a local file
              name: `Resultado_${result.codigo}.pdf`
            }
          ]
        );

        return res.status(200).json({
          err: null,
          msg: 'Se ha enviado el resultado correctamente',
          res: data.Body,
          filename: pathPdf
        });
      };
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  } finally {
    conn.close();
  }
});

//pdf consolidado
router.post("/pdfconsolidado", async (req, res) => {
  const { gi, results, emails, filtrofecha = null, filtrocontrato = null, filtrofaena = null } = req.body;
  console.log(results)
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const nameFIle = `informe_resultados_${gi.razon_social}_${uuid()}`;
    const nameExcelFile = `excel_informe_consolidado_resultados_${gi.razon_social}_${uuid()}`;
    //sacar los distintos tipos de examenes que hay
    let listExam = [];
    if (!!results && !!results.length) {
      listExam = results.reduce((acc, current) => {
        const aux = acc.find((element) => element === current.nombre_servicio);
        if (!aux) {
          acc.push(current.nombre_servicio)
        }
        return acc;
      }, []);
    }

    //para no crear otro pdf
    const cobranzas = results.map((result) => {
      return {
        ...result,
        fecha_cobranza: result?.fecha_resultado ? moment(result.fecha_resultado, FORMAT_DATE).toDate() : ''
      }
    });

    let cobranzasMapped = [];
    let cobranzasFiltered = [];

    for await (let element of cobranzas){
      // const aux = await db.collection('resultados').findOne({ codigo: element.codigo.replace('COB', 'RES') });
      const auxGi = element?.id_GI_personalAsignado
        ? await db.collection('gi').findOne({ _id: ObjectID(element.id_GI_personalAsignado) })
        : undefined

      if(element?.estado && element.estado_archivo && element.estado === 'Revisado' && element.estado_archivo === 'Aprobado'){
        cobranzasMapped.push({
          ...element,
          nombre_evaluador: !!auxGi ? auxGi.razon_social : '',
          rut_evaluador: !!auxGi ? auxGi.rut : '',
        });
      }
    };

    cobranzas.forEach(element => {
      if(element?.estado && element.estado_archivo && element.estado === 'Revisado' && element.estado_archivo === 'Aprobado'){
        cobranzasFiltered.push(element);
      }
    });

    createPdfConsolidado(CONSOLIDATED_REPORT_RESULTS_PDF, gi, listExam, cobranzasFiltered, 'resultados', filtrofecha, filtrocontrato, filtrofaena);
    createExcelConsolidadoResults(CONSOLIDATED_EXCEL_RESULTS, cobranzasMapped);

    setTimeout(() => {
      const fileContent = fs.readFileSync(`uploads/${CONSOLIDATED_REPORT_RESULTS_PDF}`);
      const excelContent = fs.readFileSync(`uploads/${CONSOLIDATED_EXCEL_RESULTS}`);

      const params = {
        Bucket: AWS_BUCKET_NAME,
        Body: fileContent,
        Key: nameFIle,
        ContentType: 'application/pdf'
      };

      const excelParams = {
        Bucket: AWS_BUCKET_NAME,
        Body: excelContent,
        Key: nameFIle,
        ContentType: 'application/vnd.ms-excel'
      }

      uploadFileToS3(params);
      uploadFileToS3(excelParams);

      sendinblue(
        emails,
        SB_TEMPLATE_SEND_CONSOLIDATED_RESULTS,
        {
          RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
        },
        [
          {
            content: Buffer.from(fileContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `${nameFIle}.pdf`
          },
          {
            content: Buffer.from(excelContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `${nameExcelFile}.xlsx`
          }
        ]
      );

    }, 2000);

    return res.status(200).json({ err: null, msg: 'Informe enviado correctamente', res: [] })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(err), msg: ERROR, res: null });
  } finally {
    conn.close();
  }
});

// router.get("/excelconsolidado", async (req, res) => {
//   const conn = await connect();
//   const db = conn.db('asis-db');

//   try {
//     createExcel("Excel_consolidado_resultados.xlsx");
//     return res.json({ msg: 'Ok' })
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ err: String(error), msg: ERROR, res: null })
//   } finally {
//     conn.close();
//   }
// });

//SELECT ONE 
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection('resultados').findOne({ _id: ObjectID(id) });
    if (!result) return res.status(400).json({ err: 98, msg: NOT_EXISTS, res: null })

    return res.status(200).json({ err: null, msg: '', res: result })

  } catch (error) {
    return res.status(200).json({ err: String(error), msg: 'Ha ocurrido un error', res: null })
  } finally {
    conn.close()
  }
});

//GET FILE FROM AWS S3
router.get('/downloadfile/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const resultado = await db.collection('resultados').findOne({ _id: ObjectID(id), isActive: true });
    if (!resultado) return res.status(500).json({ err: 98, msg: NOT_EXISTS, res: null });

    const pathPdf = resultado.url_file_adjunto_res;

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.status(500).json({ err: String(error), msg: 'error s3 get file', res: null });
      }
      else {
        console.log(pathPdf)
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
  } finally {
    conn.close()
  }
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countRes = await db.collection("resultados").find({ ...isRolResultados(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }).count();
    // const result = await db
    //   .collection("resultados")
    //   .find({ ...isRolResultados(dataToken.rol, dataToken.rut, dataToken.id), isActive: true })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .sort({ codigo: -1 })
    //   .toArray();

    let countRes;
    let result;

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countRes = await db.collection("resultados").find({ rut_cp: dataToken.rut, isActive: true }).count();
      result = await db
        .collection("resultados")
        .find({ rut_cp: dataToken.rut, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .toArray();
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      countRes = await db.collection("resultados").find({ id_GI_personalAsignado: dataToken.id, isActive: true }).count();
      result = await db
        .collection("resultados")
        .find({ id_GI_personalAsignado: dataToken.id, isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .toArray();
    }
    else {
      countRes = await db.collection("resultados").find({ isActive: true }).count();
      result = await db
        .collection("resultados")
        .find({ isActive: true })
        .skip(skip_page)
        .limit(nPerPage)
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .toArray();
    }

    return res.json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      resultados: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      resultados: null,
      err: String(error)
    });
  } finally {
    conn.close()
  }
});

//BUSCAR POR RUT O NOMBRE
router.post('/buscar', async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');
  const token = req.headers['x-access-token'];

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
  let countRes;

  try {

    // if (dataToken.rol === 'Clientes') {
    //   countSol = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else if (dataToken.rol === 'Colaboradores') {
    //   countSol = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else {
    //   countRes = await db
    //     .collection("resultados")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("resultados")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countRes = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .count();

      result = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, rut_cp: dataToken.rut, isActive: true })
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      countRes = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
        .count();

      result = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id, isActive: true })
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else {
      countRes = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("resultados")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .sort({ fecha_resultado_format: -1, estado: 1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.status(200).json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      resultados: result,
    });

  } catch (error) {
    console.log(error)
    return res.status(501).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      resultados: null,
      err: String(error)
    });
  } finally {
    conn.close()
  }

})

router.post('/filter/:firstDate/:secondDate', async (req, res) => {
  const { firstDate, secondDate } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    console.log([firstDate, secondDate])
    let results = [];
    if(firstDate === secondDate){
      results = await db.collection('resultados').find({ fecha_resultado: firstDate }).toArray();  
    }
    else{
      results = await db.collection('resultados').find({ fecha_resultado: { $gte: firstDate, $lt: secondDate } }).toArray();
    }
    console.log(results.length)
    return res.status(200).json({ err: null, msg: 'Resultados encontrados', res: results });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: 'ha ocurrido un error', res: [] })
  } finally {
    conn.close()
  }
})

//SUBIR ARCHIVO RESULTADO
router.post("/subir/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const datos = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let archivo = {};
  // let obs = {};
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());
  // obs.estado = "Cargado";

  const obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: "Cargado"
  }

  // if (req.file) archivo = {
  //   name: req.file.originalname,
  //   size: req.file.size,
  //   path: req.file.path,
  //   type: req.file.mimetype,
  // };

  try {
    if (req.file) {
      // const nombrePdf = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
      //   ? NAME_PSICO_PDF : datos.nombre_servicio === 'Aversión al Riesgo' ? NAME_AVERSION_PDF : OTHER_NAME_PDF;
      const nombrePdf = OTHER_NAME_PDF;
      const archivo = `${datos.razon_social_cs}_${datos.rut_cs}_${datos.nombre_servicio}_${datos.codigo.split('_')[3]}`;

      // const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_psicosensotecnico.png`;
      // archivo = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
      //   ? `psico_${datos.codigo}_${uuid()}`
      //   : datos.nombre_servicio === 'Aversión al riesgo'
      //     ? `aversion_${datos.codigo}_${uuid()}`
      //     : `${datos.codigo}_${uuid()}`;

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

    const result = await db.collection("resultados").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado_archivo: "Cargado",
          url_file_adjunto_res: archivo,
        },
        $push: {
          observaciones: obs,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Archivo subido', res: result });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: null, msg: ERROR, res: null });
  } finally {
    conn.close()
  }

});

//confirmar resultado
router.post("/confirmar/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const datos = req.body;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let result = "";
  const obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date())
  };
  // let obs = {};
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());

  console.log(datos);

  try {
    if (datos.estado_archivo == "Aprobado") {
      obs.estado = datos.estado_archivo;
      if (
        datos.estado_resultado == "Aprobado con obs" ||
        datos.estado_resultado == "Aprobado"
      ) {
        result = await db.collection("resultados").findOneAndUpdate(
          { _id: ObjectID(id) },
          {
            $set: {
              estado: "Revisado",
              estado_archivo: datos.estado_archivo,
              estado_resultado: datos.estado_resultado,
              vigencia_examen: datos.vigencia_examen,
              fecha_resultado: datos.fecha_resultado,
              hora_resultado: datos.hora_resultado,
              condicionantes: datos.condicionantes,
              fecha_vencimiento_examen: moment(datos.fecha_resultado, FORMAT_DATE).add(datos.vigencia_examen, 'M').format(FORMAT_DATE)
              // fecha_vencimiento_examen: getDateEspecific(
              //   getFechaVencExam(datos.fecha_resultado, datos.vigencia_examen)
              // ),
            },
            $push: {
              observaciones: obs,
            },
          }
        );
      } else {
        result = await db.collection("resultados").findOneAndUpdate(
          { _id: ObjectID(id) },
          {
            $set: {
              estado: "Revisado",
              estado_archivo: datos.estado_archivo,
              estado_resultado: datos.estado_resultado,
              fecha_resultado: datos.fecha_resultado,
              hora_resultado: datos.hora_resultado,
            },
            $push: {
              observaciones: obs,
            },
          }
        );
      }

      //insercion de la facturación
      let codAsis = result.value.codigo;
      let gi = await db
        .collection("gi")
        .findOne({ rut: result.value.rut_cp, categoria: "Empresa/Organizacion" });
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

      if (result) {
        result = await db.collection("facturaciones").insertOne({
          codigo: codAsis.replace("RES", "FAC"),
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
          condicionantes: datos.condicionantes,
          vigencia_examen: datos.vigencia_examen,
          oc: isOC,
          archivo_oc: "",
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
          porcentaje_impuesto: 0,
          valor_impuesto: 0,
          sub_total: 0,
          exento: 0,
          descuento: 0,
          total: 0,
          isActive: true
        });
      }
    } else {
      obs.estado = datos.estado_archivo;
      result = await db.collection("resultados").updateOne(
        { _id: ObjectID(id) },
        {
          $set: {
            estado_archivo: datos.estado_archivo,
          },
          $push: {
            observaciones: obs,
          },
        }
      );
    }
    return res.status(200).json({ err: null, msg: 'Resultado evaluado satisfactoriamente', res: result });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close()
  }
});

//DELETE / ANULAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    // const existResultado = await db.collection('resultados').findOne({ _id: ObjectID(id) });
    // if (!existResultado) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'resultado no existe' });

    // const codeEvaluacion = existResultado.codigo.replace('RES', 'EVA');
    // const existEvaluacion = await db.collection('evaluaciones').findOne({ codigo: codeEvaluacion });
    // if (!existEvaluacion) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'evaluacion no existe' });

    // const codeReserva = existEvaluacion.codigo.replace('EVA', 'AGE');
    // const existReserva = await db.collection('reservas').findOne({ codigo: codeReserva });
    // if (!existReserva) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'reserva no existe' });

    // const codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
    // const existSolicitud = await db.collection('solicitudes').findOne({ codigo: codeSolicitud });
    // if (!existSolicitud) return res.status(200).json({ msg: DELETE_SUCCESSFULL, status: 'solicitud no existe no existe' });

    // await db.collection('resultados').updateOne({ _id: ObjectID(id) }, {
    //   $set: {
    //     isActive: false
    //   }
    // });
    // await db.collection('evaluaciones').updateOne({ codigo: codeEvaluacion }, {
    //   $set: {
    //     isActive: false
    //   }
    // });
    // await db.collection('reservas').updateOne({ codigo: codeReserva }, {
    //   $set: {
    //     isActive: false
    //   }
    // });
    // await db.collection('solicitudes').updateOne({ codigo: codeSolicitud }, {
    //   $set: {
    //     isActive: false
    //   }
    // });

    const resultRes = await db.collection('resultados').findOneAndUpdate({ _id: ObjectID(id) }, {$set: { isActive: false}})

    if(resultRes?.value?.codigo){
      const codeRes = resultRes.value.codigo;

      await db.collection('solicitudes').updateOne({ codigo: codeRes.replace("RES", "SOL") }, {$set: { isActive: false}})
      await db.collection('reservas').updateOne({ codigo: codeRes.replace("RES", "AGE") }, {$set: { isActive: false}})
      await db.collection('evaluaciones').updateOne({ codigo: codeRes.replace("RES", "EVA") }, {$set: { isActive: false}})
      await db.collection('facturaciones').updateOne({ codigo: codeRes.replace("RES", "FAC") }, {$set: { isActive: false}});
      await db.collection('pagos').updateOne({ codigo: codeRes.replace("RES", "PAG") }, {$set: { isActive: false}});
      await db.collection('cobranza').updateOne({ codigo: codeRes.replace("RES", "COB") }, {$set: { isActive: false}});
    }

    return res.status(200).json({ err: null, msg: DELETE_SUCCESSFULL, res: null });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close()
  }
});

// ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();

//   try {
//     const result = await db
//       .collection("resultados")
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

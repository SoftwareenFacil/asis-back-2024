import { Router } from "express";
import moment from "moment";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import excelToJson from "../../functions/insertManyGis/excelToJson";
import validateTipoCliente from "../../functions/insertManyGis/verificateTipoCliente";
import getEmpresasGI from "../../functions/insertManyGis/getEmpresasGI";
import getPersonasGI from "../../functions/insertManyGis/getPersonasGI";
import eliminateDuplicated from "../../functions/insertManyGis/eliminateDuplicated";
// import verificateGrupoInteres from "../../functions/insertManyGis/verificateGrupoInteres";
import verificateCatEmpresa from "../../functions/insertManyGis/verificateCatEmpresa";
import verificateCatPersona from "../../functions/insertManyGis/verificateCatPersona";
import verificateCatCliente from "../../functions/insertManyGis/verificateCatCliente";
import verificateCredito from "../../functions/insertManyGis/verificateCredito";
import verificateFechaInicio from "../../functions/insertManyGis/verificateFechaInicio";
import verificateDiasCredito from "../../functions/insertManyGis/verificateDiasCredito";
import verificateOrdenCompra from "../../functions/insertManyGis/verificateOrdenCompra";
import createJsonGIs from "../../functions/insertManyGis/createJsonGiForInsert";
import addCodeGI from "../../functions/insertManyGis/addCodeGI";
import { uploadFileToS3 } from "../../libs/aws";
import { v4 as uuid } from "uuid";

import {
  verificateGrupoInteres,
  eliminatedDuplicated,
  verificateClientType,
  isExistsRUT,
  mapDataToInsertManyGIs
} from '../../functions/companiesInsert';

import { ERROR } from "../../constant/text_messages";

import multer from "../../libs/multer";

import { encrypPassword } from "../../libs/bcrypt";
import { verifyToken } from "../../libs/jwt";

const router = Router();

var AWS = require('aws-sdk');
var fs = require("fs");

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { ALREADY_EXISTS, NOT_EXISTS, OTHER_NAME_PDF, AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "../../constant/var";
import { mapDataToInsertManyNaturalPersons } from "../../functions/naturalPersonsInsert";

// SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED, ERROR });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let result = await db
      .collection("gi").find({ activo_inactivo: true })
      .sort({ codigo: 1 })
      .toArray();

    return res.status(200).json({
      total_items: 0,
      pagina_actual: 0,
      nro_paginas: 0,
      gis: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: pageNumber,
      nro_paginas: 0,
      gis: [],
    })
  }finally{
    conn.close()
  }
});

//GET FILE FROM AWS S3
router.get("/downloadfile/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const gi = await db.collection('gi').findOne({ _id: ObjectID(id), activo_inactivo: true });
    if (!gi) return res.status(404).json({ err: 98, msg: NOT_EXISTS, res: null });

    const pathPdf = gi.url_file_adjunto || '';

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.status(500).json({ err: String(error), msg: 'error s3 get file', res: null });
      }
      else {
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
    return res.status(400).json({ err: String(error), res: null });
  } finally{
    conn.close()
  }
});

// SELECT GI PAGINATED
router.post("/pagination", async (req, res) => {
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const countGIs = await db.collection("gi").find({ activo_inactivo: true }).count();
    const result = await db
      .collection("gi")
      .find({ activo_inactivo: true })
      .skip(skip_page)
      .limit(nPerPage)
      .sort({ codigo: -1 })
      .toArray();

    console.log({
      total_items: countGIs,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGIs / nPerPage + 1),
      // gis: result,
    })
    return res.json({
      total_items: countGIs,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGIs / nPerPage + 1),
      gis: result,
    });

  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: pageNumber,
      nro_paginas: 0,
      gis: []
    });
  }finally{
    conn.close()
  }
});

//SELECT ONLY EMPRESAS
router.get("/empresas", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Empresa/Organizacion", activo_inactivo: true })
      .toArray();
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }finally{
    conn.close()
  }
});

//SELECT ONLY PERSONS
router.get("/personal", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Persona Natural", activo_inactivo: true })
      .toArray();
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }finally{
    conn.close()
  }
});

//get only workers and natural person
router.get('/workers', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Persona Natural", activo_inactivo: true })
      .toArray();
    const gisMapped = result.filter((gi) => gi.grupo_interes === 'Empleados' || gi.grupo_interes === 'Colaboradores') || []
    return res.status(200).json({ err: null, res: gisMapped });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }finally{
    conn.close()
  }
});

//BUSCAR GIS POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  console.log('', [identificador, filtro, pageNumber, nPerPage])

  try {
    let rutFiltrado;
    if (identificador === 1 && filtro.includes("k")) {
      rutFiltrado = filtro;
      rutFiltrado.replace("k", "K");
    } else {
      rutFiltrado = filtro;
    };

    const rexExpresionFiltro = new RegExp(rutFiltrado, "i");
    let result;
    let countGIs;
    if (identificador === 1) {
      countGIs = await db
        .collection("gi")
        .find({ rut: rexExpresionFiltro, activo_inactivo: true })
        .count();
      result = await db
        .collection("gi")
        .find({ rut: rexExpresionFiltro, activo_inactivo: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else if (identificador === 2) {

      countGIs = await db
        .collection("gi")
        .find({ razon_social: rexExpresionFiltro, activo_inactivo: true })
        .count();
      result = await db
        .collection("gi")
        .find({ razon_social: rexExpresionFiltro, activo_inactivo: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();

      // countGIs = await db
      //   .collection("gi")
      //   .find({ $text: { $search: String(rexExpresionFiltro), $diacriticSensitive: false, $caseSensitive: false } , activo_inactivo: true })
      //   .count();
      // result = await db
      //   .collection("gi")
      //   .find({ $text: { $search: String(rexExpresionFiltro), $diacriticSensitive: false, $caseSensitive: false }, activo_inactivo: true })
      //   .skip(skip_page)
      //   .limit(nPerPage)
      //   .toArray();
    }
    else {
      countGIs = await db
        .collection("gi")
        .find({ grupo_interes: rexExpresionFiltro, activo_inactivo: true })
        .count();
      result = await db
        .collection("gi")
        .find({ grupo_interes: rexExpresionFiltro, activo_inactivo: true })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    return res.status(200).json({
      total_items: countGIs,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGIs / nPerPage + 1),
      gis: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      gis: [],
      err: String(error)
    });
  }finally{
    conn.close()
  }
});

//SELECT BY RUT
router.post("/client", async (req, res) => {
  const { rut, selector } = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');
  let rutFiltrado;
  let result = "";

  if (rut.includes("k")) {
    rutFiltrado = rut.replace("k", "K");
  } else {
    rutFiltrado = rut;
  }

  console.log('rut filtrado', [rutFiltrado, selector])

  try {
    if (selector == 1) {
      result = await db
        .collection("gi")
        .findOne({ rut: rutFiltrado, categoria: "Empresa/Organizacion", activo_inactivo: true });
    } else if (selector == 2) {
      result = await db
        .collection("gi")
        .findOne({ rut: rutFiltrado, categoria: "Persona Natural", activo_inactivo: true });
    }

    if (!result) {
      return res.status(200).json({ err: 98, res: result });
    }

    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(500).json({ err: String(err), res: null });
  }finally{
    conn.close()
  }
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db.collection("gi").findOne({ _id: ObjectID(id), activo_inactivo: true });
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ err: String(error), res: null });
  }finally{
    conn.close()
  }
});

//UPDATE GI
router.put('/:id', multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  let updatedGI = JSON.parse(req.body.data);
  const conn = await connect();
  const db = conn.db('asis-db');
  let archivo;

  if (req.file) {
    updatedGI.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    };
  }

  try {
    updatedGI.rol = updatedGI.rol || 'Clientes';

    if (updatedGI.rut !== '' && updatedGI.rut.split('-')[1] === 'k') {
      updatedGI.rut = `${updatedGI.rut.split('-')[0]}-K`;
    }

    const exitstGI = await db.collection('gi').findOne({ _id: ObjectID(id) });
    if (!exitstGI) {
      return res.status(400).json({ err: 98, res: NOT_EXISTS });
    };

    if(req.file){
      archivo = `GI_${updatedGI.razon_social || ''}_${exitstGI.codigo}_${uuid()}`;
      updatedGI.url_file_adjunto = archivo;

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${OTHER_NAME_PDF}`);
        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    }

    await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
      $set: {
        ...exitstGI,
        ...updatedGI
      }
    });
    
    return res.status(200).json({ err: null, res: "GI modificado correctamente" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), res: null });
  }finally{
    conn.close()
  }
});

//UPDATE PASSWORD
router.put('/editpassword/:id', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { id } = req.params;
  const data = req.body;

  console.log('id', id)
  console.log('data', data);

  try {

    // if (!data.new_password && !data.rol) 
    //   return res.status(400).json({ err:  msg: "no se ha enviado informacion para editar" });

    if (data.isEditPassword) {
      await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
        $set: {
          password: await encrypPassword(data.new_password),
          rol: data.rol
        }
      });

      return res.status(200).json({ err: null, msg: "Configuración realizada exitosamente", res: null });
    }

    await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
      $set: {
        rol: data.rol
      }
    });

    return res.status(200).json({ err: null, msg: "Configuración realizada exitosamente", res: null });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });

  }finally{
    conn.close()
  }
});

//TEST DATOS ARCHIVOS
router.post("/test/gonzalo", multer.single("archivo"), async (req, res) => {
  console.log(req.file);
});

//ENDPOINT PARA INSERCION DE GI EMPRESAS
router.post('/masivo/empresas', multer.single("archivo"), async (req, res) => {
  const data = excelToJson(req.file.path, "PLANTILLA GI_ASIS");
  const conn = await connect();
  const db = conn.db('asis-db');

  try {

    if (!data && data.length === 0) return res.status(200).json({ err: null, msg: 'Excel no contiene información', res: null });

    const { companies, noInserted } = verificateGrupoInteres(data);
    if (companies.length === 0) return res.status(200).json({ err: null, msg: 'No se encontraron gi acorde al tipo en sistema en el excel', res: null });

    const gisInDB = await db.collection('gi').find({ categoria: 'Empresa/Organizacion' }).toArray();
    const { uniqueCompanies, duplicatedGI } = eliminatedDuplicated(companies, gisInDB);
    if (uniqueCompanies.length === 0) return res.status(200).json({ err: null, msg: 'Todos los gi ya se encuentran ingresados en la db', res: null });

    const { clients, notInsertClient } = verificateClientType(uniqueCompanies, 'empresa/organizacion');
    if (clients.length === 0) return res.status(200).json({ err: null, msg: 'No existen Empresa/Organizacion en los datos del excel o solo contenia información duplicada', res: null });

    const { gisWithRut, notInsertGIWithoutRut } = isExistsRUT(clients);
    if (gisWithRut.length === 0) return res.status(200).json({ err: null, msg: 'Ningun gi ingresado contiene rut válido', res: null });

    const gisIsReady = mapDataToInsertManyGIs(gisWithRut);

    const lastGi = await db
      .collection("gi")
      .find({})
      .sort({ codigo: -1 })
      .limit(1)
      .toArray();

    const gisWithCode = addCodeGI(gisIsReady, lastGi[0], moment().format('YYYY'));

    await db.collection('gi').insertMany(gisWithCode);

    return res.status(200).json({
      err: null, msg: 'GIs insertados correctamente', res: {
        cant_inserted: gisWithCode.length,
        cant_not_inserted: [...noInserted, ...duplicatedGI, ...notInsertClient, ...notInsertGIWithoutRut].length,
        not_inserted: [...noInserted, ...duplicatedGI, ...notInsertClient, ...notInsertGIWithoutRut],
        not_inserted: {
          not_interest_group: noInserted,
          duplicate: duplicatedGI,
          not_company: notInsertClient,
          not_contain_rut: notInsertGIWithoutRut
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally{
    conn.close()
  }
});

//ENDPOINT PARA INSERCION DE GI PERSONA NATURAL
router.post('/masivo/persona', multer.single("archivo"), async (req, res) => {
  const data = excelToJson(req.file.path, "PLANTILLA GI_ASIS");
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    if (!data && data.length === 0) return res.status(200).json({ err: null, msg: 'Excel no contiene información', res: null });

    const { companies, noInserted } = verificateGrupoInteres(data);
    if (companies.length === 0) return res.status(200).json({ err: null, msg: 'No se encontraron gi acorde al tipo en sistema en el excel', res: null });

    console.log(companies.length)

    const gisInDB = await db.collection('gi').find({ categoria: 'Persona Natural' }).toArray();
    const { uniqueCompanies, duplicatedGI } = eliminatedDuplicated(companies, gisInDB);
    if (!uniqueCompanies && uniqueCompanies.length === 0) return res.status(200).json({ err: null, msg: 'Todos los gi ya se encuentran ingresados en la db', res: null });

    const { clients, notInsertClient } = verificateClientType(uniqueCompanies, 'persona natural');
    if (clients.length === 0) return res.status(200).json({ err: null, msg: 'No existen Personas Naturales en los datos del excel', res: null });

    const { gisWithRut, notInsertGIWithoutRut } = isExistsRUT(clients);
    if (gisWithRut.length === 0) return res.status(200).json({ err: null, msg: 'Ningun gi ingresado contiene rut válido', res: null });

    const gisIsReady = mapDataToInsertManyNaturalPersons(gisWithRut);

    const lastGi = await db
      .collection("gi")
      .find({})
      .sort({ codigo: -1 })
      .limit(1)
      .toArray();

    const gisWithCode = addCodeGI(gisIsReady, lastGi[0], moment().format('YYYY'));

    await db.collection('gi').insertMany(gisWithCode);

    return res.status(200).json({
      err: null, msg: 'GIs insertados correctamente', res: {
        cant_inserted: gisWithCode.length,
        cant_not_inserted: [...noInserted, ...duplicatedGI, ...notInsertClient, ...notInsertGIWithoutRut].length,
        not_inserted: {
          not_interest_group: noInserted,
          duplicate: duplicatedGI,
          not_company: notInsertClient,
          not_contain_rut: notInsertGIWithoutRut
        }
      }
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally{
    conn.close()
  }
});

//TEST PARA RECIBIR EXCEL DE INGRESO DE GIS
// router.post("/masivo/file", multer.single("archivo"), async (req, res) => {
//   const { nombre } = req.body;
//   const db = await connect();
//   const data = excelToJson(req.file.path, "PLANTILLA GI_ASIS");
//   let array_general_empresas = [];
//   let array_general_personas = [];
//   let array_general = [];
//   let renegados = [];

//   try {
//     if (data.length > 0) {
//       array_general = verificateTipoCliente(data);
//       array_general[1].renegados.forEach((element) => {
//         renegados.push(element);
//       });

//       array_general_empresas = getEmpresasGI(array_general[0].newdata);
//       let empresas = array_general_empresas[0].newdata;

//       array_general_personas = getPersonasGI(array_general[0].newdata);
//       let personas = array_general_personas[0].newdata;

//       // console.log(array_general_personas[0].newdata);

//       empresas = eliminateDuplicated(empresas, "rut");
//       personas = eliminateDuplicated(personas, "rut");

//       empresas = verificateGrupoInteres(empresas);
//       personas = verificateGrupoInteres(personas);

//       empresas = verificateCatEmpresa(empresas);
//       personas = verificateCatPersona(personas);

//       empresas = verificateCatCliente(empresas);
//       personas = verificateCatCliente(personas);

//       empresas = verificateCredito(empresas);
//       empresas = verificateDiasCredito(empresas);

//       empresas = verificateOrdenCompra(empresas);

//       const lastGi = await db
//         .collection("gi")
//         .find({})
//         .sort({ codigo: -1 })
//         .limit(1)
//         .toArray();
//       // console.log(lastGi);

//       let arrayGIs = createJsonGIs(empresas, personas);

//       arrayGIs = addCodeGI(arrayGIs, lastGi[0], YEAR);

//       //sacamos los empleados
//       const empleados = arrayGIs.filter((el) => el.GrupoInteres === 'Empleados');
//       const othersWorkers = arrayGIs.filter((el) => el.GrupoInteres !== 'Empleados');

//       console.log('insert many', othersWorkers[0])

//       await db.collection('gi').insertMany(othersWorkers || []);
//       await db.collection('empleados').insertMany(empleados || []);

//       // const result = await db.collection("gi").insertMany(arrayGIs);

//       return res.json({
//         message: "Ha finalizado la inserción masiva",
//         isOK: true,
//         renegados: [],
//       });
//     } else {
//       return res.json({
//         message: "EL archivo ingresado no es un archivo excel válido",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       message: "Algo ha salido mal",
//       isOK: false,
//       error: String(err),
//     });
//   }
// });

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  let newGi = JSON.parse(req.body.data);
  const items = await db.collection("gi").find({ activo_inactivo: true }).toArray();
  let archivo;

  try {

    if (items.length > 0) {
      const olgid = items.find((gi) => gi.categoria === newGi.categoria && gi.rut === newGi.rut);
      if (olgid) return res.status(400).json({ err: 99, res: ALREADY_EXISTS });
    }

    if (items.length > 0) {
      newGi.codigo = `ASIS-GI-${YEAR}-${calculate(items[items.length - 1])}`;
    } else {
      newGi.codigo = `ASIS-GI-${YEAR}-00001`;
    }

    if (req.file) {
      archivo = `GI_${newGi.razon_social || ''}_${newGi.codigo}_${uuid()}`;
      newGi.url_file_adjunto = archivo;

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${OTHER_NAME_PDF}`);

        console.log('FILE CONTENT', fileContent)
        console.log('ARCHIVO', archivo)
        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    } else {
      newGi.url_file_adjunto = '';
    }

    if (newGi.rut !== '' && newGi.rut.split('-')[1] === 'k') {
      newGi.rut = `${newGi.rut.split('-')[0]}-K`;
    }

    newGi.rol = newGi.rol || 'Clientes';
    newGi.activo_inactivo = true;

    if (newGi.grupo_interes === "Empleados") {
      let obj = {};
      obj.tipo_contrato = "";
      obj.estado_contrato = "";
      obj.fecha_inicio_contrato = "";
      obj.fecha_fin_contrato = "";
      obj.sueldo_bruto = 0;
      obj.afp = "";
      obj.isapre = "";
      obj.seguridad_laboral = "";
      obj.dias_vacaciones = 0;
      obj.comentarios = "";
      obj.detalle_empleado = {
        dias_acumulados: 0,
        dias_recuperados: 0,
        dias_total_ausencias: 0,
        dias_pendientes: 0,
        enfermedad_cant: 0,
        maternidad_cant: 0,
        mediodia_cant: 0,
        tramites_cant: 0,
        vacaciones_cant: 0,
        recuperados_cant: 0,
        mediodia_recuperados_cant: 0,
      };

      newGi = { ...newGi, ...obj }
    };

    await db.collection("gi").insertOne(newGi);

    return res.status(200).json({ err: null, res: 'GI creado satisfactoriamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: `Se ha generado el siguiente error : ${String(error)}`, res: null })
  }finally{
    conn.close()
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const result = await db.collection("gi").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          activo_inactivo: false,
        },
      }
    );
    return res.status(200).json({ err: null, res: 'GI eliminado correctamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), res: null })
  }finally{
    conn.close()
  }
});

//para programar solamente limpiar toda la db
router.delete("/", async (req, res) => {
  // const db = await connect();

  // const gis = await db.collection('gi').find({ categoria: 'Empresa/Organizacion' }).toArray();
  // const reducered = gis.reduce((acc, current) => {
  //   const aux = acc.find(item => item.rut === current.rut);
  //   if (!aux) {
  //     return acc.concat([current]);
  //   }
  //   else {
  //     return acc;
  //   }
  // }, []);
  
  // await db.collection('gi').deleteMany({ categoria: 'Empresa/Organizacion' })

  // await db.collection('gi').insertMany(reducered);


  // let result = await db.collection("gi").drop();
  // await db.collection('gi').deleteMany({ categoria: 'Persona Natural' })
  // await db.collection("cobranza").drop();
  // await db.collection("evaluaciones").drop();
  // await db.collection("existencia").drop();
  // await db.collection("facturaciones").drop();
  // await db.collection("gastos").drop();
  // await db.collection("pagos").drop();
  // await db.collection("prexistencia").drop();
  // await db.collection("reservas").drop();
  // await db.collection("resultados").drop();
  // await db.collection("salidas").drop();
  // await db.collection("solicitudes").drop();
  res.json({ message: "listo" });
});

//change rut k
router.get("/changerut/dv", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');

  const changeDv = (rut) => {
    const dv = rut.split('-')[1];
    console.log(`${rut.split('-')[0]}-${dv.toUpperCase()}`)
    return `${rut.split('-')[0]}-${dv.toUpperCase()}` || rut;
  };

  const verifyDv = (rut) => {
    if (rut === '') return rut;
    const dv = rut.split('-')[1];
    if (dv === 'k' || dv === 'K') return true;
    return false;
  };

  try {

    //traer los gi
    const result = await db.collection('gi').find().toArray();
    //sacar solo los que tiene -k
    const reduceredGis = result.reduce((acc, current) => {
      if (verifyDv(current.rut)) {
        acc.push({ _id: current._id, rut: current.rut });
      }
      return acc;
    }, []);

    //recorrer cada gi e ir editando su rut si es k
    reduceredGis.forEach(async (element) => {
      if (element.rut.split('-')[1] === 'k') {
        await db.collection('gi').updateOne({ _id: ObjectID(String(element._id)) }, {
          $set: {
            rut: changeDv(element.rut)
          }
        })
      }
    });

    return res.json({ msg: 'Ok' });
  } catch (error) {
    return res.status(500).json({ msg: String(error) });
  }finally{
    conn.close()
  }

});


export default router;

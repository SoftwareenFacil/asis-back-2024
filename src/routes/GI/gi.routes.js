import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import excelToJson from "../../functions/insertManyGis/excelToJson";
import validateTipoCliente from "../../functions/insertManyGis/verificateTipoCliente";
import getEmpresasGI from "../../functions/insertManyGis/getEmpresasGI";
import getPersonasGI from "../../functions/insertManyGis/getPersonasGI";
import eliminateDuplicated from "../../functions/insertManyGis/eliminateDuplicated";
import verificateGrupoInteres from "../../functions/insertManyGis/verificateGrupoInteres";
import verificateCatEmpresa from "../../functions/insertManyGis/verificateCatEmpresa";
import verificateCatPersona from "../../functions/insertManyGis/verificateCatPersona";
import verificateCatCliente from "../../functions/insertManyGis/verificateCatCliente";
import verificateCredito from "../../functions/insertManyGis/verificateCredito";
import verificateFechaInicio from "../../functions/insertManyGis/verificateFechaInicio";
import verificateDiasCredito from "../../functions/insertManyGis/verificateDiasCredito";
import verificateOrdenCompra from "../../functions/insertManyGis/verificateOrdenCompra";
import createJsonGIs from "../../functions/insertManyGis/createJsonGiForInsert";
import addCodeGI from "../../functions/insertManyGis/addCodeGI";

import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR } from "../../constant/text_messages";

import multer from "../../libs/multer";

import { encrypPassword } from "../../libs/bcrypt";
import { verifyToken } from "../../libs/jwt";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import verificateTipoCliente from "../../functions/insertManyGis/verificateTipoCliente";
import { ALREADY_EXISTS, NOT_EXISTS } from "../../constant/var";

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
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
  }
});

// SELECT GI PAGINATED
router.post("/pagination", async (req, res) => {
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

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
  }
});

//SELECT ONLY EMPRESAS
router.get("/empresas", async (req, res) => {
  const db = await connect();
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Empresa/Organizacion", activo_inactivo: true })
      .toArray();
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }
});

//SELECT ONLY PERSONS
router.get("/personal", async (req, res) => {
  const db = await connect();
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Persona Natural", activo_inactivo: true })
      .toArray();
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }
});

//get only workers and natural person
router.get('/workers', async (req, res) => {
  const db = await connect();
  try {
    const result = await db
      .collection("gi")
      .find({ categoria: "Persona Natural", grupo_interes: 'Empleados', activo_inactivo: true })
      .toArray();
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    return res.status(400).json({ err: String(error), res: [] })
  }
});

//BUSCAR GIS POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

  console.log('error', [identificador, filtro, pageNumber, nPerPage])

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
  }
});

//SELECT BY RUT
router.post("/client", async (req, res) => {
  const { rut, selector } = req.body;
  const db = await connect();
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
  }
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  try {
    const result = await db.collection("gi").findOne({ _id: ObjectID(id), activo_inactivo: true });
    return res.status(200).json({ err: null, res: result });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ err: String(error), res: null });
  }
});

//UPDATE GI
router.put('/:id', multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  let updatedGI = JSON.parse(req.body.data);
  const db = await connect();

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
  }
});

//UPDATE PASSWORD
router.put('/editpassword/:id', async (req, res) => {
  const db = await connect();
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

  }
});

//TEST DATOS ARCHIVOS
router.post("/test/gonzalo", multer.single("archivo"), async (req, res) => {
  console.log(req.file);
});

//TEST PARA RECIBIR EXCEL DE INGRESO DE GIS
router.post("/masivo/file", multer.single("archivo"), async (req, res) => {
  const { nombre } = req.body;
  const db = await connect();
  const data = excelToJson(req.file.path, "PLANTILLA GI_ASIS");
  let array_general_empresas = [];
  let array_general_personas = [];
  let array_general = [];
  let renegados = [];

  try {
    if (data.length > 0) {
      array_general = verificateTipoCliente(data);
      array_general[1].renegados.forEach((element) => {
        renegados.push(element);
      });

      array_general_empresas = getEmpresasGI(array_general[0].newdata);
      let empresas = array_general_empresas[0].newdata;

      array_general_personas = getPersonasGI(array_general[0].newdata);
      let personas = array_general_personas[0].newdata;

      // console.log(array_general_personas[0].newdata);

      empresas = eliminateDuplicated(empresas, "rut");
      personas = eliminateDuplicated(personas, "rut");

      empresas = verificateGrupoInteres(empresas);
      personas = verificateGrupoInteres(personas);

      empresas = verificateCatEmpresa(empresas);
      personas = verificateCatPersona(personas);

      empresas = verificateCatCliente(empresas);
      personas = verificateCatCliente(personas);

      empresas = verificateCredito(empresas);
      empresas = verificateDiasCredito(empresas);

      empresas = verificateOrdenCompra(empresas);

      const lastGi = await db
        .collection("gi")
        .find({})
        .sort({ codigo: -1 })
        .limit(1)
        .toArray();
      // console.log(lastGi);

      let arrayGIs = createJsonGIs(empresas, personas);

      arrayGIs = addCodeGI(arrayGIs, lastGi[0], YEAR);

      //sacamos los empleados
      const empleados = arrayGIs.filter((el) => el.GrupoInteres === 'Empleados');
      const othersWorkers = arrayGIs.filter((el) => el.GrupoInteres !== 'Empleados');

      console.log('insert many', othersWorkers[0])

      await db.collection('gi').insertMany(othersWorkers || []);
      await db.collection('empleados').insertMany(empleados || []);

      // const result = await db.collection("gi").insertMany(arrayGIs);

      return res.json({
        message: "Ha finalizado la inserción masiva",
        isOK: true,
        renegados: [],
      });
    } else {
      return res.json({
        message: "EL archivo ingresado no es un archivo excel válido",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "Algo ha salido mal",
      isOK: false,
      error: String(err),
    });
  }
});

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  let newGi = JSON.parse(req.body.data);
  const items = await db.collection("gi").find({}).toArray();

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
      newGi.url_file_adjunto = {
        name: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        type: req.file.mimetype,
      };
    } else {
      newGi.url_file_adjunto = {};
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
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();

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
  }
});

//para programar solamente limpiar toda la db
router.delete("/", async (req, res) => {
  const db = await connect();
  let result = await db.collection("gi").drop();
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
  const db = await connect();

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
  }

});

export default router;

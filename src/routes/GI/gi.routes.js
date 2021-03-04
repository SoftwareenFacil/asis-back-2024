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

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED, ERROR });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    let result = await db
      .collection("gi").find({ activo_inactivo: true })
      .sort({ codigo: -1 })
      .toArray();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: ERROR, error })
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

    return res.json({
      total_items: countGIs,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGIs / nPerPage + 1),
      gis: result,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

//SELECT ONLY EMPRESAS
router.get("/empresas", async (req, res) => {
  const db = await connect();
  const result = await db
    .collection("gi")
    .find({ categoria: "Empresa/Organizacion", activo_inactivo: true })
    .toArray();
  return res.json(result);
});

//BUSCAR GIS POR NOMBRE O RUT
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

  return res.json({
    total_items: countGIs,
    pagina_actual: pageNumber,
    nro_paginas: parseInt(countGIs / nPerPage + 1),
    gis: result,
  });
});

//SELECT BY RUT
router.post("/:rut", async (req, res) => {
  const { rut } = req.params;
  const verificador = req.body.verificador;
  const db = await connect();
  let rutFiltrado;
  let result = "";

  if (rut.includes("k")) {
    rutFiltrado = rut.replace("k", "K");
  } else {
    rutFiltrado = rut;
  }

  console.log('rut filtrado', [rutFiltrado, verificador])

  if (verificador == 1) {
    result = await db
      .collection("gi")
      .findOne({ rut: rutFiltrado, categoria: "Empresa/Organizacion", activo_inactivo: true });
    console.log(result);
  } else if (verificador == 2) {
    result = await db
      .collection("gi")
      .findOne({ rut: rutFiltrado, categoria: "Persona Natural", activo_inactivo: true });
  }

  return res.json(result);
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db.collection("gi").findOne({ _id: ObjectID(id), activo_inactivo: true });
  return res.json(result);
});

//UPDATE GI
router.put('/:id', multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const updatedGI = JSON.parse(req.body.data);
  const db = await connect();

  updatedGI.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
  };

  try {
    updatedGI.rol = updatedGI.rol || 'Clientes';

    const exitstGI = await db.collection('gi').findOne({ _id: ObjectID(id) });
    if (!exitstGI) {
      return res.status(400).json({ message: "GI no existe" });
    };

    await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
      $set: {
        ...exitstGI,
        ...updatedGI
      }
    });
    return res.status(200).json({ message: "GI modificado correctamente" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "ha ocurrido un error", error: String(error) });
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

    if (!data.new_password && !data.rol) return res.status(400).json({ msg: "no se ha enviado informacion para editar" });

    if (data.isEditPassword) {
      await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
        $set: {
          password: await encrypPassword(data.new_password),
          rol: data.rol
        }
      });

      return res.status(200).json({ msg: "password y rol modificados correctamente" });
    }

    await db.collection('gi').updateOne({ _id: ObjectID(id) }, {
      $set: {
        rol: data.rol
      }
    });

    return res.status(200).json({ msg: "rol modificado correctamente" });

  } catch (error) {

    return res.status(500).json({ msg: "ha ocurrido un error", error });

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

      await db.collection('gi').insertMany(othersWorkers || []);
      await db.collection('empleados').insertMany(empleados || []);

      // const result = await db.collection("gi").insertMany(arrayGIs);

      res.json({
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
      error: err,
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

    if(newGi.rut.includes('k')){
      newGi.rut.replace('k', 'K')
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

      // await db.collection("empleados").insertOne(obj);
    };

    await db.collection("gi").insertOne(newGi);

    return res.status(200).json({ msg: 'GI creado satisfactoriamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: `Se ha generado el siguiente error : ${String(error)}` })
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
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: `Se ha generado el siguiente error : ${String(error)}` })
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

export default router;

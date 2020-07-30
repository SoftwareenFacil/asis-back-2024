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

import multer from "../../libs/multer";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import verificateTipoCliente from "../../functions/insertManyGis/verificateTipoCliente";

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  let result = await db.collection("gi").find().toArray();
  res.json(result);
});

// SELECT GI PAGINATED
router.post("/pagination", async (req, res) => {
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();
  try {
    const countGIs = await db.collection("gi").find().count();
    const result = await db
      .collection("gi")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countGIs,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGIs / nPerPage + 1),
      gis: result,
    });
  } catch (error) {
    res.status(501).json(error);
  }
});

//SELECT ONLY EMPRESAS
router.get("/empresas", async (req, res) => {
  const db = await connect();
  const result = await db
    .collection("gi")
    .find({ categoria: "Empresa/Organizacion" })
    .toArray();
  res.json(result);
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
  }
  console.log(rutFiltrado);
  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");
  let result;
  let countGIs;
  if (identificador === 1) {
    countGIs = await db
      .collection("gi")
      .find({ rut: rexExpresionFiltro })
      .count();
    result = await db
      .collection("gi")
      .find({ rut: rexExpresionFiltro })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();
  } else {
    countGIs = await db
      .collection("gi")
      .find({ razon_social: rexExpresionFiltro })
      .count();
    result = await db
      .collection("gi")
      .find({ razon_social: rexExpresionFiltro })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();
  }

  res.json({
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

  if (verificador == 1) {
    result = await db
      .collection("gi")
      .findOne({ rut: rutFiltrado, categoria: "Empresa/Organizacion" });
    console.log(result);
  } else if (verificador == 2) {
    result = await db
      .collection("gi")
      .findOne({ rut: rutFiltrado, categoria: "Persona Natural" });
  }

  res.json(result);
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db.collection("gi").findOne({ _id: ObjectID(id) });
  res.json(result);
});

//UPDATE
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const updatedGI = JSON.parse(req.body.data);
  const db = await connect();
  // let result = await db.collection("gi").findOne({ _id: ObjectID(id) });
  updatedGI.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
  };
  try {
    const result = await db
      .collection("gi")
      .replaceOne({ _id: ObjectID(id) }, updatedGI);

    const existEmpleado = await db
      .collection("empleados")
      .findOne({ rut: updatedGI.rut, categoria: updatedGI.categoria });

    if (updatedGI.grupo_interes === "Empleados") {
      if (existEmpleado) {
        await db.collection("empleados").updateOne(
          { rut: updatedGI.rut, categoria: updatedGI.categoria },
          {
            $set: {
              nombre: updatedGI.razon_social,
              rut: updatedGI.rut,
              categoria: updatedGI.categoria,
              cargo: updatedGI.cargo,
              activo_inactivo: true,
            },
          }
        );
      } else {
        //se crea tambien en empleados
        let obj = {};
        obj.nombre = updatedGI.razon_social;
        obj.rut = updatedGI.rut;
        obj.categoria = updatedGI.categoria;
        obj.cargo = updatedGI.cargo;
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
        obj.activo_inactivo = true;
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

        await db.collection("empleados").insertOne(obj);
      }
    } else {
      if (existEmpleado) {
        await db.collection("empleados").updateOne(
          { rut: updatedGI.rut, categoria: updatedGI.categoria },
          {
            $set: {
              activo_inactivo: false,
            },
          }
        );
      }
    }
    res.status(201).json({ message: "GI modificado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "ha ocurrido un error", error });
    console.log(error);
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

      console.log(array_general_personas[0].newdata);

      empresas = eliminateDuplicated(empresas, "Rut");
      personas = eliminateDuplicated(personas, "Rut");

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
      console.log(lastGi);

      let arrayGIs = createJsonGIs(empresas, personas);

      arrayGIs = addCodeGI(arrayGIs, lastGi[0], YEAR);

      const result = await db.collection("gi").insertMany(arrayGIs);

      res.json({
        message: "Ha finalizado la inserción masiva",
        isOK: true,
        renegados: [],
      });
    } else {
      res.json({
        message: "EL archivo ingresado no es un archivo excel válido",
      });
    }
  } catch (err) {
    res.json({
      message: "Algo ha salido mal",
      isOK: false,
      error: err,
    });
  }
});

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const newGi = JSON.parse(req.body.data);
  const items = await db.collection("gi").find({}).toArray();
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

  const result = await db.collection("gi").insertOne(newGi);

  if (newGi.grupo_interes === "Empleados") {
    //se crea tambien en empleados
    let obj = {};
    obj.nombre = newGi.razon_social;
    obj.rut = newGi.rut;
    obj.categoria = newGi.categoria;
    obj.cargo = newGi.cargo;
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

    await db.collection("empleados").insertOne(obj);
  }

  res.json(result);
});

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db.collection("gi").deleteOne({ _id: ObjectID(id) });
  res.json(result);
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

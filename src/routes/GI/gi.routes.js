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
  const db = await connect();
  try {
    const result = await db
      .collection("gi")
      .find()
      .skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0)
      .limit(nPerPage)
      .toArray();
    console.log(result)
    res.json(result);
  } catch (error) {
    res.json(error);
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

//SELECT BY RUT
router.post("/:rut", async (req, res) => {
  const { rut } = req.params;
  const verificador = req.body.verificador;
  const db = await connect();
  let result = "";

  if (verificador == 1) {
    result = await db
      .collection("gi")
      .findOne({ rut: rut, categoria: "Empresa/Organizacion" });
  } else if (verificador == 2) {
    result = await db
      .collection("gi")
      .findOne({ rut: rut, categoria: "Persona Natural" });
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
  const updatedGI = req.body;
  const db = await connect();
  let result = await db.collection("gi").findOne({ _id: ObjectID(id) });
  updatedGI.codigo = result.codigo;
  updatedGI.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path
  }
  console.log(result.codigo);
  result = await db
    .collection("gi")
    .replaceOne({ _id: ObjectID(id) }, updatedGI);
  res.json(result);
});

//TEST PARA GONZALO PASA SUBIR ARCHIVO
router.post("/test/gonzalo", multer.single("archivo"), async (req, res) => {
  const data = req.file;
  res.json(data);
});

//TEST PARA RECIBIR FILES
router.post("/test/file", multer.single("archivo"), async (req, res) => {
  const { nombre } = req.body;
  const db = await connect();
  const data = excelToJson(req.file.path);
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
  const newGi = req.body;
  const items = await db.collection("gi").find({}).toArray();
  if (items.length > 0) {
    newGi.codigo = `ASIS-GI-${YEAR}-${calculate(items[items.length - 1])}`;
  } else {
    newGi.codigo = `ASIS-GI-${YEAR}-00001`;
  }
  
  newGi.url_file_adjunto = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path
  }
  

  const result = await db.collection("gi").insertOne(newGi);
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

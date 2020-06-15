import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import excelToJson from "../../functions/insertManyGis/excelToJson";
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

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("gi").find({}).toArray();
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
      .findOne({ rut: rut, categoria: "Empresa/Organización" });
  } else if (verificador == 2) {
    result = await db
      .collection("gi")
      .findOne({ rut: rut, categoria: "Persona Natural" });
  }

  res.json(result);
});

//TEST PARA GONZALO PASA SUBIR ARCHIVO
router.post("/test/gonzalo", multer.single("archivo"), async (req, res) =>{
  const data = req.file
  res.json(data)
})

//TEST PARA RECIBIR FILES
router.post("/test/file", multer.single("archivo"), async (req, res) => {
  const { nombre } = req.body;
  const db = await connect()
  const data = excelToJson(req.file.path)
  
  try {
    if(data.length > 0){

      let empresas = await getEmpresasGI(data)
      let personas = await getPersonasGI(data)
  
      empresas = eliminateDuplicated(empresas, "Rut")
      personas = eliminateDuplicated(personas, "Rut")
  
      empresas = verificateGrupoInteres(empresas)
      personas = verificateGrupoInteres(personas)
  
      empresas = verificateCatEmpresa(empresas)
      personas = verificateCatPersona(personas)
  
      empresas = verificateCatCliente(empresas)
      personas = verificateCatCliente(personas)
  
      empresas = verificateCredito(empresas)
      // personas = verificateCredito(personas)
      empresas = verificateDiasCredito(empresas)
      // personas = verificateDiasCredito(personas)
  
      // empresas = verificateFechaInicio(empresas)
      // personas = verificateFechaInicio(personas)

      empresas = verificateOrdenCompra(empresas)

      console.log(empresas.length+"/"+personas.length)

      const lastGi = await db.collection("gi").find({}).sort({"codigo": -1}).limit(1).toArray();

      let arrayGIs = createJsonGIs(empresas, personas)

      arrayGIs = addCodeGI(arrayGIs, lastGi[0], YEAR)

      const result = await db.collection("gi").insertMany(arrayGIs)
  
      res.json({
        message: "Ha finalizado la inserción masiva",
        isOK: true,
        renegados: []
      })
    }
    else{
        res.json({
            message: "EL archivo ingresado no es un archivo excel válido"
        })
    }
  } catch (err) {
    res.json({
      message: "Algo ha salido mal",
      isOK: false,
      error: err
    })
  }
});

//INSERT
router.post("/", async (req, res) => {
  const db = await connect();
  const newGi = req.body;
  const items = await db.collection("gi").find({}).toArray();
  if (items.length > 0) {
    newGi.codigo = `ASIS-GI-${YEAR}-${calculate(items[items.length - 1])}`;
  } else {
    newGi.codigo = `ASIS-GI-${YEAR}-00001`;
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

export default router;

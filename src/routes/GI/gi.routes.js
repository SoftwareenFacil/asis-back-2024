import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import excelToJson from "../../functions/insertManyGis/excelToJson";
import getEmpresasGI from "../../functions/insertManyGis/getEmpresasGI";
import getPersonasGI from "../../functions/insertManyGis/getPersonasGI";
import eliminateDuplicated from "../../functions/insertManyGis/eliminateDuplicated";
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
  // console.log('verificador', verificador)
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
//TEST PARA RECIBIR FILES
router.post("/test/file", multer.single("archivo"), async (req, res) => {
  const { nombre } = req.body;
  const data = excelToJson(req.file.path)
  if(data.length > 0){
    // console.log(data)
    let empresas = await getEmpresasGI(data)
    let personas = await getPersonasGI(data)

    empresas = eliminateDuplicated(empresas, "Rut")
    personas = eliminateDuplicated(personas, "Rut")

    // res.json({
    //   empresas: empresas,
    //   personas: personas
    // })
  }
  else{
      res.json({
          message: "EL archivo ingresado no es un archivo excel válido"
      })
  }
//   res.json({
//     message: "archivo subido satisfactoriamente",
//   });
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
  /* console.log(newGi) */
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

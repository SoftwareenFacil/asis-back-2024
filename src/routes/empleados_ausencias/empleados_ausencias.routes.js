import { Router, json } from "express";
import multer from "../../libs/multer";
import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR, SUCCESSFULL_INSERT, SUCCESSFULL_UPDATE } from "../../constant/text_messages";
import { uploadFileToS3 } from "../../libs/aws";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, OTHER_NAME_PDF } from "../../constant/var";
import { v4 as uuid } from "uuid";

const router = Router();
var path = require("path");
var AWS = require('aws-sdk');
var fs = require("fs");

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import calculateDesgloseEmpleados from "../../functions/calculateDesgloseEmpleados";

//SHOW AUSENCIAS POR EMPLEADO
router.post("/show/:id", async (req, res) => {
  const { id } = req.params;
  const { pageNumber } = req.body;
  const nPerPage = 10;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const countAusencias = await db
      .collection("empleados_ausencias")
      .find()
      .count();
    const result = await db
      .collection("empleados_ausencias")
      .find({ id_empleado: id })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countAusencias,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countAusencias / nPerPage + 1),
      ausencias: result,
    });
  } catch (error) {
    res.status(501).json(error);
  } finally {
    conn.close()
  }
});

//SHOW AUSENCIAS POR EMPLEADO, AÑO Y MES
router.post("/show/:id/:mes/:anio", async (req, res) => {
  const { id, mes, anio } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const result = await db
      .collection("empleados_ausencias")
      .find({
        id_empleado: id,
        mes_ausencia: mes,
        anio_ausencia: anio,
      })
      .toArray();

    conn.close();
    return res.status(200).json({ err: null, msg: '', res: result });
  } catch (error) {
    conn.close();
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

//INSERT AUSENCIA BY EMPLEADO
router.post("/", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const data = JSON.parse(req.body.data);
  let r = null;

  try {
    console.log(data)

    const empleado = await db.collection("gi").findOne({ _id: ObjectID(data.id_empleado) });

    if (!empleado) return res.status(200).json({ err: 98, msg: 'Empleado no existe en el sistema', res: null });

    let archivo;

    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;
      archivo = `AUSENCIA_${empleado.razon_social}_${uuid()}`;

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

    const { _id, ...restOfData } = data;

    await db.collection("empleados_ausencias").insertOne({ ...restOfData, archivo_adjunto: archivo });

    const result = await db.collection("gi").updateOne(
      { _id: ObjectID(data.id_empleado) },
      {
        $set: {
          detalle_empleado: calculateDesgloseEmpleados(
            empleado.detalle_empleado,
            data.abrev_ausencia,
            data.cantidad_dias,
            empleado.dias_vacaciones,
            "inc"
          ),
        },
      }
    );

    console.log(calculateDesgloseEmpleados(
      empleado.detalle_empleado,
      data.abrev_ausencia,
      data.cantidad_dias,
      empleado.dias_vacaciones,
      "inc"
    ))
    conn.close();
    return res.status(200).json({ err: null, msg: 'Ausencia creada satisfactoriamente', res: result });

  } catch (error) {
    conn.close();
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }
});

//UPDATE AUSENCIA
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const data = JSON.parse(req.body.data);
  let r = null;

  if (req.file) {
    data.archivo_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  };

  const resultEdit = await db
    .collection("empleados_ausencias")
    .findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: data,
      }
    );

  if (resultEdit.value) {
    const empleado = await db
      .collection("empleados")
      .findOne({ _id: ObjectID(data.id_empleado) });

    if (empleado) {
      //primero se resta el antiguo
      let obj = calculateDesgloseEmpleados(
        empleado.detalle_empleado,
        resultEdit.value.abrev_ausencia,
        resultEdit.value.cantidad_dias,
        empleado.dias_vacaciones,
        "dec"
      );
      //luego se suma el nuevo dato
      const result = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $set: {
            detalle_empleado: calculateDesgloseEmpleados(
              obj,
              data.abrev_ausencia,
              data.cantidad_dias,
              empleado.dias_vacaciones,
              "inc"
            ),
          },
        }
      );
      conn.close();
      res.json(result);
    } else {
      conn.close();
      res.status(500).json({ msg: "No se ha encontrado el empleado" });
    }
  }
});

//DELETE AUSENCIA
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const data = JSON.parse(req.query.data);
  let r = null;

  await db.collection("empleados_ausencias").deleteOne({ _id: ObjectID(id) });

  const empleado = await db
    .collection("empleados")
    .findOne({ _id: ObjectID(data.id_empleado) });

  if (empleado) {
    const result = await db.collection("empleados").updateOne(
      { _id: ObjectID(data.id_empleado) },
      {
        $set: {
          detalle_empleado: calculateDesgloseEmpleados(
            empleado.detalle_empleado,
            data.abrev_ausencia,
            data.cantidad_dias,
            empleado.dias_vacaciones,
            "dec"
          ),
        },
      }
    );
    conn.close();
    res.json(result);
  } else {
    conn.close();
    res.status(500).json({ msg: "No se ha encontrado el empleado" });
  }
});

export default router;

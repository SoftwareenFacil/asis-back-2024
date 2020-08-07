import { Router, json } from "express";
import multer from "../../libs/multer";

const router = Router();

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
  const db = await connect();

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
  }
});

//SHOW AUSENCIAS POR EMPLEADO, AÑO Y MES
router.post("/show/:id/:mes/:anio", async (req, res) => {
  const { id, mes, anio } = req.params;
  const db = await connect();

  const result = await db
    .collection("empleados_ausencias")
    .find({
      id_empleado: id,
      mes_ausencia: mes,
      anio_ausencia: anio,
    })
    .toArray();

  res.json(result);
});

//INSERT AUSENCIA BY EMPLEADO
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const data = JSON.parse(req.body.data);
  let r = null;

  if (req.file) {
    data.archivo_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  } else {
    data.archivo_adjunto = {};
  }

  await db.collection("empleados_ausencias").insertOne(data);

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
            "inc"
          ),
        },
      }
    );
    res.json(result);
  } else {
    res.status(500).json({ msg: "No se ha encontrado el empleado" });
  }
});

//UPDATE AUSENCIA
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const data = req.body;
  let r = null;

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

      res.json(result);
    } else {
      res.status(500).json({ msg: "No se ha encontrado el empleado" });
    }
  }
});

//DELETE AUSENCIA
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
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
    res.json(result);
  } else {
    res.status(500).json({ msg: "No se ha encontrado el empleado" });
  }
});

export default router;

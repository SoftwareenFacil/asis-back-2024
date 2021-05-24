import e, { Router } from "express";
import calculateVacationByDay from "../../functions/calculateDaysVacation";
import calculateDesgloseEmpleados from "../../functions/calculateDesgloseEmpleados";
import { ERROR } from "../../constant/text_messages";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "../../constant/var";

const router = Router();
var path = require("path");
var AWS = require('aws-sdk');
var fs = require("fs");


//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db
    .collection("gi")
    .find({ activo_inactivo: true, grupo_interes: 'Empleados' })
    .toArray();
  return res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countEmpleados = await db
    //   .collection("gi")
    //   .find({ ...isRolEmpleados(dataToken.rol, dataToken.rut, ""), grupo_interes: 'Empleados' }).count();
    // const result = await db
    //   .collection("gi")
    //   .find({ ...isRolEmpleados(dataToken.rol, dataToken.rut, ""), grupo_interes: 'Empleados' })
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .toArray();

    const countEmpleados = await db
      .collection("gi")
      .find({ grupo_interes: 'Empleados', activo_inactivo: true }).count();
    const result = await db
      .collection("gi")
      .find({ grupo_interes: 'Empleados', activo_inactivo: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      // auth: AUTHORIZED,
      total_items: countEmpleados,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEmpleados / nPerPage + 1),
      empleados: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      empleados: null,
      err: String(error)
    });
  }
});

//BUSCAR POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const db = await connect();
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // let rutFiltrado;

  // if (identificador === 1 && filtro.includes("k")) {
  //   rutFiltrado = filtro;
  //   rutFiltrado.replace("k", "K");
  // } else {
  //   rutFiltrado = filtro;
  // }

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countEmpleados;

  try {
    // if (dataToken.rol === 'Empleados') {
    //   if (identificador === 1) {
    //     countEmpleados = await db
    //       .collection("empleados")
    //       .find({ rut: rexExpresionFiltro, rut: dataToken.rut })
    //       .count();

    //     result = await db
    //       .collection("empleados")
    //       .find({ rut: rexExpresionFiltro, rut: dataToken.rut })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countEmpleados = await db
    //       .collection("empleados")
    //       .find({ nombre: rexExpresionFiltro, rut: dataToken.rut })
    //       .count();
    //     result = await db
    //       .collection("empleados")
    //       .find({ nombre: rexExpresionFiltro, rut: dataToken.rut })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }
    // else {
    //   if (identificador === 1) {
    //     countEmpleados = await db
    //       .collection("empleados")
    //       .find({ rut: rexExpresionFiltro })
    //       .count();

    //     result = await db
    //       .collection("empleados")
    //       .find({ rut: rexExpresionFiltro })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   } else {
    //     countEmpleados = await db
    //       .collection("empleados")
    //       .find({ nombre: rexExpresionFiltro })
    //       .count();
    //     result = await db
    //       .collection("empleados")
    //       .find({ nombre: rexExpresionFiltro })
    //       .skip(skip_page)
    //       .limit(nPerPage)
    //       .toArray();
    //   }
    // }

    countEmpleados = await db
      .collection("gi")
      .find({ [headFilter]: rexExpresionFiltro, grupo_interes: 'Empleados', activo_inactivo: true })
      .count();
    result = await db
      .collection("gi")
      .find({ [headFilter]: rexExpresionFiltro, grupo_interes: 'Empleados', activo_inactivo: true })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countEmpleados,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEmpleados / nPerPage + 1),
      empleados: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      empleados: null,
      err: String(error)
    });
  }
});

//GET FILE FROM AWS S3
router.get('/downloadfile/:filestring/', async (req, res) => {
  const { filestring } = req.params;

  try {

    const pathPdf = filestring || '';

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
    return res.status(500).json({ err: String(error), msg: 'Error al obtener archivo', res: null });
  }
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db
    .collection("gi")
    .findOne({ _id: ObjectID(id) });

  return res.json(result);
});

//EDITAR EMPLEADO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const data = req.body;
  let diasVacaciones = 0;

  // if (req.file) {
  //   data.archivo_adjunto = {
  //     name: req.file.originalname,
  //     size: req.file.size,
  //     path: req.file.path,
  //     type: req.file.mimetype,
  //   };
  // }

  console.log([data.fecha_inicio_contrato, data.fecha_fin_contrato])

  if (!!data.fecha_inicio_contrato) {
    if (!!data.fecha_fin_contrato) {
      diasVacaciones = calculateVacationByDay(
        data.fecha_inicio_contrato,
        data.fecha_fin_contrato
      );
    } else {
      diasVacaciones = calculateVacationByDay(
        data.fecha_inicio_contrato,
        new Date()
      );
    }
  }

  const empleado = await db
    .collection("gi")
    .findOne({ _id: ObjectID(id) });

  console.log(diasVacaciones)

  if (empleado) {
    const result = await db.collection("gi").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          ...empleado,
          // cargo: data.cargo,
          tipo_contrato: data.tipo_contrato,
          estado_contrato: data.estado_contrato,
          fecha_inicio_contrato: data.fecha_inicio_contrato,
          fecha_fin_contrato: data.fecha_fin_contrato,
          sueldo_bruto: data.sueldo_bruto,
          afp: data.afp,
          isapre: data.isapre,
          seguridad_laboral: data.seguridad_laboral,
          dias_vacaciones: diasVacaciones,
          comentarios: data.comentarios,
          detalle_empleado: calculateDesgloseEmpleados(
            empleado.detalle_empleado,
            "none",
            0,
            diasVacaciones,
            "none",
            diasVacaciones
          ),
        },
      }
    );
    return res.status(200).json({ err: null, msg: 'Empleado editado correctamente', res: result });
  } else {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

//test para pasar los empleados desde gi a la coleccion empleados
router.get("/traspaso/test", async (req, res) => {
  const db = await connect();
  let newArray = [];
  let result;
  result = await db
    .collection("gi")
    .find({ grupo_interes: "Empleados" })
    .toArray();
  if (result) {
    console.log(result.length);
    result.forEach((element) => {
      let obj = {};
      obj.nombre = element.razon_social;
      obj.rut = element.rut;
      obj.categoria = element.categoria;
      obj.cargo = element.cargo;
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

      newArray.push(obj);
      obj = {};
    });

    const r = await db.collection("empleados").insertMany(newArray);

    return res.json(r);
  } else {
    return res.json({
      cant: result.length,
      data: result,
    });
  }
});

//DELETE EMPLEADOS
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  console.log(id)

  try {
    const result = await db.collection("gi").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          activo_inactivo: false,
        },
      }
    );

    return res.status(200).json({ err: null, msg: 'Empleado eliminado correctamente', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

export default router;

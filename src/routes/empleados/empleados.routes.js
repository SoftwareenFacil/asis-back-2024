import e, { Router } from "express";
import calculateVacationByDay from "../../functions/calculateDaysVacation";
import calculateDesgloseEmpleados from "../../functions/calculateDesgloseEmpleados";
import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR, SUCCESSFULL_INSERT, SUCCESSFULL_UPDATE } from "../../constant/text_messages";
import { isRolEmpleados } from "../../functions/isRol";

import multer from "../../libs/multer";

import { verifyToken } from "../../libs/jwt";

const router = Router();

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
  res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const countEmpleados = await db
      .collection("gi")
      .find({...isRolEmpleados(dataToken.rol, dataToken.rut, ""), grupo_interes: 'Empleados'}).count();
    const result = await db
      .collection("gi")
      .find({...isRolEmpleados(dataToken.rol, dataToken.rut, ""), grupo_interes: 'Empleados'})
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      auth: AUTHORIZED,
      total_items: countEmpleados,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEmpleados / nPerPage + 1),
      empleados: result,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: ERROR, error });
  }
});

//BUSCAR POR NOMBRE O RUT
router.post("/buscar", async (req, res) => {
  const db = await connect();
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let rutFiltrado;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado = filtro;
    rutFiltrado.replace("k", "K");
  } else {
    rutFiltrado = filtro;
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countEmpleados;

  try {
    if(dataToken.rol === 'Empleados'){
      if (identificador === 1) {
        countEmpleados = await db
          .collection("empleados")
          .find({ rut: rexExpresionFiltro, rut: dataToken.rut })
          .count();
  
        result = await db
          .collection("empleados")
          .find({ rut: rexExpresionFiltro, rut: dataToken.rut })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      } else {
        countEmpleados = await db
          .collection("empleados")
          .find({ nombre: rexExpresionFiltro, rut: dataToken.rut })
          .count();
        result = await db
          .collection("empleados")
          .find({ nombre: rexExpresionFiltro, rut: dataToken.rut })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
    }
    else{
      if (identificador === 1) {
        countEmpleados = await db
          .collection("empleados")
          .find({ rut: rexExpresionFiltro })
          .count();
  
        result = await db
          .collection("empleados")
          .find({ rut: rexExpresionFiltro })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      } else {
        countEmpleados = await db
          .collection("empleados")
          .find({ nombre: rexExpresionFiltro })
          .count();
        result = await db
          .collection("empleados")
          .find({ nombre: rexExpresionFiltro })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
    }

    res.json({
      total_items: countEmpleados,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countEmpleados / nPerPage + 1),
      empleados: result,
    });
  } catch (error) {
    res.status(500).json({ mgs: ERROR, error });
  }
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db
    .collection("gi")
    .findOne({ _id: ObjectID(id) });

  res.json(result);
});

//EDITAR EMPLEADO
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const data = JSON.parse(req.body.data);
  let diasVacaciones = 0;

  if (req.file) {
    data.archivo_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  if (data.fecha_inicio_contrato) {
    if (
      data.fecha_fin_contrato != null &&
      data.fecha_fin_contrato != "" &&
      data.fecha_fin_contrato != undefined
    ) {
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

  if (empleado) {
    const result = await db.collection("gi").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          ...empleado,
          cargo: data.cargo,
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
          archivo_adjunto: data.archivo_adjunto
        },
      }
    );
    res.status(200).json(result);
  } else {
    console.log(error)
    res.status(500).json({ msg: "No se ha encontrado el empleado" });
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

    res.json(r);
  } else {
    res.json({
      cant: result.length,
      data: result,
    });
  }
});

//DELETE EMPLEADOS
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db.collection("gi").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        activo_inactivo: false,
      },
    }
  );

  res.json(result);
});

export default router;

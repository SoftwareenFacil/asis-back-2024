import e, { Router } from "express";
import calculateVacationByDay from "../../functions/calculateDaysVacation";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("empleados").find({}).toArray();
  res.json(result);
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db
    .collection("empleados")
    .findOne({ _id: ObjectID(id) });

  res.json(result);
});

//EDITAR EMPLEADO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const data = req.body;
  let diasVacaciones = 0;

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

  console.log(diasVacaciones);

  const result = await db.collection("empleados").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
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
      },
      $inc:{
        "detalle_empleado.dias_acumulados": diasVacaciones
      }
    }
  );

  res.json(result);
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
      obj.detalle_empleado = {
        dias_acum_anios: 0,
        dias_recuperados: 0,
        dias_pendientes: 0,
        dias_tomados_anio: 0,
        dias_tomados_mes: 0,
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

export default router;

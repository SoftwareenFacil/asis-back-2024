import { Router } from "express";

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
router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const result = await db
    .collection("empleados")
    .findOne({ _id: ObjectID(id) });

  res.json(result);
});

//test para pasar los empleados desde gi a la coleccion empleados
router.get("/test", async (req, res) => {
  const db = await connect();
  let newArray = [];
  let result;
  result = await db
    .collection("gi")
    .find({ grupo_interes: "Empleados" })
    .toArray();
  if (result) {
    console.log(result.length);
    let obj = {};
    result.forEach((element) => {
      obj.nombre = element.razon_social;
      obj.rut = element.rut;
      obj.categoria = element.categoria;
      obj.cargo = "";
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
      obj.adjuntos = {};
      obj.dias_anio = 0;
      obj.dias_acum_anios = 0;
      obj.dias_tomados_mes = 0;
      obj.dias_tomados_anio = 0;
      obj.dias_pendientes = 0;
      obj.enfermedad_cant = 0;
      obj.vacaciones_cant = 0;
      obj.maternidad_cant = 0;
      obj.tramites_cant = 0;
      obj.mediodia_cant = 0;
      obj.razon_salida = [];

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

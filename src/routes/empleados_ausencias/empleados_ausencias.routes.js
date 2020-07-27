import { Router } from "express";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SHOW AUSENCIAS POR EMPLEADO
router.post("/show/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db
    .collection("empleados_ausencias")
    .find({ id_empleado: id })
    .toArray();

  res.json(result);
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
router.post("/", async (req, res) => {
  const db = await connect();
  const data = req.body;
  let r = null;

  const result = await db.collection("empleados_ausencias").insertOne(data);

  console.log('data', data)

  switch (data.abrev_ausencia) {
    case "E":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.enfermedad_cant": data.cantidad_dias,
          },
        }
      );
      break;
    case "V":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.vacaciones_cant": data.cantidad_dias,
          },
        }
      );
      break;
    case "M":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.maternidad_cant": data.cantidad_dias,
          },
        }
      );
      break;
    case "T":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.tramites_cant": data.cantidad_dias,
          },
        }
      );
      break;
    case "MD":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.mediodia_cant": data.cantidad_dias,
          },
        }
      );
      break;
    default:
      break;
  }

  res.json(result);
});

//UPDATE AUSENCIA
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const data = req.body;
  let r = null;

  const result = await db.collection("empleados_ausencias").findOneAndUpdate(
    { _id: ObjectID(id) },
    {
      $set: data,
    }
  );

  if (result.value) {
      //primero se resta el antiguo
    switch (result.value.abrev_ausencia) {
      case "E":
        r = await db.collection("empleados").updateOne(
          { _id: ObjectID(data.id_empleado) },
          {
            $inc: {
              "detalle_empleado.enfermedad_cant": -data.cantidad_dias,
            },
          }
        );
        break;
      case "V":
        r = await db.collection("empleados").updateOne(
          { _id: ObjectID(data.id_empleado) },
          {
            $inc: {
              "detalle_empleado.vacaciones_cant": -data.cantidad_dias,
            },
          }
        );
        break;
      case "M":
        r = await db.collection("empleados").updateOne(
          { _id: ObjectID(data.id_empleado) },
          {
            $inc: {
              "detalle_empleado.maternidad_cant": -data.cantidad_dias,
            },
          }
        );
        break;
      case "T":
        r = await db.collection("empleados").updateOne(
          { _id: ObjectID(data.id_empleado) },
          {
            $inc: {
              "detalle_empleado.tramites_cant": -data.cantidad_dias,
            },
          }
        );
        break;
      case "MD":
        r = await db.collection("empleados").updateOne(
          { _id: ObjectID(data.id_empleado) },
          {
            $inc: {
              "detalle_empleado.mediodia_cant": -data.cantidad_dias,
            },
          }
        );
        break;
      default:
        break;
    };

    //y luego se suma el nuevo
    switch (data.abrev_ausencia) {
        case "E":
          r = await db.collection("empleados").updateOne(
            { _id: ObjectID(data.id_empleado) },
            {
              $inc: {
                "detalle_empleado.enfermedad_cant": result.value.cantidad_dias,
              },
            }
          );
          break;
        case "V":
          r = await db.collection("empleados").updateOne(
            { _id: ObjectID(data.id_empleado) },
            {
              $inc: {
                "detalle_empleado.vacaciones_cant": result.value.cantidad_dias,
              },
            }
          );
          break;
        case "M":
          r = await db.collection("empleados").updateOne(
            { _id: ObjectID(data.id_empleado) },
            {
              $inc: {
                "detalle_empleado.maternidad_cant": result.value.cantidad_dias,
              },
            }
          );
          break;
        case "T":
          r = await db.collection("empleados").updateOne(
            { _id: ObjectID(data.id_empleado) },
            {
              $inc: {
                "detalle_empleado.tramites_cant": result.value.cantidad_dias,
              },
            }
          );
          break;
        case "MD":
          r = await db.collection("empleados").updateOne(
            { _id: ObjectID(data.id_empleado) },
            {
              $inc: {
                "detalle_empleado.mediodia_cant": result.value.cantidad_dias,
              },
            }
          );
          break;
        default:
          break;
      };
  }

  res.json(result);
});

//DELETE AUSENCIA
router.delete("/:id", async (req, res) => {
  const { id, data } = req.params;
  const db = await connect();
  // const data = req.body;

  const result = await db
    .collection("empleados_ausencias")
    .deleteOne({ _id: ObjectID(id) });

  switch (data.abrev_ausencia) {
    case "E":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.enfermedad_cant": -data.cantidad_dias,
          },
        }
      );
      break;
    case "V":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.vacaciones_cant": -data.cantidad_dias,
          },
        }
      );
      break;
    case "M":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.maternidad_cant": -data.cantidad_dias,
          },
        }
      );
      break;
    case "T":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.tramites_cant": -data.cantidad_dias,
          },
        }
      );
      break;
    case "MD":
      r = await db.collection("empleados").updateOne(
        { _id: ObjectID(data.id_empleado) },
        {
          $inc: {
            "detalle_empleado.mediodia_cant": -data.cantidad_dias,
          },
        }
      );
      break;
    default:
      break;
  }

  res.json(result);
});

export default router;

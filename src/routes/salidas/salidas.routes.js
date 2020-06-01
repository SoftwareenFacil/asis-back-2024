import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import calculateExistencia from "../../functions/calculateExistencia";
import getFinalExistencia from "../../functions/getFinalToExistencia";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("salidas").find({}).toArray();
  res.json(result);
});

//INSERT SALIDA
router.post("/", async (req, res) => {
  const db = await connect();
  let newSalida = {};
  const items = await db.collection("salidas").find({}).toArray();
  let result = "";

  if (items.length > 0) {
    newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-${calculate(
      items[items.length - 1]
    )}`;
  } else {
    newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-00001`;
  }
  newSalida.fecha = req.body.fecha;
  newSalida.tipo_salida = req.body.tipo_salida;
  newSalida.nro_documento = req.body.nro_documento;
  newSalida.usuario = req.body.usuario;
  newSalida.categoria_general = req.body.categoria_general;
  newSalida.subcategoria_uno = req.body.subcategoria_uno;
  newSalida.subcategoria_dos = req.body.subcategoria_dos;
  newSalida.subcategoria_tres = req.body.subcategoria_tres;
  newSalida.codigo_categoria_tres = req.body.codigo_categoria_tres;
  newSalida.descripcion = req.body.descripcion;
  newSalida.motivo_salida = req.body.motivo_salida;
  newSalida.cantidad = req.body.cantidad;
  newSalida.costo_unitario = req.body.costo_unitario;
  newSalida.costo_total = req.body.costo_total;
  newSalida.precio_venta_unitario = req.body.precio_venta_unitario;
  newSalida.ingreso_total = req.body.ingreso_total;

  try {
    result = await db.collection("salidas").insertOne(newSalida);

    if (result) {
      let objInsert = {
        id: result.ops[0]._id.toString(),
        tipo: "salida",
        datos: [
          {
            categoria_general: newSalida.categoria_general,
            subcategoria_uno: newSalida.subcategoria_uno,
            subcategoria_dos: newSalida.subcategoria_dos,
            subcategoria_tres: newSalida.subcategoria_tres,
            codigo_categoria_tres: newSalida.codigo_categoria_tres,
            descripcion: newSalida.descripcion,
            motivo_salida: newSalida.motivo_salida,
            cantidad: newSalida.cantidad,
            costo_unitario: newSalida.costo_unitario,
            costo_total: newSalida.costo_total,
            precio_venta_unitario: newSalida.precio_venta_unitario,
            ingreso_total: newSalida.ingreso_total,
          },
        ],
      };
      result = await db.collection("prexistencia").insertOne(objInsert);

      result = await db.collection("prexistencia").find({}).toArray();

      result = calculateExistencia(result);

      result = getFinalExistencia(result)

      //limpiar existencia a 0 para recargarla con los nuevos datos
      await db.collection("existencia").deleteMany({});
      //insertar cada objeto como document en collection existencia
      result = await db.collection("existencia").insertMany(result);

      res.json(result);
    }
  } catch (error) {
    res.json(error);
  }
});

export default router;

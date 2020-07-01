import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import calculateExistencia from "../../functions/calculateExistencia";
import getFinalExistencia from "../../functions/getFinalToExistencia";
import multer from "../../libs/multer";

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
router.post("/", multer.single('archivo'), async (req, res) => {
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  let newSalida = {};
  let archivo = {};
  const items = await db.collection("salidas").find({}).toArray();
  let result = "";

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  if (items.length > 0) {
    newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-${calculate(
      items[items.length - 1]
    )}`;
  } else {
    newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-00001`;
  }
  newSalida.fecha = datos.fecha;
  newSalida.tipo_salida = datos.tipo_salida;
  newSalida.nro_documento = datos.nro_documento;
  newSalida.usuario = datos.usuario;
  newSalida.categoria_general = datos.categoria_general;
  newSalida.subcategoria_uno = datos.subcategoria_uno;
  newSalida.subcategoria_dos = datos.subcategoria_dos;
  newSalida.subcategoria_tres = datos.subcategoria_tres;
  newSalida.codigo_categoria_tres = datos.codigo_categoria_tres;
  newSalida.descripcion = datos.descripcion;
  newSalida.motivo_salida = datos.motivo_salida;
  newSalida.cantidad = datos.cantidad;
  newSalida.costo_unitario = datos.costo_unitario;
  newSalida.costo_total = datos.costo_total;
  newSalida.precio_venta_unitario = datos.precio_venta_unitario;
  newSalida.ingreso_total = datos.ingreso_total;
  newSalida.archivo_adjunto = archivo;

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

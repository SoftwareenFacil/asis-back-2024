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

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countSalidas = await db.collection("salidas").find().count();
    const result = await db
      .collection("salidas")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countSalidas,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSalidas / nPerPage + 1),
      salidas: result,
    });
  } catch (error) {
    res.status(501).json(error);
  }
});

//BUSCAR POR CATEGORIA GENERAL Y SUBCATEGORIA 1
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

  const rexExpresionFiltro = new RegExp(filtro, "i");

  let result;
  let countSalidas;

  try {
    if (identificador === 1) {
      countSalidas = await db
        .collection("salidas")
        .find({ categoria_general: rexExpresionFiltro })
        .count();

      result = await db
        .collection("salidas")
        .find({ categoria_general: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countSalidas = await db
        .collection("salidas")
        .find({ subcategoria_uno: rexExpresionFiltro })
        .count();
      result = await db
        .collection("salidas")
        .find({ subcategoria_uno: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    res.json({
      total_items: countSalidas,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSalidas / nPerPage + 1),
      salidas: result,
    });
  } catch (error) {
    res.status(501).json({ mgs: `ha ocurrido un error ${error}` });
  }
});

//INSERT SALIDA
router.post("/", async (req, res) => {
  const db = await connect();
  const datos = req.body;
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

      result = getFinalExistencia(result);

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

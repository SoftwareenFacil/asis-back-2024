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
import { ERROR } from "../../constant/text_messages";

// SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const result = await db.collection("salidas").find({}).toArray();
  conn.close();
  return res.json(result);
});

//SELECT ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  const result = await db.collection("salidas").findOne({ _id: ObjectID(id) });
  conn.close();
  return res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
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

    return res.json({
      total_items: countSalidas,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSalidas / nPerPage + 1),
      salidas: result,
    });
  } catch (error) {
    return res.status(501).json(error);
  }finally {
    conn.close()
  }
});

//BUSCAR POR CATEGORIA GENERAL Y SUBCATEGORIA 1
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  // const rexExpresionFiltro = new RegExp(filtro, "i");

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countSalidas;

  try {
    // if (identificador === 1) {
    //   countSalidas = await db
    //     .collection("salidas")
    //     .find({ categoria_general: rexExpresionFiltro })
    //     .count();

    //   result = await db
    //     .collection("salidas")
    //     .find({ categoria_general: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // } else {
    //   countSalidas = await db
    //     .collection("salidas")
    //     .find({ subcategoria_uno: rexExpresionFiltro })
    //     .count();
    //   result = await db
    //     .collection("salidas")
    //     .find({ subcategoria_uno: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    countSalidas = await db
      .collection("salidas")
      .find({ [headFilter]: rexExpresionFiltro })
      .count();
    result = await db
      .collection("salidas")
      .find({ [headFilter]: rexExpresionFiltro })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countSalidas,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSalidas / nPerPage + 1),
      salidas: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      salidas: null,
      err: String(error)
    });
  }finally {
    conn.close()
  }
});

//INSERT SALIDA
router.post("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
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
    }
    return res.status(200).json({ err: null, msg: 'Salida ingresada correctamente', res: [] })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

//EDIT
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const datos = req.body;
  // const datos = JSON.parse(req.body.data);

  // if (req.file) {
  //   datos.archivo = {
  //     name: req.file.originalname,
  //     size: req.file.size,
  //     path: req.file.path,
  //     type: req.file.mimetype,
  //   };
  // }

  try {
    let result = await db.collection("salidas").findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha: datos.fecha,
          tipo_salida: datos.tipo_salida,
          nro_documento: datos.nro_documento,
          usuario: datos.usuario,
          categoria_general: datos.categoria_general,
          subcategoria_uno: datos.subcategoria_uno,
          subcategoria_dos: datos.subcategoria_dos,
          subcategoria_tres: datos.subcategoria_tres,
          codigo_categoria_tres: datos.codigo_categoria_tres,
          descripcion: datos.descripcion,
          motivo_salida: datos.motivo_salida,
          cantidad: datos.cantidad,
          costo_unitario: datos.costo_unitario,
          costo_total: datos.costo_total,
          precio_venta_unitario: datos.precio_venta_unitario,
          ingreso_total: datos.ingreso_total,
          // archivo_adjunto: datos.archivo,
        },
      },
      { returnOriginal: false }
    );

    result = await db.collection("prexistencia").updateOne(
      { id: id },
      {
        $set: {
          datos: [
            {
              fecha: result.value.fecha,
              tipo_salida: result.value.tipo_salida,
              nro_documento: result.value.nro_documento,
              usuario: result.value.usuario,
              categoria_general: result.value.categoria_general,
              subcategoria_uno: result.value.subcategoria_uno,
              subcategoria_dos: result.value.subcategoria_dos,
              subcategoria_tres: result.value.subcategoria_tres,
              codigo_categoria_tres: result.value.codigo_categoria_tres,
              descripcion: result.value.descripcion,
              motivo_salida: result.value.motivo_salida,
              cantidad: result.value.cantidad,
              costo_unitario: result.value.costo_unitario,
              costo_total: result.value.costo_total,
              precio_venta_unitario: result.value.precio_venta_unitario,
              ingreso_total: result.value.ingreso_total,
            },
          ],
        },
      }
    );

    result = await db.collection("prexistencia").find({}).toArray();

    console.log("resultado", result);
    result = calculateExistencia(result);

    result = getFinalExistencia(result);

    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    return res.status(200).json({ err: null, msg: 'Salida editada correctamente', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    let result = await db
      .collection("salidas")
      .deleteOne({ _id: ObjectID(id) });

    result = await db.collection("prexistencia").deleteOne({ id: id });

    result = await db.collection("prexistencia").find({}).toArray();

    result = calculateExistencia(result);

    result = getFinalExistencia(result);

    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    return res.status(200).json({ err: null, msg: 'Salida eliminada correctamente', res: result });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }finally {
    conn.close()
  }
});

export default router;

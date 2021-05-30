import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

// SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const result = await db.collection("existencia").find({}).toArray();
  conn.close();
  return res.json(result);
});

//SELECT ONE
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  const result = await db.collection('existencia').findOne({ _id: ObjectID(id) });
  conn.close();
  return res.json(result);
})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countExistencia = await db.collection("existencia").find().count();
    const result = await db
      .collection("existencia")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countExistencia,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countExistencia / nPerPage + 1),
      existencias: result,
    });
  } catch (error) {
    return res.status(501).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      existencias: null,
      err: String(err)
    });
  }finally {
    conn.close()
  }
});

//BUSCAR
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const conn = await connect();
  const db = conn.db('asis-db');

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countExis;

  try {
    // if (identificador === 1) {
    //   countExis = await db
    //     .collection("existencia")
    //     .find({ categoria_general: rexExpresionFiltro })
    //     .count();

    //   result = await db
    //     .collection("existencia")
    //     .find({ categoria_general: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // } else {
    //   countExis = await db
    //     .collection("existencia")
    //     .find({ subcategoria_uno: rexExpresionFiltro })
    //     .count();
    //   result = await db
    //     .collection("existencia")
    //     .find({ subcategoria_uno: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    countExis = await db
      .collection("existencia")
      .find({ [headFilter]: rexExpresionFiltro })
      .count();
    result = await db
      .collection("existencia")
      .find({ [headFilter]: rexExpresionFiltro })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countExis,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countExis / nPerPage + 1),
      existencias: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      existencias: null,
      err: String(error)
    });
  }finally {
    conn.close()
  }
});

//CONSULTAR POR ENTRADAS PARA INSERCION DE SALIDAS
router.post("/consultar", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { code, indicador, cant } = req.body;
  let cupos_disponibles = 0;

  const result = await db
    .collection("existencia")
    .findOne({ codigo_categoria_tres: code });
  conn.close();
  if (result == null) {
    return res.json({
      message:
        "La Subcategoria 3 consultada no existe en la existencia del sistema",
      isOK: false,
    });
  } else {

    if (indicador === 2) {
      cupos_disponibles = result.existencia + cant;
    }
    else {
      cupos_disponibles = result.existencia;
    }

    return res.json({
      isOK: true,
      cupos_disponibles: cupos_disponibles,
      costo_unitario_promedio: result.costo_unitario_promedio,
    });
  }
});

export default router;

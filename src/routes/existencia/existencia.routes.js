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
  const db = await connect();
  const result = await db.collection("existencia").find({}).toArray();
  res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
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

    res.json({
      total_items: countExistencia,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countExistencia / nPerPage + 1),
      existencias: result,
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
  let countExis;

  try {
    if (identificador === 1) {
      countExis = await db
        .collection("existencia")
        .find({ categoria_general: rexExpresionFiltro })
        .count();

      result = await db
        .collection("existencia")
        .find({ categoria_general: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countExis = await db
        .collection("existencia")
        .find({ subcategoria_uno: rexExpresionFiltro })
        .count();
      result = await db
        .collection("existencia")
        .find({ subcategoria_uno: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    res.json({
      total_items: countExis,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countExis / nPerPage + 1),
      existencias: result,
    });
  } catch (error) {
    res.status(501).json({ mgs: `ha ocurrido un error ${error}` });
  }
});

//CONSULTAR POR ENTRADAS PARA INSERCION DE SALIDAS
router.post("/consultar", async (req, res) => {
  const db = await connect();
  const { code, indicador, cant } = req.body;
  let cupos_disponibles = 0;

  const result = await db
    .collection("existencia")
    .findOne({ codigo_categoria_tres: code });
  if (result == null) {
    res.json({
      message:
        "La Subcategoria 3 consultada no existe en la existencia del sistema",
      isOK: false,
    });
  } else {

    if(indicador === 2){
      cupos_disponibles = result.existencia - cant;
    }
    else{
      cupos_disponibles = result.existencia;
    }

    res.json({
      isOK: true,
      cupos_disponibles: cupos_disponibles,
      costo_unitario_promedio: result.costo_unitario_promedio,
    });
  }
});

export default router;

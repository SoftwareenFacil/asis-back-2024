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
  const result = await db.collection("gastos").find({}).toArray();
  res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countGastos = await db.collection("gastos").find().count();
    const result = await db
      .collection("gastos")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countGastos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGastos / nPerPage + 1),
      gastos: result,
    });
  } catch (error) {
    res.status(501).json(error);
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

  let rutFiltrado;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado = filtro;
    rutFiltrado.replace("k", "K");
  } else {
    rutFiltrado = filtro;
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countGastos;

  try {
    if (identificador === 1) {
      countGastos = await db
        .collection("gastos")
        .find({ rut_proveedor: rexExpresionFiltro })
        .count();

      result = await db
        .collection("gastos")
        .find({ rut_proveedor: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    } else {
      countGastos = await db
        .collection("gastos")
        .find({ razon_social_proveedor: rexExpresionFiltro })
        .count();
      result = await db
        .collection("gastos")
        .find({ razon_social_proveedor: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    res.json({
      total_items: countGastos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGastos / nPerPage + 1),
      gastos: result,
    });
  } catch (error) {
    res.status(501).json({ mgs: `ha ocurrido un error ${error}` });
  }
});

//INSERT GASTO
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  let newGasto = {};
  let archivo = {};
  const items = await db.collection("gastos").find({}).toArray();

  if (items.length > 0) {
    newGasto.codigo = `ASIS-GTS-${YEAR}-${calculate(items[items.length - 1])}`;
  } else {
    newGasto.codigo = `ASIS-GTS-${YEAR}-00001`;
  }

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  newGasto.fecha = datos.fecha;
  newGasto.fecha_registro = datos.fecha_registro;
  newGasto.categoria_general = datos.categoria_general;
  newGasto.subcategoria_uno = datos.subcategoria_uno;
  newGasto.subcategoria_dos = datos.subcategoria_dos;
  newGasto.descripcion_gasto = datos.descripcion_gasto;
  newGasto.rut_proveedor = datos.rut_proveedor;
  newGasto.categoria_proveedor = datos.categoria;
  newGasto.razon_social_proveedor = datos.razon_social_proveedor;
  newGasto.requiere_servicio = datos.requiere_servicio;
  newGasto.id_servicio = datos.id_servicio;
  newGasto.servicio = datos.servicio;
  newGasto.tipo_registro = datos.tipo_registro;
  newGasto.tipo_documento = datos.tipo_documento;
  newGasto.nro_documento = datos.nro_documento;
  newGasto.medio_pago = datos.medio_pago;
  newGasto.institucion_bancaria = datos.institucion_bancaria;
  newGasto.inventario = datos.inventario;
  newGasto.cantidad_factor = datos.cantidad_factor;
  newGasto.precio_unitario = datos.precio_unitario;
  newGasto.monto_neto = datos.monto_neto;
  newGasto.impuesto = datos.impuesto;
  newGasto.monto_exento = datos.monto_exento;
  newGasto.monto_total = datos.monto_total;
  newGasto.observaciones = datos.observaciones;
  newGasto.archivo_adjunto = archivo;
  newGasto.entradas = [];

  const result = await db.collection("gastos").insertOne(newGasto);

  //luego , si corresponde y existe el empleado
  if (
    (datos.categoria_general === "Mano de Obra Directa" ||
      datos.categoria_general === "Gastos Generales") &&
    (datos.subcategoria_uno === "Personal" ||
      datos.subcategoria_uno === "Gastos Indirectos")
  ) {
    await db.collection("empleados").updateOne(
      { rut: datos.rut_proveedor, categoria: datos.categoria },
      {
        $push: {
          detalle_pagos: {
            codigo: newGasto.codigo,
            fecha: datos.fecha,
            categoria_general: datos.categoria_general,
            subcategoria_uno: datos.subcategoria_uno,
            subcategoria_dos: datos.subcategoria_dos,
            tipo_registro: datos.tipo_registro,
            medio_pago: datos.medio_pago,
            institucion_bancaria: datos.institucion_bancaria,
            monto_total: datos.monto_total,
            archivo_adjunto: archivo,
          },
        },
      }
    );
  }

  res.json(result);
});

//INSERT ENTRADA AND EDIT PREXISTENCIA
router.post("/entrada/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let result = "";

  try {
    result = await db.collection("gastos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          entradas: req.body.entradas,
        },
      }
    );

    result = await db.collection("prexistencia").find({ id: id }).toArray();

    if (result.length > 0) {
      if (req.body.entradas.length > 0) {
        result = await db.collection("prexistencia").updateOne(
          { id: id },
          {
            $set: {
              datos: req.body.entradas,
            },
          }
        );
      } else {
        result = await db.collection("prexistencia").deleteOne({ id: id });
      }
    } else {
      if (req.body.entradas.length > 0) {
        let objInsert = {
          id: id,
          tipo: "entrada",
          datos: req.body.entradas,
        };
        result = await db.collection("prexistencia").insertOne(objInsert);
      }
    }

    result = await db.collection("prexistencia").find({}).toArray();

    result = calculateExistencia(result);

    result = getFinalExistencia(result);
    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

//EDIT ENTRADA AND EDIT PREXISTENCIA
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const entrada = req.body;
  const db = await connect();
  let result = "";

  try {
    const gasto = await db.collection("gastos").findOne({ _id: ObjectID(id) });
    const arrayEntradas = gasto.entradas;
    const entradas = arrayEntradas.map(function (e) {
      if (e.id === entrada.id) {
        e.nombre_proveedor = entrada.nombre_proveedor;
        e.categoria_general = entrada.categoria_general;
        e.subcategoria_uno = entrada.subcategoria_uno;
        e.subcategoria_dos = entrada.subcategoria_dos;
        e.subcategoria_tres = entrada.subcategoria_tres;
        e.codigo_categoria_tres = entrada.codigo_categoria_tres;
        e.cant_maxima_categoria_tres = entrada.cant_maxima_categoria_tres;
        e.detalle = entrada.detalle;
        e.cantidad = entrada.cantidad;
        e.porcentaje_impuesto = entrada.porcentaje_impuesto;
        e.valor_impuesto = entrada.valor_impuesto;
        e.costo_unitario = entrada.costo_unitario;
        e.costo_total = entrada.costo_total;
      }

      return e;
    });

    result = await db.collection("gastos").findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: {
          entradas: entradas,
        },
      }
    );

    result = await db.collection("prexistencia").find({ id: id }).toArray();

    if (result.length > 0) {
      if (entrada.length > 0) {
        result = await db.collection("prexistencia").updateOne(
          { id: id },
          {
            $set: {
              datos: entrada.entradas,
            },
          }
        );
      } else {
        result = await db.collection("prexistencia").deleteOne({ id: id });
      }
    } else {
      if (entrada.length > 0) {
        let objInsert = {
          id: id,
          tipo: "entrada",
          datos: entrada.entradas,
        };
        result = await db.collection("prexistencia").insertOne(objInsert);
      }
    }

    result = await db.collection("prexistencia").find({}).toArray();

    result = calculateExistencia(result);

    result = getFinalExistencia(result);
    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    res.status(201).json(result);
  } catch (error) {
    res.status(501).json({ msg: "Ha ocurrido un error", error });
  }
});

//DELETE ENTRADAS
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const entrada = req.body;
  const db = await connect();
  let result = "";

  //1.- traigo la coleccion
  const coleccionGasto = await db
    .collection("gastos")
    .findOne({ _id: ObjectID(id) });

  let entradas = coleccionGasto.entradas;

  if (coleccionGasto) {
    for (let index = 0; index < entradas.length; index++) {
      const element = entradas[index];
      if (element.id === entrada.id) {
        entradas.splice(index, 1);
      }
    }
  }

  try {
    result = await db.collection("gastos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          entradas: entradas,
        },
      }
    );

    result = await db.collection("prexistencia").find({ id: id }).toArray();

    if (result.length > 0) {
      if (entradas.length > 0) {
        result = await db.collection("prexistencia").updateOne(
          { id: id },
          {
            $set: {
              datos: entradas,
            },
          }
        );
      } else {
        result = await db.collection("prexistencia").deleteOne({ id: id });
      }
    } else {
      if (entradas.length > 0) {
        let objInsert = {
          id: id,
          tipo: "entrada",
          datos: entradas,
        };
        result = await db.collection("prexistencia").insertOne(objInsert);
      }
    };

    result = await db.collection("prexistencia").find({}).toArray();

    result = calculateExistencia(result);

    result = getFinalExistencia(result);
    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;

import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import calculateExistencia from "../../functions/calculateExistencia";
import getFinalExistencia from "../../functions/getFinalToExistencia";
import multer from "../../libs/multer";
import { v4 as uuid } from "uuid";
import { uploadFileToS3 } from "../../libs/aws";

import { ERROR } from "../../constant/text_messages";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, OTHER_NAME_PDF, NOT_EXISTS } from "../../constant/var";

var path = require("path");
var AWS = require('aws-sdk');
var fs = require("fs");

// SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("gastos").find({}).toArray();
  return res.json(result);
});

//SELECT ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  const result = await db.collection("gastos").findOne({ _id: ObjectID(id) });

  return res.json(result);
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

    return res.status(200).json({
      total_items: countGastos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGastos / nPerPage + 1),
      gastos: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      gastos: null,
      err: String(error)
    });
  }
});

//SEARCH BY cateogy, subcategory 1 and subcategiry 2
router.post("/searchbycategory", async (req, res) => {
  const db = await connect();
  const { category, subcategoryone, subcategorytwo } = req.body;

  try {
    const gasto = await db.collection("gastos").findOne({
      categoria_general: category, 
      subcategoria_uno: subcategoryone, 
      subcategoria_dos: subcategorytwo 
    });
    if(!gasto) return res.status(200).json({ err: 98, msg: 'Gasto no encontrado', res: [] });
    console.log(gasto)
    return res.status(200).json({ err: null, msg: 'Gasto gasto encontrado', res: gasto });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  }
});

//GET FILE FROM AWS S3
router.get('/downloadfile/:id/', async (req, res) => {
  const { id } = req.params;
  const db = await connect();

  try {
    const gasto = await db.collection('gastos').findOne({ _id: ObjectID(id), isActive: true });
    if (!gasto) return res.status(500).json({ err: 98, msg: NOT_EXISTS, res: null });

    const pathPdf = gasto.archivo_adjunto;

    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY
    });

    s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: pathPdf }, (error, data) => {
      if (error) {
        return res.status(500).json({ err: String(error), msg: 'error s3 get file', res: null });
      }
      else {
        return res.status(200).json({
          err: null,
          msg: 'Archivo descargado',
          res: data.Body,
          filename: pathPdf
        });
      };
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: 'Error al obtener archivo', res: null });
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();

  // let rutFiltrado;

  // if (identificador === 1 && filtro.includes("k")) {
  //   rutFiltrado = filtro;
  //   rutFiltrado.replace("k", "K");
  // } else {
  //   rutFiltrado = filtro;
  // }

  // const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  }

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countGastos;

  try {
    // if (identificador === 1) {
    //   countGastos = await db
    //     .collection("gastos")
    //     .find({ rut_proveedor: rexExpresionFiltro })
    //     .count();

    //   result = await db
    //     .collection("gastos")
    //     .find({ rut_proveedor: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // } else {
    //   countGastos = await db
    //     .collection("gastos")
    //     .find({ razon_social_proveedor: rexExpresionFiltro })
    //     .count();
    //   result = await db
    //     .collection("gastos")
    //     .find({ razon_social_proveedor: rexExpresionFiltro })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    countGastos = await db
      .collection("gastos")
      .find({ [headFilter]: rexExpresionFiltro })
      .count();
    result = await db
      .collection("gastos")
      .find({ [headFilter]: rexExpresionFiltro })
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    return res.status(200).json({
      total_items: countGastos,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countGastos / nPerPage + 1),
      gastos: result,
    });
  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      gastos: null,
      err: String(error)
    });
  }
});

//INSERT GASTO
router.post("/", multer.single("archivo"), async (req, res) => {
  const db = await connect();
  const datos = JSON.parse(req.body.data);

  try {
    let newGasto = {};
    let archivo = '';
    const items = await db.collection("gastos").find({}).toArray();

    if (items.length > 0) {
      newGasto.codigo = `ASIS-GTS-${YEAR}-${calculate(items[items.length - 1])}`;
    } else {
      newGasto.codigo = `ASIS-GTS-${YEAR}-00001`;
    };

    if (req.file) {
      const nombrePdf = OTHER_NAME_PDF;

      archivo = `GASTO_${newGasto.codigo}_${uuid()}`

      setTimeout(() => {
        const fileContent = fs.readFileSync(`uploads/${nombrePdf}`);

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Body: fileContent,
          Key: archivo,
          ContentType: 'application/pdf'
        };

        uploadFileToS3(params);
      }, 2000);
    };

    newGasto.fecha = datos.fecha;
    newGasto.fecha_registro = datos.fecha_registro;
    newGasto.categoria_general = datos.categoria_general;
    newGasto.subcategoria_uno = datos.subcategoria_uno;
    newGasto.subcategoria_dos = datos.subcategoria_dos;
    newGasto.descripcion_gasto = datos.descripcion_gasto;
    newGasto.id_proveedor = datos.id_proveedor;
    newGasto.rut_proveedor = datos.rut_proveedor;
    newGasto.categoria_proveedor = datos.categoria_proveedor;
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
    newGasto.exento = datos.exento;
    newGasto.total = datos.total;
    newGasto.observaciones = datos.observaciones;
    newGasto.archivo_adjunto = archivo;
    newGasto.entradas = [];

    const result = await db.collection("gastos").insertOne(newGasto);

    console.log(datos)

    //luego , si corresponde y existe el empleado
    if (
      (datos.categoria_general === "Mano de Obra Directa" ||
        datos.categoria_general === "Gastos Generales") &&
      (datos.subcategoria_uno === "Personal" ||
        datos.subcategoria_uno === "Gastos Indirectos")
    ) {
      await db.collection("gi").updateOne(
        { rut: datos.rut_proveedor, grupo_interes: 'Empleados'},
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
              monto_total: datos.total,
              archivo_adjunto: archivo,
            },
          },
        }
      );
    }

    return res.status(200).json({
      err: null,
      msg: 'Gasto ingresado correctamente',
      res: result
    });
  } catch (error) {
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: result
    });
  }
});

//INSERT ENTRADA AND EDIT PREXISTENCIA
router.post("/entrada/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let data = req.body;
  let result = "";

  try {
    result = await db.collection("gastos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          entradas: data
        },
      }
    );

    result = await db.collection("prexistencia").find({ id: id }).toArray();

    if (result.length > 0) {
      if (data.length > 0) {
        result = await db.collection("prexistencia").updateOne(
          { id: id },
          {
            $set: {
              datos: data,
            },
          }
        );
      } else {
        result = await db.collection("prexistencia").deleteOne({ id: id });
      }
    } else {
      if (data.length > 0) {
        let objInsert = {
          id: id,
          tipo: "entrada",
          datos: data,
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

    return res.status(200).json({ err: null, msg: 'Entrada ingresada correctamente', res: result });
  } catch (error) {
    return res.status(5001).json({ err: String(err), msg: ERROR, res: null });
  }
});

//EDIT GASTO
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const gasto = JSON.parse(req.body.data);
  const db = await connect();

  if (req.file) {
    gasto.archivo_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  try {
    const result = await db.collection("gastos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha: gasto.fecha,
          categoria_general: gasto.categoria_general,
          subcategoria_uno: gasto.subcategoria_uno,
          subcategoria_dos: gasto.subcategoria_dos,
          descripcion_gasto: gasto.descripcion_gasto,
          id_proveedor: gasto.id_proveedor,
          rut_proveedor: gasto.rut_proveedor,
          razon_social_proveedor: gasto.razon_social_proveedor,
          requiere_servicio: gasto.requiere_servicio,
          id_servicio: gasto.id_servicio,
          servicio: gasto.servicio,
          tipo_registro: gasto.tipo_registro,
          tipo_documento: gasto.tipo_documento,
          nro_documento: gasto.nro_documento,
          medio_pago: gasto.medio_pago,
          institucion_bancaria: gasto.institucion_bancaria,
          inventario: gasto.inventario,
          cantidad_factor: gasto.cantidad_factor,
          precio_unitario: gasto.precio_unitario,
          monto_neto: gasto.monto_neto,
          impuesto: gasto.impuesto,
          monto_exento: gasto.monto_exento,
          monto_total: gasto.monto_total,
          observaciones: gasto.observaciones,
          archivo_adjunto: gasto.archivo_adjunto,
        },
      }
    );

    return res.status(201).json({ message: "Gasto modificado correctamente", result });
  } catch (error) {
    return res.status(500).json({ message: "ha ocurrido un error", error });
  }
});

//DELETE GASTO
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let result = "";

  try {
    //1.- traigo la coleccion
    const db = await connect();
    // const coleccionGasto = await db
    //   .collection("gastos")
    //   .findOne({ _id: ObjectID(id) });

    // let entradas = coleccionGasto.entradas;


    //2.- elimino el gasto
    result = await db.collection("gastos").deleteOne({ _id: ObjectID(id) });

    //3.- elimino la prexisrtencia
    result = await db.collection("prexistencia").deleteOne({ id: id });

    //4.- se recalcula la existencia
    result = await db.collection("prexistencia").find({}).toArray();
    result = calculateExistencia(result);
    result = getFinalExistencia(result);

    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    return res.json({ err: null, msg: 'Gasto eliminado correctamente', res: result});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  }
});

//DELETE ENTRADAS
router.delete("/entrada/:id", async (req, res) => {
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

    result = await db.collection("prexistencia").findOne({ id: id });

    if (result) {
      let datos = result.datos;

      for (let index = 0; index < datos.length; index++) {
        const element = datos[index];
        if (element.id === entrada.id) {
          datos.splice(index, 1);
        }
      }

      if (datos.length > 0) {
        result = await db.collection("prexistencia").updateOne(
          { id: id },
          {
            $set: {
              datos: datos,
            },
          }
        );
      } else {
        result = await db.collection("prexistencia").deleteOne({ id: id });
      }
    }

    result = await db.collection("prexistencia").find({}).toArray();

    result = calculateExistencia(result);

    result = getFinalExistencia(result);
    //limpiar existencia a 0 para recargarla con los nuevos datos
    await db.collection("existencia").deleteMany({});
    //insertar cada objeto como document en collection existencia
    result = await db.collection("existencia").insertMany(result);

    return res.json(result);
  } catch (error) {
    return res.status(400).json(error);
  }
});

export default router;

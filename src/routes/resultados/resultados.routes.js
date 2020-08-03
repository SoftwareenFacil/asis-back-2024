import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import { getDateEspecific } from "../../functions/getEspecificDate";
import multer from "../../libs/multer";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("resultados").find({}).toArray();
  res.json(result);
});

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  try {
    const countRes = await db.collection("resultados").find().count();
    const result = await db
      .collection("resultados")
      .find()
      .skip(skip_page)
      .limit(nPerPage)
      .toArray();

    res.json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      resultados: result,
    });
  } catch (error) {
    res.status(501).json(error);
  }
});

//BUSCAR POR RUT O NOMBRE
router.post('/buscar', async (req, res) =>{
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
  let countRes;

  try {
    if (identificador === 1) {
      countRes = await db
        .collection("resultados")
        .find({ rut_cp: rexExpresionFiltro })
        .count();
  
      result = await db
        .collection("resultados")
        .find({ rut_cp: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else{
      countRes = await db
        .collection("resultados")
        .find({ razon_social_cp: rexExpresionFiltro })
        .count();
      result = await db
        .collection("resultados")
        .find({ razon_social_cp: rexExpresionFiltro })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }

    res.json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      resultado: result,
    });

  } catch (error) {
    res.status(501).json({mgs: `ha ocurrido un error ${error}`});
  }

})

//SUBIR ARCHIVO RESUILTADO
router.post("/subir/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  let archivo = {};
  let obs = {};
  obs.obs = datos.observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  const result = await db.collection("resultados").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        estado_archivo: "Cargado",
        url_file_adjunto_res: archivo,
      },
      $push: {
        observaciones: obs,
      },
    }
  );

  res.json(result);
});

//confirmar resultado
router.post("/confirmar/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = req.body;
  let result = "";
  let obs = {};
  obs.obs = datos.observaciones;
  obs.fecha = getDate(new Date());

  if (datos.estado_archivo == "Aprobado") {
    obs.estado = datos.estado_archivo;
    if (
      datos.estado_resultado == "Aprobado con Obs" ||
      datos.estado_resultado == "Aprobado"
    ) {
      result = await db.collection("resultados").findOneAndUpdate(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Revisado",
            estado_archivo: datos.estado_archivo,
            estado_resultado: datos.estado_resultado,
            vigencia_examen: datos.vigencia_examen,
            fecha_resultado: datos.fecha_resultado,
            hora_resultado: datos.hora_resultado,
            condicionantes: datos.condicionantes,
            fecha_vencimiento_examen: getDateEspecific(
              getFechaVencExam(datos.fecha_resultado, datos.vigencia_examen)
            ).substr(0, 10),
          },
          $push: {
            observaciones: obs,
          },
        }
      );
    } else {
      result = await db.collection("resultados").findOneAndUpdate(
        { _id: ObjectID(id) },
        {
          $set: {
            estado: "Revisado",
            estado_archivo: datos.estado_archivo,
            estado_resultado: datos.estado_resultado,
            fecha_resultado: datos.fecha_resultado,
            hora_resultado: datos.hora_resultado,
          },
          $push: {
            observaciones: obs,
          },
        }
      );
    }
    //insercion de la facturación
    let codAsis = result.value.codigo;
    let gi = await db
      .collection("gi")
      .findOne({ rut: result.value.rut_cp, categoria: "Empresa/Organizacion" });
    var isOC = "";
    let estado_archivo = "";
    let estado = "";

    if (gi) {
      isOC = gi.orden_compra;
      if (isOC == "Si") {
        (estado_archivo = "Sin Documento"), (estado = "Ingresado");
      } else {
        (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
      }
    } else {
      isOC = "No";
      (estado = "En Facturacion"), (estado_archivo = "Sin Documento");
    }

    if (result) {
      result = await db.collection("facturaciones").insertOne({
        codigo: codAsis.replace("RES", "FAC"),
        nombre_servicio: result.value.nombre_servicio,
        id_GI_personalAsignado: result.value.id_GI_personalAsignado,
        faena_seleccionada_cp: result.value.faena_seleccionada_cp,
        valor_servicio: result.value.valor_servicio,
        rut_cp: result.value.rut_cp,
        razon_social_cp: result.value.razon_social_cp,
        rut_cs: result.value.rut_cs,
        razon_social_cs: result.value.razon_social_cs,
        lugar_servicio: result.value.lugar_servicio,
        sucursal: result.value.sucursal,
        condicionantes: result.value.condicionantes,
        vigencia_examen: result.value.vigencia_examen,
        oc: isOC,
        archivo_oc: null,
        fecha_oc: "",
        hora_oc: "",
        nro_oc: "",
        observacion_oc: [],
        observacion_factura: [],
        estado: estado,
        estado_archivo: estado_archivo,
        fecha_facturacion: "",
        nro_factura: "",
        archivo_factura: null,
        monto_neto: 0,
        porcentaje_impuesto: "",
        valor_impuesto: 0,
        sub_total: 0,
        exento: 0,
        descuento: 0,
        total: 0,
      });
    }
  } else {
    obs.estado = datos.estado_archivo;
    result = await db.collection("resultados").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado_archivo: datos.estado_archivo,
        },
        $push: {
          observaciones: obs,
        },
      }
    );
  }
  res.json(result);
});

export default router;

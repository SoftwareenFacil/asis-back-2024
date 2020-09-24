import { Router } from "express";
// import { calculate } from "../../functions/NewCode";
// import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import { getDateEspecific } from "../../functions/getEspecificDate";
import multer from "../../libs/multer";
import { isRolResultados } from "../../functions/isRol";

import { verifyToken } from "../../libs/jwt";

const router = Router();

import { MESSAGE_UNAUTHORIZED_TOKEN, UNAUTHOTIZED, ERROR_MESSAGE_TOKEN, AUTHORIZED, ERROR, SUCCESSFULL_INSERT, SUCCESSFULL_UPDATE } from "../../constant/text_messages";

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const result = await db.collection("resultados").find(dataToken.rol === 'Clientes' ? { id_GI_Principal: dataToken.id } : {}).toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: ERROR, error })
  }
});

//SELECT ONE 
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const result = await db.collection('resultados').findOne({ _id: ObjectID(id) });

  res.json(result);
})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const db = await connect();
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const countRes = await db.collection("resultados").find(isRolResultados(dataToken.rol, dataToken.rut, dataToken.id)).count();
    const result = await db
      .collection("resultados")
      .find(isRolResultados(dataToken.rol, dataToken.rut, dataToken.id))
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
    res.status(500).json({ msg: ERROR, error });
  }
});

//BUSCAR POR RUT O NOMBRE
router.post('/buscar', async (req, res) => {
  const { identificador, filtro, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const db = await connect();
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

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
    if (dataToken.rol === 'Clientes') {
      if (identificador === 1) {
        countSol = await db
          .collection("solicitudes")
          .find({ rut_cs: rexExpresionFiltro, rut_cp: dataToken.rut })
          .count();

        result = await db
          .collection("solicitudes")
          .find({ rut_cs: rexExpresionFiltro, rut_cp: dataToken.rut })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
      else {
        countSol = await db
          .collection("solicitudes")
          .find({ razon_social_cs: rexExpresionFiltro, rut_cp: dataToken.rut })
          .count();
        result = await db
          .collection("solicitudes")
          .find({ razon_social_cs: rexExpresionFiltro, rut_cp: dataToken.rut })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
    }
    else if(dataToken.rol === 'Colaboradores'){
      if (identificador === 1) {
        countSol = await db
          .collection("solicitudes")
          .find({ rut_cs: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
          .count();

        result = await db
          .collection("solicitudes")
          .find({ id_cs: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
      else {
        countSol = await db
          .collection("solicitudes")
          .find({ razon_social_cs: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
          .count();
        result = await db
          .collection("solicitudes")
          .find({ razon_social_cs: rexExpresionFiltro, id_GI_personalAsignado: dataToken.id })
          .skip(skip_page)
          .limit(nPerPage)
          .toArray();
      }
    }
    else {
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
      else {
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
    };

    res.json({
      total_items: countRes,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countRes / nPerPage + 1),
      resultados: result,
    });

  } catch (error) {
    res.status(501).json({ mgs: ERROR, error });
  }

})

//SUBIR ARCHIVO RESULTADO
router.post("/subir/:id", multer.single("archivo"), async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = JSON.parse(req.body.data);
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let archivo = {};
  // let obs = {};
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());
  // obs.estado = "Cargado";

  const obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date()),
    estado: "Cargado"
  }

  if (req.file) archivo = {
    name: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    type: req.file.mimetype,
  };

  try {
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

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ msg: ERROR, error });
  }

});

//confirmar resultado
router.post("/confirmar/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const datos = req.body;
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores' || dataToken.rol === 'Empleados')
    return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let result = "";
  const obs = {
    obs: datos.observaciones,
    fecha: getDate(new Date())
  };
  // let obs = {};
  // obs.obs = datos.observaciones;
  // obs.fecha = getDate(new Date());

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

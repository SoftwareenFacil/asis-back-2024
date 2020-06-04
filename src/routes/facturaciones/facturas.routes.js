import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getMinusculas } from "../../functions/changeToMiniscula";
import { getDate } from "../../functions/getDateNow";
import { getFechaPago } from "../../functions/calculateFechaPago";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  let result = await db.collection("facturaciones").find({}).toArray();
  let empresa = await db.collection("empresa").findOne({});
  res.json({
    datos: result,
    empresa: empresa,
  });
});

//INSERTAR DATOS DE FACTURACION
router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let obs = {};
  obs.obs = req.body.observacion_factura;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";
  let result = "";

  result = await db.collection("facturaciones").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        fecha_facturacion: req.body.fecha_facturacion,
        estado_archivo: "Cargado",
        nro_factura: req.body.nro_factura,
        archivo_factura: req.body.archivo_factura,
        monto_neto: req.body.monto_neto,
        porcentaje_impuesto: req.body.porcentaje_impuesto,
        valor_impuesto: req.body.valor_impuesto,
        sub_total: req.body.sub_total,
        exento: req.body.exento,
        descuento: req.body.descuento,
        total: req.body.total,
      },
      $push: {
        observacion_factura: obs,
      },
    }
  );

  res.json(result);
});

//INSERTAR FACTURA MASIVO
router.post("/", async (req, res) => {
  const db = await connect();
  let new_array = [];
  let obs = {};

  obs.obs = req.body[0].observacion_factura;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";
  let result = "";

  req.body[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  result = await db.collection("facturaciones").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        fecha_facturacion: req.body[0].fecha_facturacion,
        estado_archivo: "Cargado",
        nro_factura: req.body[0].nro_factura,
        archivo_factura: req.body[0].archivo_factura,
        monto_neto: req.body[0].monto_neto,
        porcentaje_impuesto: req.body[0].porcentaje_impuesto,
        valor_impuesto: req.body[0].valor_impuesto,
        sub_total: req.body[0].sub_total,
        exento: req.body[0].exento,
        descuento: req.body[0].descuento,
        total: req.body[0].total,
      },
      $push: {
        observacion_factura: obs,
      },
    }
  );

  res.json(result);
});

//SUBIR OC
router.post("/subiroc/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let obs = {};
  obs.obs = req.body.observacion_oc;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";
  const result = await db.collection("facturaciones").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        archivo_oc: req.body.archivo_oc,
        fecha_oc: req.body.fecha_oc,
        hora_oc: req.body.hora_oc,
        nro_oc: req.body.nro_oc,
        estado_archivo: "Cargado",
        estado: "En Revisión",
      },
      $push: {
        observacion_oc: obs,
      },
    }
  );

  res.json(result);
});

//SUBIR OC MASIVO
router.post("/oc/subiroc/many", async (req, res) => {
  const db = await connect();
  let new_array = [];

  let obs = {};
  obs.obs = req.body[0].observacion_oc;
  obs.fecha = getDate(new Date());
  obs.estado = "Cargado";

  req.body[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  const result = await db.collection("facturaciones").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        archivo_oc: req.body[0].archivo_oc,
        fecha_oc: req.body[0].fecha_oc,
        hora_oc: req.body[0].hora_oc,
        nro_oc: req.body[0].nro_oc,
        estado_archivo: "Cargado",
        estado: "En Revisión",
      },
      $push: {
        observacion_oc: obs,
      },
    }
  );

  res.json(result);
});

//CONFIRMAR OC
router.post("/confirmaroc/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  let obs = {};
  obs.obs = req.body.observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = req.body.estado_archivo;
  let estado = "";
  req.body.estado_archivo == "Aprobado"
    ? (estado = "En Facturacion")
    : (estado = "Ingresado");

  const result = await db.collection("facturaciones").updateOne(
    { _id: ObjectID(id) },
    {
      $set: {
        estado: estado,
        estado_archivo: req.body.estado_archivo,
      },
      $push: {
        observacion_oc: obs,
      },
    }
  );

  res.json(result);
});

//CONFIRMAR OC MASIVO
router.post("/oc/confirmaroc/many", async (req, res) => {
  const db = await connect();

  let new_array = [];

  let obs = {};
  obs.obs = req.body[0].observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = req.body[0].estado_archivo;

  let estado = "";
  req.body[0].estado_archivo == "Aprobado"
    ? (estado = "En Facturacion")
    : (estado = "Ingresado");

  req.body[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  const result = await db.collection("facturaciones").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        estado: estado,
        estado_archivo: req.body[0].estado_archivo,
      },
      $push: {
        observacion_oc: obs,
      },
    }
  );

  res.json(result);
});

// VALIDAR FACTURA
router.post("/validar/:id", async (req, res) => {
  const { id } = req.params;
  const {
    estado_archivo,
    observaciones,
    nro_nota_credito,
    fecha_nota_credito,
    monto_nota_credito,
    factura_anular,
    archivo_adjunto,
  } = req.body;
  const db = await connect();
  let obs = {};
  obs.obs = observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = estado_archivo;
  let estado = "";
  estado_archivo == "Rechazado"
    ? (estado = "En Facturacion")
    : (estado = "Facturado");

  let result = await db.collection("facturaciones").findOneAndUpdate(
    { _id: ObjectID(id) },
    {
      $set: {
        estado: estado,
        estado_archivo: estado_archivo,
        nro_nota_credito: nro_nota_credito,
        fecha_nota_credito: fecha_nota_credito,
        monto_nota_credito: monto_nota_credito,
        factura_anular: factura_anular,
      },
      $push: {
        observacion_factura: obs,
      },
    }
  );

  if (estado_archivo == "Aprobado") {
    //insertar pago en modulo pago
    let codAsis = result.value.codigo;
    let gi = await db.collection("gi").findOne({
      rut: result.value.rut_cp,
      razon_social: result.value.razon_social_cp,
    });
    let servicio = await db
      .collection("solicitudes")
      .findOne({ codigo: codAsis.replace("FAC", "SOL") });

    await db.collection("pagos").insertOne({
      codigo: codAsis.replace("FAC", "PAG"),
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
      estado: "No Pagado",
      fecha_facturacion: result.value.fecha_facturacion,
      nro_factura: result.value.nro_factura,
      credito: gi.credito,
      dias_credito: gi.dias_credito,
      valor_servicio: Number(servicio.precio),
      valor_cancelado: 0,
      fecha_pago: getFechaPago(
        result.value.fecha_facturacion,
        Number(gi.dias_credito)
      ),
      pagos: [],
    });

    //si no tiene dias credito , pasa directo a cobranza
    if (getMinusculas(gi.credito) == "no") {
      result = await db.collection("cobranza").insertOne({
        codigo: codAsis.replace("FAC", "COB"),
        nombre_servicio: result.value.nombre_servicio,
        faena_seleccionada_cp: result.value.faena_seleccionada_cp,
        valor_servicio: result.value.valor_servicio,
        categoria_cliente: gi.categoria,
        fecha_facturacion: result.value.fecha_facturacion,
        dias_credito: gi.dias_credito,
        rut_cp: result.value.rut_cp,
        razon_social_cp: result.value.razon_social_cp,
        rut_cs: result.value.rut_cs,
        razon_social_cs: result.value.razon_social_cs,
        lugar_servicio: result.value.lugar_servicio,
        sucursal: result.value.sucursal,
        estado: "Vencido",
        valor_servicio: Number(servicio.precio),
        valor_cancelado: 0,
        valor_deuda: Number(servicio.precio),
        cartas_cobranza: [],
      });
    }
  }

  res.json(result);
});

//VALIDAR FACTURA MASIVO
router.post("/validar/factura/asis/many", async (req, res) => {
  const db = await connect();
  let obs = {};
  let estado = "";
  let estadoArchivo = "";
  let result = "";
  let new_array = [];

  obs.obs = req.body[0].observaciones;
  obs.fecha = getDate(new Date());
  obs.estado = req.body[0].estado_archivo;

  estadoArchivo == "Rechazado"
    ? (estado = "En Facturacion")
    : (estado = "Facturado");

  req.body[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  result = await db.collection("facturaciones").updateMany(
    { _id: { $in: new_array } },
    {
      $set: {
        estado: estado,
        estado_archivo: req.body[0].estado_archivo,
        nro_nota_credito: req.body[0].nro_nota_credito,
        fecha_nota_credito: req.body[0].fecha_nota_credito,
        monto_nota_credito: req.body[0].monto_nota_credito,
        factura_anular: req.body[0].factura_anular,
      },
      $push: {
        observacion_factura: obs,
      },
    }
  );

  //si esta aprobada la factura, se ingresa a pagos
  if (req.body[0].estado_archivo == "Aprobado") {
    let resp = "";
    let codigoAsis = "";
    let arrayIDsCP = [];
    let serviciosArray = [];
    let arrayFacturaciones = [];
    let GIs = [];
    let gi = {};
    let Servicios = [];
    let servicio = {};

    resp = await db
      .collection("facturaciones")
      .find({ _id: { $in: new_array } })
      .toArray();

    resp.forEach((element) => {
      arrayIDsCP.push(element.rut_cp.toString());
    });

    resp.forEach((element) => {
      serviciosArray.push(element.codigo.replace("FAC", "SOL"));
    });

    GIs = await db
      .collection("gi")
      .find({
        rut: { $in: arrayIDsCP },
      })
      .toArray();

    Servicios = await db
      .collection("solicitudes")
      .find({ codigo: { $in: serviciosArray } })
      .toArray();

    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("FAC", "PAG");
      //- se busca el gi correspondiente
      gi = GIs.find((gi) => gi.rut === element.rut_cp);
      //-
      //- se busca el servicio asociado
      servicio = Servicios.find(
        (serv) =>
          serv.codigo.replace("SOL", "FAC").toString() === element.codigo
      );
      //-
      arrayFacturaciones.push({
        codigo: codigoAsis,
        nombre_servicio: element.nombre_servicio,
        id_GI_personalAsignado: element.id_GI_personalAsignado,
        faena_seleccionada_cp: element.faena_seleccionada_cp,
        valor_servicio: element.valor_servicio,
        rut_cp: element.rut_cp,
        razon_social_cp: element.razon_social_cp,
        rut_cs: element.rut_cs,
        razon_social_cs: element.razon_social_cs,
        lugar_servicio: element.lugar_servicio,
        sucursal: element.sucursal,
        estado: "No Pagado",
        fecha_facturacion: element.fecha_facturacion,
        nro_factura: element.nro_factura,
        credito: gi.credito,
        dias_credito: gi.dias_credito,
        valor_servicio: Number(servicio.precio),
        valor_cancelado: 0,
        fecha_pago: getFechaPago(
          element.fecha_facturacion,
          Number(gi.dias_credito)
        ),
        pagos: [],
      });
    });

    const resultPagos = await db
      .collection("pagos")
      .insertMany(arrayFacturaciones);


    //si no tiene dias credito , pasa directo a cobranza
    arrayFacturaciones = [];
    resp.forEach((element) => {
      //- se busca el gi correspondiente
      gi = GIs.find((gi) => gi.rut === element.rut_cp);
      //-
      //- se busca el servicio asociado
      servicio = Servicios.find(
        (serv) =>
          serv.codigo.replace("SOL", "FAC").toString() === element.codigo
      );
      //-
      if(getMinusculas(gi.credito) == "no"){     
        arrayFacturaciones.push({
          codigo: servicio.codigo.replace("SOL", "COB"),
          nombre_servicio: element.nombre_servicio,
          faena_seleccionada_cp: element.faena_seleccionada_cp,
          valor_servicio: element.valor_servicio,
          categoria_cliente: gi.categoria,
          fecha_facturacion: element.fecha_facturacion,
          dias_credito: gi.dias_credito,
          rut_cp: element.rut_cp,
          razon_social_cp: element.razon_social_cp,
          rut_cs: element.rut_cs,
          razon_social_cs: element.razon_social_cs,
          lugar_servicio: element.lugar_servicio,
          sucursal: element.sucursal,
          estado: "Vencido",
          valor_servicio: Number(servicio.precio),
          valor_cancelado: 0,
          valor_deuda: Number(servicio.precio),
          cartas_cobranza: [],
        });
      }
    });

    if(arrayFacturaciones.length > 0){
      const resultCobranza = await db
      .collection("cobranza")
      .insertMany(arrayFacturaciones);

      res.json(resultCobranza);
    }
    else{
      res.json(resultPagos)   
    }

   
  }
});

export default router;

import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import multer from "../../libs/multer";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("pagos").find({}).toArray();
  res.json(result);
});

//INGRESAR PAGO
router.post("/nuevo/:id", multer.single('archivo'), async (req, res) => {
  const db = await connect();
  const { id } = req.params;
  let datos = JSON.parse(req.body.data)
  let archivo = {};

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  let obj = {};
  obj.fecha_pago = datos.fecha_pago;
  obj.hora_pago = datos.hora_pago;
  obj.sucursal = datos.sucursal;
  obj.tipo_pago = datos.tipo_pago;
  obj.monto = datos.monto;
  obj.descuento = datos.descuento;
  obj.total = datos.total;
  obj.observaciones = datos.observaciones;
  obj.institucion_bancaria = datos.institucion_bancaria;
  obj.archivo_adjunto = archivo;

  let result = await db.collection("pagos").findOneAndUpdate(
    { _id: ObjectID(id) },
    {
      $inc: {
        valor_cancelado: obj.total,
      },
      $push: {
        pagos: obj,
      },
    },
    { returnOriginal: false }
  );

  //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
  let codigoPAG = result.value.codigo;
  let codigoCOB = codigoPAG.replace("PAG", "COB");
  //--

  if (
    result.value.valor_cancelado > 0 &&
    result.value.valor_cancelado < result.value.valor_servicio
  ) {
    result = await db.collection("pagos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: "Pago Parcial",
        },
      }
    );
  } else if (result.value.valor_cancelado === result.value.valor_servicio) {
    result = await db.collection("pagos").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          estado: "Pagado",
        },
      }
    );
  }
  //descontar de la deuda en cobranza si existe
  result = await db.collection("cobranza").findOneAndUpdate(
    { codigo: codigoCOB },
    {
      $inc: {
        valor_deuda: -obj.total,
        valor_cancelado: obj.total,
      },
    },
    { returnOriginal: false }
  );

  // y si la deuda se salda, pasar al estado al dia
  if (result.value.valor_deuda === 0) {
    result = await db.collection("cobranza").updateOne(
      { codigo: codigoCOB },
      {
        $set: {
          estado: "Al Dia",
        },
      }
    );
  }

  res.json(result);
});

//INGRESO MASIVO DE PAGOS
router.post("/many", multer.single('archivo'), async (req, res) => {
  const db = await connect();
  let datos = JSON.parse(req.body.data)
  let archivo = {};
  let new_array = [];

  datos[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  if (req.file) {
    archivo = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };
  }

  try {
    let result = await db
      .collection("pagos")
      .find({ _id: { $in: new_array } })
      .forEach(function (c) {
        db.collection("pagos").updateOne(
          { _id: c._id },
          {
            $push: {
              pagos: {
                fecha_pago: datos[0].fecha_pago,
                hora_pago: datos[0].hora_pago,
                sucursal: datos[0].sucursal,
                tipo_pago: datos[0].tipo_pago,
                monto: c.valor_servicio - c.valor_cancelado,
                descuento: datos[0].descuento,
                total: c.valor_servicio - c.valor_cancelado,
                observaciones: datos[0].observaciones,
                institucion_bancaria: datos[0].institucion_bancaria,
                archivo_adjunto: archivo
              },
            },
            $set: {
              valor_cancelado: c.valor_servicio,
              estado: "Pagado",
            },
          }
        );
      });

    //pasar los codigos de pago a cobranza
    let codesCobranza = datos[2].codes;
    codesCobranza = codesCobranza.map((e) => (e = e.replace("PAG", "COB")));

    result = await db
      .collection("cobranza")
      .find({ codigo: { $in: codesCobranza } })
      .forEach(function (c) {
        db.collection("cobranza").updateOne(
          { codigo: c.codigo },
          {
            $set: {
              valor_cancelado: c.valor_servicio,
              valor_deuda: 0,
              estado: "Al Dia",
            },
          }
        );
      });

    res.json({
      message: "Pagos realizados satisfactoriamente",
      isOK: true,
    });
  } catch (error) {
    res.json({
      message: "ha ocurrido un error",
      err: error,
      isOK: false,
    });
  }
});

export default router;

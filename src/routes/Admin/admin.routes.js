import { Router } from 'express';
import { NOT_EXISTS } from '../../constant/var';

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

const router = Router();

//-----------------------------------------------------------------REQUESTS ENDPOINTS

//GET REQUEST BY CODE
router.post('/solicitudes/:code', async (req, res) => {
  const { code } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const request = await db.collection('solicitudes').findOne({ codigo: code, isActive: true });

    if (!request) return res.status(404).json({
      err: NOT_EXISTS,
      msg: "La solicitud consultada no existe en el sistema",
      res: null
    })

    const lastObservation = (!!request.observacion_solicitud && !!request.observacion_solicitud.length)
      ? request.observacion_solicitud[request.observacion_solicitud.length - 1].obs : ''

    console.log(lastObservation)

    return res.status(200).json({
      err: null,
      msg: '',
      res: {
        ...request,
        observacion_solicitud: lastObservation
      }
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
});

//UPDATE REQUEST
router.put('/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  const {
    codigo,
    fecha_solicitud,
    mes_solicitud,
    anio_solicitud,
    categoria1,
    categoria2,
    categoria3,
    nombre_servicio,
    monto_neto,
    porcentaje_impuesto,
    valor_impuesto,
    exento,
    monto_total,
    descripcion_servicio,
    nro_contrato_seleccionado_cp,
    faena_seleccionada_cp,
    fecha_servicio_solicitado,
    hora_servicio_solicitado,
    fecha_servicio_solicitado_termino,
    hora_servicio_solicitado_termino,
    jornada
  } = req.body
  const conn = await connect();
  const db = conn.db('asis-db');

  try {

    console.log([monto_neto, porcentaje_impuesto, valor_impuesto, exento, monto_total])

    await db.collection('solicitudes').updateOne({ _id: ObjectID(id) }, {
      $set: {
        fecha_solicitud,
        mes_solicitud,
        anio_solicitud,
        categoria1,
        categoria2,
        categoria3,
        nombre_servicio,
        descripcion_servicio,
        monto_neto,
        porcentaje_impuesto,
        valor_impuesto,
        exento,
        monto_total,
        nro_contrato_seleccionado_cp,
        faena_seleccionada_cp,
        fecha_servicio_solicitado,
        hora_servicio_solicitado,
        fecha_servicio_solicitado_termino,
        hora_servicio_solicitado_termino,
        jornada
      }
    });

    await db.collection('reservas').updateOne({ codigo: codigo.replace("SOL", "AGE") }, {
      $set: {
        nombre_servicio,
        valor_servicio: monto_total,
        faena_seleccionada_cp,
        fecha_reserva: fecha_servicio_solicitado,
        hora_reserva: hora_servicio_solicitado,
        fecha_reserva_fin: fecha_servicio_solicitado_termino,
        hora_reserva_fin: hora_servicio_solicitado_termino
      }
    });

    await db.collection('evaluaciones').updateOne({ codigo: codigo.replace("SOL", "EVA") }, {
      $set: {
        nombre_servicio,
        valor_servicio: monto_total,
        faena_seleccionada_cp,
        fecha_evaluacion: fecha_servicio_solicitado,
        fecha_evaluacion_fin: fecha_servicio_solicitado_termino,
        hora_inicio_evaluacion: hora_servicio_solicitado,
        hora_termino_evaluacion: hora_servicio_solicitado_termino
      }
    });

    await db.collection('resultados').updateOne({ codigo: codigo.replace("SOL", "RES") }, {
      $set: {
        nombre_servicio,
        valor_servicio: monto_total,
        faena_seleccionada_cp
      }
    });

    const invoice = await db.collection('facturaciones').findOne({ codigo: codigo.replace("SOL", "FAC") })

    await db.collection('facturaciones').updateOne({ codigo: codigo.replace("SOL", "FAC") }, {
      $set: {
        nombre_servicio,
        faena_seleccionada_cp,
        valor_servicio: monto_total,
        monto_neto,
        porcentaje_impuesto,
        valor_impuesto,
        exento,
        sub_total: monto_total,
        total: monto_total - (invoice.descuento ?? 0)
      }
    });

    await db.collection('pagos').updateOne({ codigo: codigo.replace("SOL", "PAG") }, {
      $set: {
        nombre_servicio,
        valor_servicio: monto_total,
        faena_seleccionada_cp
      }
    });

    await db.collection('pagos').updateOne({ codigo: codigo.replace("SOL", "PAG") }, {
      $set: {
        nombre_servicio,
        valor_servicio: monto_total,
        faena_seleccionada_cp
      }
    });

    await db.collection('cobranza').updateOne({ codigo: codigo.replace("SOL", "COB") }, {
      $set: {
        nombre_servicio,
        faena_seleccionada_cp,
        valor_servicio: monto_total,
        valor_deuda: monto_total,
      }
    });

    return res.status(200).json({
      err: null,
      msg: 'Solicitud editada correctamente',
      res: []
    });


  } catch (error) {
    console.log(error)
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
})

export default router;
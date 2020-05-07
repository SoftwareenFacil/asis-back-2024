import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getMinusculas } from "../../functions/changeToMiniscula";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('reservas').find({}).toArray();
    res.json(result);
})

//SELECT ONE 
router.get('/:id', async (req, res) => {
    const { id } = req.params
    const db = await connect();
    const result = await db.collection('reservas').findOne({ _id: ObjectID(id) })
    res.json(result)
})

//CONFIRMAR RESERVA
router.post('/confirmar/:id', async (req, res) => {
    const { id } = req.params;
    const datos = req.body
    const db = await connect();
    let result = null
    let resulEva = null
    try {
        result = await db.collection('reservas').updateOne({ _id: ObjectID(id) }, {
            $set: {
                fecha_reserva: datos.fecha_reserva,
                hora_reserva: datos.hora_reserva,
                hora_reserva_fin: datos.hora_reserva_fin,
                id_GI_personalAsignado: datos.id_GI_personalAsignado,
                sucursal: datos.sucursal,
                observacion: datos.observacion,
                estado: "Reservado",
                reqEvaluacion: getMinusculas(datos.reqEvaluacion)
            }
        });
        console.log('result modified', result.result.ok)
        if (getMinusculas(datos.reqEvaluacion) == 'si' && result.result.ok == 1) {
            //insertamos la evaluacion
            const reserva = await db.collection('reservas').findOne({ _id: ObjectID(id) })
            let codAsis = reserva.codigo;
            codAsis = codAsis.replace('AGE', 'EVA')

            resulEva = await db.collection('evaluaciones').insertOne({
                id_GI_personalAsignado: reserva.id_GI_personalAsignado,
                codigo: codAsis,
                fecha_evaluacion: reserva.fecha_reserva,
                hora_inicio_evaluacion: reserva.hora_reserva,
                hora_termino_evaluacion: reserva.hora_reserva_fin,
                mes: reserva.mes,
                anio: reserva.anio,
                nombre_servicio: reserva.nombre_servicio,
                rut_cp: reserva.rut_cp,
                razon_social_cp: reserva.razon_social_cp,
                rut_cs: reserva.rut_cs,
                razon_social_cs: reserva.razon_social_cs,
                lugar_servicio: reserva.lugar_servicio,
                sucursal: reserva.sucursal,
                estado: "Ingresado"
            });          
        }

        res.json({
            status: 200,
            message: "Reserva Confirmada"
        });

    } catch (err) {
        console.log('error', err)
        res.json({
            status: 500,
            message: "No se pudo concretar la confirmacion de la reserva",
            error: err
        })
    }
  
})

export default router;
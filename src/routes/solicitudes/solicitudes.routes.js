import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('solicitudes').find({}).toArray();
    res.json(result);
})

//SELECT FIELDS TO CONFIRM SOLICITUD
router.get('/mostrar/:id', async (req, res) => {
    const db = await connect();
    const { id } = req.params;
    const resultFinal = {}
    const resultSol = await db.collection('solicitudes').findOne({ _id: ObjectID(id) });
    const resultGI = await db.collection('gi').findOne({ _id: ObjectID(resultSol.id_GI_Principal) })
    resultSol.email_gi = resultGI.email_central;
    res.json(resultSol)
})

//INSERT
router.post('/', async (req, res) => {
    const db = await connect()
    const newSolicitud = req.body
    const items = await db.collection('solicitudes').find({}).toArray();
    if (items.length > 0) {
        newSolicitud.codigo = `ASIS-SOL-${YEAR}-${calculate(items[items.length - 1])}`
    }
    else {
        newSolicitud.codigo = `ASIS-SOL-${YEAR}-00001`
    }
    const result = await db.collection('solicitudes').insertOne(newSolicitud);
    res.json(result)
});

//CONFIRMAR SOLICITUD
router.post('/confirmar/:id', async (req, res) => {
    const db = await connect()
    const solicitud = req.body
    const { id } = req.params
    //obtener mail del cliente principal
    const resultSol = await db.collection('solicitudes').updateOne({ _id: ObjectID(id) }, {
        $set: {
            fecha_confirmacion: solicitud.fecha_solicitud,
            hora_confirmacion: solicitud.hora_solicitud,
            observacion_solicitud: solicitud.observacion_solicitud,
            medio_confirmacion: solicitud.medio_confirmacion,
            estado: "Confirmado"
        }
    });

    // console.log('result sol', resultSol)

    if (resultSol.result.ok) {
        const resultGI = await db.collection('gi').updateOne({ _id: ObjectID(solicitud.id_GI_Principal) }, {
            $set: {
                email_central: solicitud.email_central
            }
        });

        // console.log('result gi', resultGI)

        if (resultGI.result.ok) {
            //-------------------------------------CREAR LA RESERVA-----------------------
            const resp = await db.collection('solicitudes').findOne({ _id: ObjectID(id) })
            let codigoAsis = resp.codigo
            codigoAsis = codigoAsis.replace('SOL', 'AGE')
            console.log('sol', resp)
            const newReserva = {
                codigo: codigoAsis,
                id_GI_Principal: resp.id_GI_Principal,
                id_GI_Secundario: resp.id_GI_Secundario,
                id_GI_personalAsignado: resp.id_GI_PersonalAsignado,
                rut_cp: resp.rut_CP,
                razon_social_cp: resp.razon_social_CP,
                rut_cs: resp.rut_cs,
                razon_social_cs: resp.razon_social_cs,
                fecha_reserva: resp.fecha_servicio_solicitado,
                hora_reserva: resp.hora_servicio_solicitado,
                hora_reserva_fin: "", 
                jornada: resp.jornada,
                mes: resp.mes_solicitud,
                anio: resp.anio_solicitud,
                nombre_servicio: resp.nombre_servicio,               
                lugar_servicio: resp.lugar_servicio,
                sucursal: resp.sucursal,
                observacion: '',
                estado: 'Ingresado'
            }

            const resulReserva = await db.collection('reservas').insertOne(newReserva)
            res.json(resulReserva)
        }
    }
})

//DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connect()
    const result = await db.collection('solicitudes').deleteOne({ _id: ObjectID(id) })
    res.json(result)
})

export default router;
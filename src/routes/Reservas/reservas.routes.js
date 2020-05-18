import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getMinusculas } from "../../functions/changeToMiniscula";
import { getDate } from "../../functions/getDateNow";

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
    let obs = {}
    obs.obs = datos.observacion
    obs.fecha = getDate(new Date())
    let result = null
    let codAsis = ''
    try {
        result = await db.collection('reservas').updateOne({ _id: ObjectID(id) }, {
            $set: {
                fecha_reserva: datos.fecha_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva: datos.hora_reserva,
                hora_reserva_fin: datos.hora_reserva_fin,
                id_GI_personalAsignado: datos.id_GI_profesional_asignado,
                sucursal: datos.sucursal,
                estado: "Reservado",
                reqEvaluacion: getMinusculas(datos.reqEvaluacion)
            },
            $push:{
                observacion: obs
            }
        });
        // console.log('result modified', result.result.ok)
        if (getMinusculas(datos.reqEvaluacion) == 'si' && result.result.ok == 1) {
            //insertamos la evaluacion
            const reserva = await db.collection('reservas').findOne({ _id: ObjectID(id) })
            codAsis = reserva.codigo;
            codAsis = codAsis.replace('AGE', 'EVA')

            await db.collection('evaluaciones').insertOne({
                id_GI_personalAsignado: reserva.id_GI_personalAsignado,
                codigo: codAsis,
                fecha_evaluacion: reserva.fecha_reserva,
                fecha_evaluacion_fin: reserva.fecha_reserva_fin,
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
                observaciones: [],
                estado_archivo: "Sin Documento",
                estado: "Ingresado"
            });          
        }
        else{
            //verificar si tiene OC o no el GI
            let gi = await db.collection('gi').findOne({rut: result.value.rut_cp, "categoria": "Empresa/Organización"})
            var isOC = ''
            let estado_archivo = ''
            if(gi){
                isOC = gi.orden_compra;
                (isOC == 'Si') ? estado_archivo = 'Sin Documento' : estado_archivo = 'No Requiere OC';
            }
            else{
                isOC = "No"
                estado_archivo = 'No Requiere OC'
            }
            //pasa directo a facturaciones
            codAsis = reserva.codigo;
            codAsis = codAsis.replace('AGE', 'FAC')
            await db.collection('facturaciones').insertOne({
                codigo: codAsis,
                nombre_servicio: reserva.nombre_servicio,
                id_GI_personalAsignado: reserva.id_GI_personalAsignado,
                rut_cp: reserva.rut_cp,
                razon_social_cp: reserva.razon_social_cp,
                rut_cs: reserva.rut_cs,
                razon_social_cs: reserva.razon_social_cs,
                lugar_servicio: reserva.lugar_servicio,
                sucursal: reserva.sucursal,
                condicionantes: '',
                vigencia_examen: '',
                oc: isOC,
                archivo_oc: null,
                fecha_oc: "",
                hora_oc: "",
                nro_oc: "",
                observacion_oc: [],
                observacion_factura: [],
                estado: "Ingresado",
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
                total: 0
            })
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
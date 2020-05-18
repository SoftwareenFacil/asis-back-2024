import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import { getFechaPago } from "../../functions/calculateFechaPago";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    let result = await db.collection('facturaciones').find({}).toArray();
    let empresa = await db.collection('empresa').findOne({});
    res.json({
        datos: result,
        empresa: empresa
    });
});

//INSERTAR DATOS DE FACTURACION
router.post('/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    let obs = {}
    obs.obs = req.body.observacion_factura
    obs.fecha = getDate(new Date())
    obs.estado = "Cargado"
    let result = "";

    result = await db.collection('facturaciones').updateOne({_id: ObjectID(id)}, {
        $set:{
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
            total: req.body.total
        },
        $push:{
            observacion_factura: obs
        }
    })

    res.json(result);
})

//SUBIR OC
router.post('/subiroc/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    let obs = {}
    obs.obs = req.body.observacion_oc
    obs.fecha = getDate(new Date())
    obs.estado = "Cargado"
    const result = await db.collection('facturaciones').updateOne({_id: ObjectID(id)}, {
        $set:{
            archivo_oc: req.body.archivo_oc,
            fecha_oc: req.body.fecha_oc,
            hora_oc: req.body.hora_oc,
            nro_oc: req.body.nro_oc,
            estado_archivo: "Cargado"
        },
        $push:{
            observacion_oc: obs
        }
    });

    res.json(result)
})

//CONFIRMAR OC
router.post('/confirmaroc/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    let obs = {}
    obs.obs = req.body.observaciones
    obs.fecha = getDate(new Date())
    obs.estado = req.body.estado_archivo
    let estado = '';
    (req.body.estado_archivo == 'Aprobado')?estado = 'En Facturacion' : estado = "Ingresado";
    const result  = await db.collection('facturaciones').updateOne({_id: ObjectID(id)}, {
        $set:{
            estado: estado,
            estado_archivo: req.body.estado_archivo
        },
        $push:{
            observacion_oc: obs
        }
    });

    res.json(result)
})

// VALIDAR FACTURA
router.post('/validar/:id', async (req, res) =>{
    const { id } = req.params
    const { estado_archivo, observaciones } = req.body;
    const db = await connect()
    let obs = {}
    obs.obs = observaciones
    obs.fecha = getDate(new Date())
    obs.estado = estado_archivo
    let estado = '';
    (estado_archivo == "Rechazado")?estado = 'En Facturacion' : estado = "Facturado";

    let result = await db.collection('facturaciones').findOneAndUpdate({_id: ObjectID(id)}, {
        $set:{
            estado: estado,
            estado_archivo: estado_archivo
        },
        $push:{
            observacion_factura: obs
        }
    });

    if(estado_archivo == 'Aprobado'){
        //insertar pago en modulo pago
        let codAsis = result.value.codigo;
        let gi = await db.collection('gi').findOne({rut: result.value.rut_cp})
        let servicio = await db.collection('solicitudes').findOne({codigo: codAsis.replace('FAC', 'SOL')})
        result = await db.collection('pagos').insertOne({
            codigo: codAsis.replace('FAC', 'PAG'),
            nombre_servicio: result.value.nombre_servicio,
            id_GI_personalAsignado: result.value.id_GI_personalAsignado,
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
            valor_servicio: servicio.precio,
            fecha_pago: getFechaPago(result.value.fecha_facturacion, Number(gi.dias_credito)),
            pagos: []
        });

        console.log('result pago insert', result)
    }

    res.json(result)
}) 

export default router;
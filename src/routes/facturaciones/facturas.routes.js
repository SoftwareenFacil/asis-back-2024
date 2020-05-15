import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('facturaciones').find({}).toArray();
    res.json(result);
});

//INSERTAR DATOS DE FACTURACION
router.post('/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    let result = "";
    if(req.body.estado_facturacion == 'No Facturado'){
        result = await db.collection('facturaciones').updateOne({_id: ObjectID(id)}, {
            $set:{
                estado_facturacion: req.body.estado_facturacion,

            },
            $push:{
                observacion_factura: req.body.observacion_factura
            }
        })
    }
    else{
        result = await db.collection('facturaciones').updateOne({_id: ObjectID(id)}, {
            $set:{
                estado_facturacion: req.body.estado_facturacion,
                fecha_facturacion: req.body.fecha_facturacion,
                nro_factura: req.body.nro_factura,
                archivo_factura: req.body.archivo_factura,
                monto_neto: req.body.monto_neto,
                porcentaje_impuesto: req.body.porcentaje_impuesto,
                valor_impuesto: req.body.valor_impuesto,
                sub_total: req.body.sub_total,
                exento: req.body.exento,
                total: req.body.total
            },
            $push:{
                observacion_factura: req.body.observacion_factura
            }
        })
    }

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

export default router;
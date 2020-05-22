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
router.get('/', async (req, res) =>{
    const db = await connect()
    const result = await db.collection('pagos').find({}).toArray()
    res.json(result)
})

//INGRESAR PAGO
router.post('/nuevo/:id', async (req, res) =>{
    const db = await connect()
    const { id } = req.params
    let obj = {}
    obj.fecha_pago = req.body.fecha_pago
    obj.hora_pago = req.body.hora_pago
    obj.sucursal = req.body.sucursal,
    obj.tipo_pago = req.body.tipo_pago,
    obj.monto = req.body.monto,
    obj.descuento = req.body.descuento
    obj.total = req.body.total
    obj.observaciones = req.body.observaciones
    obj.institucion_bancaria = req.body.institucion_bancaria
    let result = await db.collection('pagos').findOneAndUpdate({_id: ObjectID(id)}, {
        $inc: {
            valor_cancelado: obj.total
        },    
        $push:{
            pagos: obj
        },
        
    }, {returnOriginal: false});

    //-- sacamos el codigo de apgos y lo transformamos a cobranza para buscar si existe
    let codigoPAG = result.value.codigo;
    let codigoCOB = codigoPAG.replace('PAG', 'COB')
    //--

    console.log('valores', result.value)
    if(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio){
        result = await db.collection('pagos').updateOne({_id: ObjectID(id)}, {
            $set:{
                estado: "Pago Parcial"
            }
        })
    }
    else if(result.value.valor_cancelado === result.value.valor_servicio){
        result = await db.collection('pagos').updateOne({_id: ObjectID(id)}, {
            $set:{
                estado: "Pagado"
            }
        })
    }
    //descontar de la deuda en cobranza si existe 
    result = await db.collection('cobranza').findOneAndUpdate({codigo: codigoCOB}, {
        $inc:{
            valor_deuda: -obj.total,
            valor_cancelado: obj.total
        },
    }, {returnOriginal: false})

    // y si la deuda se salda, pasar al estado al dia
    if(result.value.valor_deuda === 0){
        result = await db.collection('cobranza').updateOne({codigo: codigoCOB}, {
            $set:{
                estado: "Al Dia"
            }
        })
    }

    res.json(result)
})

export default router;
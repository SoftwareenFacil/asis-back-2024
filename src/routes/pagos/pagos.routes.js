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
router.post('/pago/:id', async (req, res) =>{
    const db = await connect()
    let obj = {}
    obj.fecha_pago = req.body.fecha_pago
    obj.hora_pago = req.body.hora_pago
    obj.local = req.body.local,
    obj.razon_social_cp = req.body.razon_social_cp,
    obj.tipo_pago = req.body.tipo_pago,
    obj.monto = req.body.monto,
    obj.descuento = req.body.descuento
    const result = await db.collection('pagos').updateOne({_id: ObjectID(id)}, {
        $push:{
            pagos: obj
        }
    });

    res.json(result)
})

export default router;
import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

router.get('/', async (req, res) =>{
    const db = await connect()
    const result = await db.collection('pagos').find({}).toArray()
    res.json(result)
})

export default router;
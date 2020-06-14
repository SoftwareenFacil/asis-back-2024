import { Router } from "express";
import {calculate} from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";

const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const solicitudes = await db.collection('solicitudes').find({}).toArray();
    const reservas = await db.collection('reservas').find({}).toArray();
    let totalDatos = []
    totalDatos.push(solicitudes)
    totalDatos.push(reservas)
    res.json(totalDatos);
})


export default router;
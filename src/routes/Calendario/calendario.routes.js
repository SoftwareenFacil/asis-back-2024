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
    const conn = await connect();
    const db = conn.db('asis-db');
    try {
        const solicitudes = await db.collection('solicitudes').find({}).toArray();
        const reservas = await db.collection('reservas').find({}).toArray();
        let totalDatos = []
        totalDatos.push(solicitudes)
        totalDatos.push(reservas)
        res.json(totalDatos);
    } catch (error) {
        res.json({});
    }
    finally {
        conn.close()
    }
})


export default router;
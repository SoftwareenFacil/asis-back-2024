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
    const result = await db.collection('reservas').find({}).toArray();
    res.json(result);
})


export default router;
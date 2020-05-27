import { Router } from "express";
import {calculate} from "../../functions/NewCode";
const router = Router();

const YEAR = getYear();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

// SELECT
router.get('/', async (req, res) =>{
    const db = await connect();
    const result = await db.collection('existencia').find({}).toArray();
    res.json(result)
});

export default router;
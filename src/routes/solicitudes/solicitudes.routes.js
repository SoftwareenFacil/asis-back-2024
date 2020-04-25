import { Router } from "express";
const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('solicitudes').find({}).toArray();
    res.json(result);
})



export default router;
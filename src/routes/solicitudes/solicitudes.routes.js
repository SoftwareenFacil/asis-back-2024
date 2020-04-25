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

//INSERT
router.post('/', async (req, res) => {
    const db = await connect()
    const newSolicitud = req.body
    const result = await db.collection('solicitudes').insertOne(newSolicitud);
    res.json(result)
});

//DELETE
router.delete('/:id', async (req, res) =>{
    const {id} = req.params;
    const db = await connect()
    const result = await db.collection('solicitudes').deleteOne({_id: ObjectID(id)})
    res.json(result)
})

export default router;
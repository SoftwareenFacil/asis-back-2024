import { Router } from "express";
const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) =>{
    const db = await connect();
    const result = await db.collection('gi').find({}).toArray();
    res.json(result)
});

//INSERT
router.post('/', async (req, res) => {
    const db = await connect()
    const newGi = req.body
    const result = await db.collection('gi').insertOne(newGi);
    res.json(result)
});

//DELETE
router.delete('/:id', async (req, res) =>{
    const {id} = req.params;
    const db = await connect()
    const result = await db.collection('gi').deleteOne({_id: ObjectID(id)})
    res.json(result)
})

export default router;
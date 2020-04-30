import { Router } from "express";
import {calculate} from "../../functions/NewCode";
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

//SELECT BY RUT
router.get('/:rut', async (req, res) =>{
    const {rut} = req.params;
    const db = await connect();
    const result = await db.collection('gi').findOne({rut: rut})
    res.json(result)
})

//INSERT
router.post('/', async (req, res) => {
    const db = await connect()
    const newGi = req.body   
    const items = await db.collection('gi').find({}).toArray();
    if(items.length > 0){
        newGi.codigo = `ASIS-GI-${calculate(items[items.length - 1])}` 
    }
    else{
        newGi.codigo = `ASIS-GI-00001`
    }
    console.log(newGi)
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
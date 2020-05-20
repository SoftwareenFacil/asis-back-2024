import { Router } from "express";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT 
router.get('/', async (req, res) =>{
    const db = await connect()
    const result = await db.collection('cobranza').find({}).toArray()
    res.json(result)
});

//SELECT POR RUT CP Y TIPO CLIENTE
router.post('/buscar', async (req, res) => {
    const { rutcp, tipocliente } = req.body
    const db = await connect()
    const result = await db.collection('cobranza').find({rut_cp: rutcp, categoria_cliente: tipocliente}).toArray()
    res.json(result)
})

export default router;
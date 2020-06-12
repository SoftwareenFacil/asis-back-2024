import { Router } from "express";
import {calculate} from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
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

//CONSULTAR POR ENTRADAS PARA INSERCION DE SALIDAS
router.post('/consultar', async (req, res) =>{
    const db = await connect()
    const {code, salidas} = req.body
    const result = await db.collection('existencia').findOne({codigo_categoria_tres: code})
    if(result == null){
        res.json({
            message: "La Subcategoria 3 consultada no existe en la existencia del sistema",
            isOK: false
        })
    }
    else{
        res.json({
            cupos_disponibles: result.entradas - result.salidas,
        })
    }
})

export default router;
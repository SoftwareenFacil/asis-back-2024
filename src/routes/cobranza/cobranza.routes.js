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

router.post('/envio/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect()
    let obj = {}
    obj.fecha_creacion_carta = req.body.fecha_creacion_carta
    obj.hora_creacion_carta = req.body.hora_creacion_carta
    obj.fecha_envio_carta = req.body.fecha_envio_carta
    obj.hora_envio_carta = req.body.hora_envio_carta
    obj.observacion = req.body.observacion
    obj.estado = "Enviado"

    const result = await db.collection('cobranza').updateOne({_id: ObjectID(id)}, {
        $set:{
            estado: "En Cobranza"
        },  
        $push:{
            cartas_cobranza: obj
        }
    });

    res.json(result)
})

export default router;
import { Router } from "express";
import {calculate} from "../../functions/NewCode";
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

//SELECT FIELDS TO CONFIRM SOLICITUD
router.get('/mostrar/:id', async (req, res) =>{
    const db = await connect();
    const { id } = req.params;
    const resultFinal = {}
    const resultSol = await db.collection('solicitudes').findOne({_id: ObjectID(id)});
    const resultGI = await db.collection('gi').findOne({_id: ObjectID(resultSol.id_GI_Principal)})
    resultSol.email_gi = resultGI.email_central;
    res.json(resultSol)
})

//INSERT
router.post('/', async (req, res) => {
    const db = await connect()
    const newSolicitud = req.body
    const items = await db.collection('solicitudes').find({}).toArray();
    if(items.length > 0){
        newSolicitud.codigo = `ASIS-SOL-${calculate(items[items.length - 1])}` 
    }
    else{
        newSolicitud.codigo = `ASIS-SOL-00001`
    }
    const result = await db.collection('solicitudes').insertOne(newSolicitud);
    res.json(result)
});

//PASAR SOLICUTUD A CONFIRMADO
router.post('/confirmar/:id', async (req, res) =>{
    // const db = await connect()
    // const { id } = req.params
    // //obtener mail del cliente principal
    // const gi = await db.collection('gi').findOne({_id: ObjectID(id)});
    // console.log('id gi', id)
    // console.log('correo', gi.email_central)
    // const result = await db.collection('solicitudes').findOneAndUpdate({_id: ObjectID(id)}, {
    //     $set:{
    //         "fecha_servicio_solicitado": req.body.fecha,
    //         "hora_servicio": req.body.hora
    //     }
    // })
})

//DELETE
router.delete('/:id', async (req, res) =>{
    const {id} = req.params;
    const db = await connect()
    const result = await db.collection('solicitudes').deleteOne({_id: ObjectID(id)})
    res.json(result)
})

export default router;
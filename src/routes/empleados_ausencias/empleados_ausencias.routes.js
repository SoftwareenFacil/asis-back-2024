import { Router } from "express";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SHOW AUSENCIAS POR EMPLEADO
router.post('/show/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();

    const result = await db.collection('empleados_ausencias').find({id_empleado: id}).toArray();

    res.json(result);
});

//SHOW AUSENCIAS POR EMPLEADO, AÑO Y MES
router.post('/show/:id/:mes/:anio', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();

    const result = await db.collection('empleados_ausencias').find({
        id_empleado: id,
        mes_ausencia: mes,
        anio_ausencia: anio
    }).toArray();

    res.json(result);
})

//INSERT AUSENCIA BY EMPLEADO
router.post('/', async (req, res) =>{
    const db = await connect();
    const data = req.body;

    const result = await db.collection('empleados_ausencias').insertOne(data);

    res.json(result);
});

//UPDATE AUSENCIA
router.put('/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();
    const data = req.body;

    const result = await db.collection('empleados_ausencias').updateOne({_id: ObjectID(id)}, {
        $set: data
    });

    res.json(result);
});

//DELETE AUSENCIA
router.delete('/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();

    const result = await db.collection('empleados_ausencias').deleteOne({_id: ObjectID(id)});

    res.json(result);
})

export default router;
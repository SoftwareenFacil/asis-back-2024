import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('resultados').find({}).toArray();
    res.json(result);
});

//confirmar resultado
router.post('/confirmar/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();
    const result = await db.collection('resultados').updateOne({_id: ObjectID(id)}, {
        $set:{
            estado_resultado: req.body.estado_resultado,
            vigencia_examen: req.body.vigencia_examen,
            fecha_resultado: req.body.fecha_resultado,
            hora_resultado: req.body.hora_resultado,
            observaciones: req.body.observaciones,
            condicionantes: req.body.condicionantes,
            archivo_resultado: req.body.archivo_resultado
        }
    });

    res.json(result)
})

export default router;
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
    const result = await db.collection('evaluaciones').find({}).toArray();
    res.json(result);
});

//PASAR A EN EVALUACION
router.post('/evaluar/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    const result = await db.collection('evaluaciones').updateOne({_id: ObjectID(id)}, {
        $set:{
            estado: "En Evaluacion",
            observaciones: req.body.observaciones,
            archivoExamen: req.body.archivo_examen
        }
    });

    res.json(result)
});

//PASAR A EVALUADO
router.post('/evaluado/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect();
    const result = await db.collection('evaluaciones').findOneAndUpdate({_id: ObjectID(id)}, {
        $set:{
            estado: "Evaluado",
            archivoResultado: req.body.archivo
        },
    }, 
    { sort: { codigo: 1 }, returnNewDocument  : true });

    // console.log(result)
    if(result.ok == 1){
        let codAsis = result.value.codigo;
        codAsis = codAsis.replace('EVA', 'RES')
        const resultinsert = await db.collection('resultados').insertOne({
            codigo: codAsis,
            nombre_servicio: result.value.nombre_servicio,
            id_GI_personalAsignado: result.value.id_GI_personalAsignado,
            rut_cp: result.value.rut_cp,
            razon_social_cp: result.value.razon_social_cp,
            rut_cs: result.value.rut_cs,
            razon_social_cs: result.value.razon_social_cs,
            lugar_servicio: result.value.lugar_servicio,
            sucursal: result.value.sucursal,
            archivoResultado: result.value.archivoResultado
        });


    }

    res.json(result)
});

export default router;
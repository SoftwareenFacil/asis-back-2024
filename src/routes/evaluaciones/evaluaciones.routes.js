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
router.post('/evaluar/:id', async (req, res) => {
    const { id } = req.params
    const db = await connect();
    const result = await db.collection('evaluaciones').updateOne({ _id: ObjectID(id) }, {
        $set: {
            estado: "En Evaluacion",
            estado_archivo: "Cargado",
            observaciones: req.body.observaciones,
            archivo_examen: req.body.archivo_examen,
            fecha_carga_examen: req.body.fecha_carga_examen,
            hora_carga_examen: req.body.hora_carga_examen
        }
    });

    res.json(result)
});

//PASAR A EVALUADO
router.post('/evaluado/:id', async (req, res) => {
    const { id } = req.params
    const db = await connect();
    let estadoEvaluacion = '';

    if (req.body.estado_archivo == "Aprobado" || req.body.estado_archivo == "Aprobado con Obs") {

        estadoEvaluacion = 'Evaluado'
    }
    else {
        estadoEvaluacion = 'Ingresado'
    }
    // console.log(result)
    let result = await db.collection('evaluaciones').findOneAndUpdate({ _id: ObjectID(id) }, {
        $set: {
            estado: estadoEvaluacion,
            estado_archivo: req.body.estado_archivo,
            observaciones: req.body.observaciones,
        },
    },
        { sort: { codigo: 1 }, returnNewDocument: true });

    if (result.ok == 1 && (req.body.estado_archivo == "Aprobado" || req.body.estado_archivo == "Aprobado con Obs")) {
        let codAsis = result.value.codigo;
        codAsis = codAsis.replace('EVA', 'RES')
        // console.log('result', result.value)
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

            condicionantes: req.body.condicionantes,
            vigencia_examen: req.body.vigencia_examen,
            observaciones: req.body.observaciones,
            archivo_respuesta_examen: req.body.archivo_resultado,
            fecha_resultado: req.body.fecha_resultado_examen,
            hora_resultado: req.body.hora_resultado_examen,
            estado_examen: req.body.estado_archivo
        });

        console.log('result resultado', resultinsert)
        result = resultinsert
    }

    console.log('result', result)
    res.json(result)
});

export default router;
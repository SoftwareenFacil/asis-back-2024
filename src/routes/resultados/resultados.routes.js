import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";

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

router.post('/subir/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();
    let obs = {}
    obs.obs = req.body.observaciones
    obs.fecha = getDate(new Date())
    obs.estado = "Cargado"
    const result = await db.collection('resultados').updateOne({_id: ObjectID(id)},{
        $set:{
            estado_archivo: "Cargado",
            archivo_resultado: req.body.archivo_resultado
        },
        $push:{
            observaciones: obs
        }
    });
    
    res.json(result)
})

//confirmar resultado
router.post('/confirmar/:id', async (req, res) =>{
    const { id } = req.params;
    const db = await connect();
    let result = "";
    let obs = {}
    obs.obs = req.body.observaciones
    obs.fecha = getDate(new Date())

    if(req.body.estado_archivo == 'Aprobado'){
        obs.estado = req.body.estado_archivo
        if(req.body.estado_resultado == 'Aprobado con Obs' || req.body.estado_resultado == 'Aprobado'){
            result = await db.collection('resultados').updateOne({_id: ObjectID(id)}, {
                $set:{
                    estado: "Revisado",
                    estado_archivo: req.body.estado_archivo,
                    estado_resultado: req.body.estado_resultado,
                    vigencia_examen: req.body.vigencia_examen,
                    fecha_resultado: req.body.fecha_resultado,
                    hora_resultado: req.body.hora_resultado,
                    condicionantes: req.body.condicionantes,
                    fecha_vencimiento_examen:  getDate(getFechaVencExam(req.body.fecha_resultado, req.body.vigencia_examen)).substr(0, 10)
                },
                $push:{
                    observaciones: obs
                }
            });
        }
        else{
            result = await db.collection('resultados').updateOne({_id: ObjectID(id)}, {
                $set:{
                    estado: "Revisado",
                    estado_archivo: req.body.estado_archivo,
                    estado_resultado: req.body.estado_resultado,
                    fecha_resultado: req.body.fecha_resultado,
                    hora_resultado: req.body.hora_resultado,
                },
                $push:{
                    observaciones: obs
                }
            });
        }
    }
    else{
        obs.estado = req.body.estado_archivo
        result = await db.collection('resultados').updateOne({_id: ObjectID(id)}, {
            $set:{
                estado_archivo: req.body.estado_archivo,
            },
            $push:{
                observaciones: obs
            }
        });
    }
    res.json(result)
})

export default router;
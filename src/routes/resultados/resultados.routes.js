import { Router } from "express";
import { calculate } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getFechaVencExam } from "../../functions/fechaVencExamen";
import { getDate } from "../../functions/getDateNow";
import { getDateEspecific } from "../../functions/getEspecificDate";

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

//SUBIR ARCHIVO RESUILTADO
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

    // console.log('datos chalo', req.body)

    if(req.body.estado_archivo == 'Aprobado'){
        obs.estado = req.body.estado_archivo
        if(req.body.estado_resultado == 'Aprobado con Obs' || req.body.estado_resultado == 'Aprobado'){
            result = await db.collection('resultados').findOneAndUpdate({_id: ObjectID(id)}, {
                $set:{
                    estado: "Revisado",
                    estado_archivo: req.body.estado_archivo,
                    estado_resultado: req.body.estado_resultado,
                    vigencia_examen: req.body.vigencia_examen,
                    fecha_resultado: req.body.fecha_resultado,
                    hora_resultado: req.body.hora_resultado,
                    condicionantes: req.body.condicionantes,
                    fecha_vencimiento_examen:  getDateEspecific(getFechaVencExam(req.body.fecha_resultado, req.body.vigencia_examen)).substr(0, 10)
                },
                $push:{
                    observaciones: obs
                }
            });
        }
        else{
            result = await db.collection('resultados').findOneAndUpdate({_id: ObjectID(id)}, {
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
        //insercion de la facturación
        // console.log('result para sacar cod', result)
        let codAsis = result.value.codigo;
        let gi = await db.collection('gi').findOne({rut: result.value.rut_cp, "categoria": "Empresa/Organización"})
        var isOC = ''
        let estado_archivo = ''
        let estado = ''
        // console.log('gi', gi.orden_compra)
        // if(gi){
        //     isOC = gi.orden_compra;
        //     (isOC == 'Si') ? estado_archivo = 'Sin Documento' : estado_archivo = 'No Requiere OC';
        // }
        // else{
        //     isOC = "No"
        //     estado_archivo = 'No Requiere OC'
        // }
        if(gi){
            isOC = gi.orden_compra;
            if(isOC == 'Si'){
                estado_archivo = 'Sin Documento',
                estado = 'Ingresado'
            }
            else{
                estado = 'En Facturacion',
                estado_archivo = 'Sin Documento'
            }
            // (isOC == 'Si') ? estado_archivo = 'Sin Documento' : estado_archivo = 'No Requiere OC';
        }
        else{
            isOC = "No"
            estado = 'En Facturacion',
            estado_archivo = 'Sin Documento'
        }
        // console.log('resultado', result)
        if(result){
            result = await db.collection('facturaciones').insertOne({
                codigo: codAsis.replace('RES', 'FAC'),
                nombre_servicio: result.value.nombre_servicio,
                id_GI_personalAsignado: result.value.id_GI_personalAsignado,
                faena_seleccionada_cp: result.value.faena_seleccionada_cp,
                valor_servicio: result.value.valor_servicio,
                rut_cp: result.value.rut_cp,
                razon_social_cp: result.value.razon_social_cp,
                rut_cs: result.value.rut_cs,
                razon_social_cs: result.value.razon_social_cs,
                lugar_servicio: result.value.lugar_servicio,
                sucursal: result.value.sucursal,
                condicionantes: result.value.condicionantes,
                vigencia_examen: result.value.vigencia_examen,
                oc: isOC,
                archivo_oc: null,
                fecha_oc: "",
                hora_oc: "",
                nro_oc: "",
                observacion_oc: [],
                observacion_factura: [],
                estado: estado,
                estado_archivo: estado_archivo,
                fecha_facturacion: "",
                nro_factura: "",
                archivo_factura: null,
                monto_neto: 0,
                porcentaje_impuesto: "",
                valor_impuesto: 0,
                sub_total: 0,
                exento: 0,
                descuento: 0,
                total: 0
            })
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
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
    const result = await db.collection('gastos').find({}).toArray();
    res.json(result)
});

//INSERT GASTO
router.post('/', async (req, res) =>{
    const db = await connect()
    let newGasto = {}
    const items = await db.collection('gastos').find({}).toArray();

    if(items.length > 0){
        newGasto.codigo = `ASIS-GTS-${YEAR}-${calculate(items[items.length - 1])}`
    }
    else{
        newGasto.codigo = `ASIS-GTS-${YEAR}-00001`
    }
    
    newGasto.fecha = req.body.fecha
    newGasto.categoria_general = req.body.categoria_general
    newGasto.subcategoria_uno = req.body.subcategoria_uno
    newGasto.subcategoria_dos = req.body.subcategoria_dos
    newGasto.descripcion_gasto = req.body.descripcion_gasto
    newGasto.rut_proveedor = req.body.rut_proveedor
    newGasto.razon_social_proveedor = req.body.razon_social_proveedor
    newGasto.requiere_servicio = req.body.requiere_servicio
    newGasto.id_servicio = req.body.id_servicio
    newGasto.servicio = req.body.servicio
    newGasto.tipo_registro = req.body.tipo_registro
    newGasto.tipo_documento = req.body.tipo_documento
    newGasto.nro_documento = req.body.nro_documento
    newGasto.medio_pago = req.body.medio_pago
    newGasto.institucion_bancaria = req.body.institucion_bancaria
    newGasto.inventario = req.body.inventario
    newGasto.cantidad_factor = req.body.cantidad_factor
    newGasto.precio_unitario = req.body.precio_unitario
    newGasto.monto_neto = req.body.monto_neto
    newGasto.impuesto = req.body.impuesto
    newGasto.monto_exento = req.body.monto_exento
    newGasto.monto_total = req.body.monto_total
    newGasto.observaciones = req.body.observaciones
    newGasto.archivo_adjunto = req.body.archivo_adjunto
    newGasto.entradas = []

    const result = await db.collection('gastos').insertOne(newGasto)
    res.json(result)
});

//INSERT ENTRADA
router.post('/entrada/:id', async (req, res) =>{
    const { id } = req.params
    const db = await connect()
    let obj = {}
    obj.nombre_proveedor = req.body.nombre_proveedor
    obj.categoria_general = req.body.categoria_general
    obj.subcategoria_uno = req.body.subcategoria_uno
    obj.subcategoria_dos = req.body.subcategoria_dos
    obj.subcategoria_tres = req.body.subcategoria_tres
    obj.codigo_categoria_tres = req.body.codigo_categoria_tres
    obj.detalle = req.body.detalle
    obj.cantidad = req.body.cantidad
    obj.costo_unitario = req.body.costo_unitario
    obj.costo_total = req.body.costo_total

    const result = await db.collection('gastos').updateOne({_id: ObjectID(id)},{
        $push:{
            entradas: obj
        }
    });

    res.json(result);
})

export default router;
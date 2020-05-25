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
    const result = await db.collection('salidas').find({}).toArray();
    res.json(result)
});

//INSERT SALIDA
router.post('/', async (req, res) =>{
    const db = await connect()
    let newSalida = {}
    const items = await db.collection('salidas').find({}).toArray();
    if(items.length > 0){
        newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-${calculate(items[items.length - 1])}`
    }
    else{
        newSalida.codigo = `ASIS-GTS-SAL-${YEAR}-00001`
    }
    newSalida.fecha = req.body.fecha
    newSalida.tipo_salida = req.body.tipo_salida
    newSalida.nro_documento = req.body.nro_documento
    newSalida.usuario = req.body.usuario
    newSalida.categoria_general = req.body.categoria_general
    newSalida.subcategoria_uno = req.body.subcategoria_uno
    newSalida.subcategoria_dos = req.body.subcategoria_dos
    newSalida.subcategoria_tres = req.body.subcategoria_tres
    newSalida.codigo_categoria_tres = req.body.codigo_categoria_tres
    newSalida.descripcion = req.body.descripcion
    newSalida.motivo_salida = req.body.motivo_salida
    newSalida.cantidad = req.body.cantidad
    newSalida.costo_unitario = req.body.costo_unitario
    newSalida.costo_total = req.body.costo_total
    newSalida.precio_venta_unitario = req.body.precio_venta_unitario
    newSalida.ingreso_total = req.body.ingreso_total

    const result = await db.collection('salidas').insertOne(newSalida)
    res.json(result)

})

export default router;
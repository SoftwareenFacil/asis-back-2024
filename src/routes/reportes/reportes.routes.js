import { Router } from "express";
import moment from "moment";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, NOT_EXISTS, NAME_PSICO_PDF, NAME_AVERSION_PDF, ERROR_PDF, OTHER_NAME_PDF, FORMAT_DATE, CURRENT_ROL, COLABORATION_ROL, MONTHS, NUMBER_MONTHS } from "../../constant/var";

//database connection
import { connect } from "../../database";

const router = Router();

//dashboard
router.get('/:anio', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { anio } = req.params;

  try {
    let production = {
      enero: [],
      febrero: [],
      marzo: [],
      abril: [],
      mayo: [],
      junio: [],
      julio: [],
      agosto: [],
      septiembre: [],
      octubre: [],
      noviembre: [],
      diciembre: [],
    };

    //grupos de interes activos
    const activeGIs = await db.collection('gi').find({ activo_inactivo: true }).count();
    //solicitudes totales
    const totalSolicitudes = await db.collection('solicitudes').find({ isActive: true, anio_solicitud: anio}).toArray();
    //resultados totales
    const totalResultados = await db.collection('resultados').find({ isActive: true, fecha_resultado: { $regex: anio } }).toArray();
    //produccion por mes
    const totalReservas = await db.collection('reservas').find({ isActive: true, fecha_reserva: { $regex: anio } }).toArray();
    const totalEvaluaciones = await db.collection('evaluaciones').find({ isActive: true, fecha_evaluacion: { $regex: anio } }).toArray();
    const totalFacturaciones = await db.collection('facturaciones').find({ isActive: true, fecha_facturacion: { $regex: anio } }).toArray();
    const totalPagos = await db.collection('pagos').find({ isActive: true, fecha_pago: { $regex: anio } }).toArray();
    const totalCobranzas = await db.collection('cobranzas').find({ isActive: true, fecha_facturacion: { $regex: anio } }).toArray();

    MONTHS.forEach(month => {
      const auxSolicitudes = totalSolicitudes.reduce((acc, current) => {
        if(!!current && current.fecha_solicitud.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxReservas = totalReservas.reduce((acc, current) => {
        if(!!current && current.fecha_reserva.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxEvaluaciones = totalEvaluaciones.reduce((acc, current) => {
        if(!!current && current.fecha_evaluacion.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxResultados = totalResultados.reduce((acc, current) => {
        if(!!current && current.fecha_resultado.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxFacturaciones = totalFacturaciones.reduce((acc, current) => {
        if(!!current && current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxPagos = totalPagos.reduce((acc, current) => {
        if(!!current && current.fecha_pago.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxCobranzas = totalCobranzas.reduce((acc, current) => {
        if(!!current && current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month]){
          acc = acc + 1;
        }
        return acc
      }, 0);

      production[month].push(auxSolicitudes, auxReservas, auxEvaluaciones, auxResultados, auxFacturaciones, auxPagos, auxCobranzas);
    });
    
    res.status(200).json({
      activeGIs,
      countSolicitudes: totalSolicitudes.length,
      countResultados: totalResultados.length,
      production
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: '', res: null });
  }
  finally{
    conn.close()
  }
});

export default router;
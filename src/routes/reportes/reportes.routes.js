import { Router } from "express";
import moment from "moment";
import { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, NOT_EXISTS, NAME_PSICO_PDF, NAME_AVERSION_PDF, ERROR_PDF, OTHER_NAME_PDF, FORMAT_DATE, CURRENT_ROL, COLABORATION_ROL, MONTHS } from "../../constant/var";

//database connection
import { connect } from "../../database";

const router = Router();

//dashboard
router.get('/:anio', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { anio } = req.params;

  try {
    //grupos de interes activos
    const activeGIs = await db.collection('gi').find({ activo_inactivo: true }).count();
    //solicitudes totales
    const totalSolicitudes = await db.collection('solicitudes').find({ isActive: true, anio_solicitud: anio}).count();
    //resultados totales
    const totalResultados = await db.collection('resultados').find({ isActive: true, fecha_resultado: { $regex: anio } }).count();
    //produccion por mes
    const totalReservas = await db.collection('reservas').find({ isActive: true, fecha_reserva: { $regex: anio } }).toArray();
    const totalEvaluaciones = await db.collection('evaluaciones').find({ isActive: true, fecha_evaluacion: { $regex: anio } }).toArray();
    const totalFacturaciones = await db.collection('facturaciones').find({ isActive: true, fecha_facturacion: { $regex: anio } }).toArray();
    const totalPagos = await db.collection('pagos').find({ isActive: true, fecha_pago: { $regex: anio } }).toArray();
    MONTHS.forEach(month => {
      
    });
    
    res.status(200).json({
      activeGIs,
      totalSolicitudes,
      totalResultados
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
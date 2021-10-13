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
    let production = [
      {
        type: 'solicitudes',
        data: []
      },
      {
        type: 'reservas',
        data: []
      },
      {
        type: 'evaluaciones',
        data: []
      },
      {
        type: 'resultados',
        data: []
      },
      {
        type: 'facturaciones',
        data: []
      },
      {
        type: 'pagos',
        data: []
      },
      {
        type: 'cobranzas',
        data: []
      }
    ]

    let facturacion = [];

    let flujoCaja = [
      {
        type: 'ingresos',
        data: []
      },
      {
        type: 'egresos',
        data: []
      },
      {
        type: 'saldo',
        data: []
      }
    ];

    let rankingFacturacion = [];
    let rankingPagos = [];

    let solicitudesPorSucursal = [];

    //grupos de interes activos
    const activeGIs = await db.collection('gi').find({ activo_inactivo: true }).count();
    //solicitudes totales
    const totalSolicitudes = await db.collection('solicitudes').find({ isActive: true, anio_solicitud: anio }).toArray();
    //resultados totales
    const totalResultados = await db.collection('resultados').find({ isActive: true, fecha_resultado: { $regex: anio } }).toArray();
    //produccion por mes
    const totalReservas = await db.collection('reservas').find({ isActive: true, fecha_reserva: { $regex: anio } }).toArray();
    const totalEvaluaciones = await db.collection('evaluaciones').find({ isActive: true, fecha_evaluacion: { $regex: anio } }).toArray();
    const totalFacturaciones = await db.collection('facturaciones').find({ isActive: true, fecha_facturacion: { $regex: anio } }).toArray();
    const totalPagos = await db.collection('pagos').find({ isActive: true, fecha_pago: { $regex: anio } }).toArray();
    const totalCobranzas = await db.collection('cobranzas').find({ isActive: true, fecha_facturacion: { $regex: anio } }).toArray();

    const totalGastos = await db.collection('gastos').find({ fecha: { $regex: anio } }).toArray();

    //obtener solo los ids de las solicitudes
    const idsSolArray = totalSolicitudes.reduce((acc, current) => {
      acc.push(current.codigo);
      return acc;
    }, []);

    MONTHS.forEach(month => {
      const auxSolicitudes = totalSolicitudes.reduce((acc, current) => {
        if (!!current && current.fecha_solicitud.split('-')[1] === NUMBER_MONTHS[month]) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxReservas = totalReservas.reduce((acc, current) => {
        // const auxSOlAge = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("AGE", "SOL"));
        const auxSOlAge = (idsSolArray.indexOf(current.codigo.replace("AGE", "SOL")) > -1);
        if (!!current && current.fecha_reserva.split('-')[1] === NUMBER_MONTHS[month] && auxSOlAge) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxEvaluaciones = totalEvaluaciones.reduce((acc, current) => {
        // const auxEvaSol = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("EVA", "SOL"));
        const auxEvaSol = (idsSolArray.indexOf(current.codigo.replace("EVA", "SOL")) > -1);
        if (!!current && current.fecha_evaluacion.split('-')[1] === NUMBER_MONTHS[month] && auxEvaSol) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxResultados = totalResultados.reduce((acc, current) => {
        // const auxSolRes = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("RES", "SOL"));
        const auxSolRes = (idsSolArray.indexOf(current.codigo.replace("RES", "SOL")) > -1);
        if (!!current && current.fecha_resultado.split('-')[1] === NUMBER_MONTHS[month] && auxSolRes) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxFacturaciones = totalFacturaciones.reduce((acc, current) => {
        // const auxSolFac = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("FAC", "SOL"));
        const auxSolFac = (idsSolArray.indexOf(current.codigo.replace("FAC", "SOL")) > -1);
        if (!!current && current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month] && auxSolFac) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxPagos = totalPagos.reduce((acc, current) => {
        // const auxSolPag = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("PAG", "SOL"));
        const auxSolPag = (idsSolArray.indexOf(current.codigo.replace("PAG", "SOL")) > -1);
        if (!!current && current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month] && auxSolPag) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      const auxCobranzas = totalCobranzas.reduce((acc, current) => {
        // const auxSolCob = totalSolicitudes.find(sol => sol.codigo === current.codigo.replace("COB", "SOL"));
        const auxSolCob = (idsSolArray.indexOf(current.codigo.replace("COB", "SOL")) > -1);
        if (!!current && current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month] && auxSolCob) {
          acc = acc + 1;
        }
        return acc
      }, 0);

      production[0].data.push(auxSolicitudes);
      production[1].data.push(auxReservas);
      production[2].data.push(auxEvaluaciones);
      production[3].data.push(auxResultados);
      production[4].data.push(auxFacturaciones);
      production[5].data.push(auxPagos);
      production[6].data.push(auxCobranzas);

      //facturaciones
      const auxFacturacionesTotales = totalFacturaciones.reduce((acc, current) => {
        if (current.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[month] && current?.total && current.estado === 'Facturado' && current.estado_archivo === 'Aprobado') {
          acc = acc + current.total
        }
        return acc;
      }, 0);

      facturacion.push(auxFacturacionesTotales)

      //flujo caja
      const auxIngresos = totalPagos.reduce((acc, current) => {
        if (current?.valor_cancelado && current.valor_cancelado > 0 && current?.fecha_pago.split('-')[1] === NUMBER_MONTHS[month]) {
          acc = acc + current.valor_cancelado;
        }

        return acc;
      }, 0);

      const auxEgresos = totalGastos.reduce((acc, current) => {
        if (current?.fecha.split('-')[1] === NUMBER_MONTHS[month]) {
          acc = acc + current.total;
        }

        return acc;
      }, 0);

      flujoCaja[0].data.push(auxIngresos);
      flujoCaja[1].data.push(auxEgresos);
      flujoCaja[2].data.push(auxIngresos - auxEgresos);
    });

    //ranking facturacion
    const auxRankingFacturaciones = [];
    totalFacturaciones.forEach(element => {
      if(element?.estado === "Facturado" && element?.estado_archivo === 'Aprobado'){
        const founded = auxRankingFacturaciones.find((facturacion) => facturacion.rut === element.rut_cp);
        if(founded){
          auxRankingFacturaciones.forEach((ranking, index) => {
            if(ranking.rut === founded.rut){
              auxRankingFacturaciones[index] = {
                ...founded,
                quantity: founded.quantity + element.total  
              }
            }
          });
        }
        else{
          auxRankingFacturaciones.push({
            rut: element.rut_cp,
            name: element.razon_social_cp,
            quantity: element.total
          });
        }
      }
    });

    //ranking deudas
    const auxRankingPagos = []
    totalPagos.forEach(element => {
      if(element.estado === 'Pago Parcial'){
        const aux = auxRankingPagos.find(pago => pago.rut === element.rut_cp);
        if(aux){
          auxRankingPagos.forEach((ranking, index) => {
            if(ranking.rut === aux.rut){
              auxRankingPagos[index] = {
                ...aux,
                quantity: aux.quantity + (element.valor_servicio - element.valor_cancelado)
              }
            }
          });
        }
        else{
          auxRankingPagos.push({
            rut: element.rut_cp,
            name:element.razon_social_cp,
            quantity: element.valor_servicio - element.valor_cancelado
          });
        }
      }
    });

    rankingFacturacion = auxRankingFacturaciones.sort((a, b) => {
      if (a.quantity > b.quantity) {
        return -1;
      }
      if (a.quantity < b.quantity) {
        return 1;
      }
      return 0;
    });

    rankingPagos = auxRankingPagos.sort((a, b) => {
      if (a.quantity > b.quantity) {
        return -1;
      }
      if (a.quantity < b.quantity) {
        return 1;
      }
      return 0;
    });

    //solicitudes por sucursal
    let totalSucursales = [{ type: [], data: [] }]
    const solicitudesSucursal = totalSolicitudes.reduce((acc, current) => {
      const aux = acc.find(element => element.type === current.sucursal);
      if(!aux){
        acc.push({
          type: current.sucursal,
          data: 1
        });
      }
      else{
        const auxAcc = acc.map(obj => {
          if(obj.type === aux.type){
            return {
              type: obj.type,
              data: obj.data + 1
            }
          }
          else{
            return obj
          }
        });

        acc = auxAcc;
      }

      return acc;
    }, []);

    solicitudesSucursal.forEach(solicitud => {
      totalSucursales[0].type.push(solicitud.type)
      totalSucursales[0].data.push(solicitud.data)
    });


    return res.status(200).json({
      err: null,
      msg: 'Reportes Generados',
      res: {
        activeGIs,
        countRequests: totalSolicitudes.length,
        countResults: totalResultados.length,
        production,
        invoices: facturacion,
        cashFlow: flujoCaja,
        rankingInvoices: rankingFacturacion.slice(0, 9),
        rankingPayments: rankingPagos.slice(0, 9),
        totalOffices: totalSucursales
      }
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: '', res: null });
  }
  finally {
    conn.close()
  }
});

export default router;
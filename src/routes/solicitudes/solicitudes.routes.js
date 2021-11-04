import { Router, request } from "express";
import { calculate, generateNewCodeRequest, generateNewCodeRequestWithYear } from "../../functions/NewCode";
import { getYear } from "../../functions/getYearActual";
import { getDate } from "../../functions/getDateNow";
import excelToJson from "../../functions/insertManyGis/excelToJson";
import sendinblue from "../../libs/sendinblue/sendinblue";
import { uploadFileToS3 } from "../../libs/aws";
import { v4 as uuid } from "uuid";
// const addDays = require("add-days");
import moment from "moment";
moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
  weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
}
);

import { verifyToken } from "../../libs/jwt";

import {
  MESSAGE_UNAUTHORIZED_TOKEN,
  UNAUTHOTIZED,
  ERROR_MESSAGE_TOKEN,
  AUTHORIZED, ERROR,
  SUCCESSFULL_INSERT,
  SUCCESSFULL_UPDATE,
  DELETE_SUCCESSFULL
} from "../../constant/text_messages";

import multer from "../../libs/multer";

const router = Router();
const YEAR = getYear();
var fs = require("fs");

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";
import { NOT_EXISTS, AWS_BUCKET_NAME, FORMAT_DATE, SB_TEMPLATE_INSERT_REQUEST_ID, SB_TEMPLATE_CONFIRM_REQUEST_ID, CURRENT_ROL, COLABORATION_ROL, NUMBER_MONTHS, EXCEL_CONSOLIDATED_REQUESTS, COLUMNS_NAME_REQUESTS, COLUMNS_NAME_RESERVATIONS, COLUMNS_NAME_EVALUATIONS, COLUMNS_NAME_RESULTS, SB_TEMPLATE_SEND_CONSOLIDATED_RESULTS, SB_TEMPLATE_SEND_CONSOLIDATE_REQUESTS, COLUMNS_NAME_INVOICES, COLUMNS_NAME_PAYMENTS, COLUMNS_NAME_REQUESTPAYMENTS } from "../../constant/var";
import { mapRequestsToInsert, addCodeRequest } from "../../functions/requestInsertMassive";
import createAnualExcel from "../../functions/createExcel/createExcelAnualProcesos";
import MilesFormat from "../../functions/formattedPesos";

//SELECT
router.get("/", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db.collection("solicitudes").find({ isActive: true }).toArray();
    return res.status(200).json({
      err: null,
      msg: 'Solicitudes obtenidas',
      res: result
    });
  } catch (error) {
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
});

//GENERATE CONSOLIDATED EXCEL SYSTEM
router.post("/consolidated/:anio/:mes", async (req, res) => {
  const { anio, mes } = req.params;
  const { emails } = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');
  try {

    console.log([anio, mes, emails])

    let columnsName = [];
    let aux;

    const solicitudes = await db.collection("solicitudes").find({ anio_solicitud: anio, isActive: true }).toArray();
    const reservas = await db.collection("reservas").find({ fecha_reserva: { $regex: anio }, isActive: true }).toArray();
    const evaluaciones = await db.collection("evaluaciones").find({ fecha_evaluacion: { $regex: anio }, isActive: true }).toArray();
    const resultados = await db.collection("resultados").find({ fecha_resultado: { $regex: anio }, isActive: true }).toArray();
    const profesionalesAsignados = await db.collection("gi")
      .find({ categoria: "Persona Natural", activo_inactivo: true, $or: [{ grupo_interes: 'Empleados' }, { grupo_interes: 'Colaboradores' }] })
      .toArray();

    const facturaciones = await db.collection('facturaciones').find({ fecha_facturacion: { $regex: anio }, isActive: true }).toArray();
    const pagos = await db.collection('pagos').find({ fecha_facturacion: { $regex: anio }, isActive: true }).toArray();
    const cobranza = await db.collection('cobranza').find({ fecha_facturacion: { $regex: anio }, isActive: true }).toArray();

    if (!solicitudes) return res.status(404).json({ err: 98, msg: 'No se encontraron solicitudes', res: [] });

    const auxSolicitudes = solicitudes.reduce((acc, solicitud) => {
      const aux = profesionalesAsignados.find(profesional => solicitud.id_GI_PersonalAsignado === `${profesional._id}`);
      const auxHasMonth = solicitud.fecha_solicitud.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()];
      if(auxHasMonth){
        acc.push({
          ...solicitud,
          monto_neto: `$ ${MilesFormat(solicitud.monto_neto || 0)}`,
          porcentaje_impuesto: `$ ${solicitud.porcentaje_impuesto}`,
          valor_impuesto: `$ ${solicitud.valor_impuesto}`,
          monto_total: `$ ${MilesFormat(solicitud.monto_total || 0)}`,
          exento: `$ ${MilesFormat(solicitud.exento)}`,
          observacion_solicitud: !!solicitud.observacion_solicitud.length ? solicitud.observacion_solicitud[solicitud.observacion_solicitud.length - 1].obs : '',
          profesional_asignado: !!aux ? aux.razon_social : ''
        })
      }
      return acc;
    }, []);

    const auxReservas = !!reservas ? reservas.reduce((acc, reserva) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === reserva.codigo.replace("AGE", "SOL"));
      const auxHasMonth = reserva.fecha_reserva.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      if (auxHasMonth && aux) {
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...reserva
        })
      }
      return acc;
    }, []) : [];

    const auxEvaluaciones = !!evaluaciones ? evaluaciones.reduce((acc, evaluacion) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === evaluacion.codigo.replace("EVA", "SOL"));
      const auxHasMonth = evaluacion.fecha_evaluacion.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      if (auxHasMonth && aux) {
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...evaluacion
        })
      }
      return acc;
    }, []) : [];

    const auxResultados = !!resultados ? resultados.reduce((acc, resultado) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === resultado.codigo.replace("RES", "SOL"));
      const auxHasMonth = resultado.fecha_resultado.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      // const aux = resultado.fecha
      // if (aux) {
      //   acc.push({
      //     codigo_solicitud: aux.codigo,
      //     ...resultado
      //   })
      // }
      if(aux && auxHasMonth){
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...resultado
        })
      }
      return acc;
    }, []) : [];

    //facturacion, pagos y cobranzas
    const auxFacturaciones = !!facturaciones ? facturaciones.reduce((acc, facturacion) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === facturacion.codigo.replace("FAC", "SOL"));
      const auxHasMonth = facturacion.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      // if(aux){
      //   acc.push({
      //     codigo_solicitud: aux.codigo,
      //     ...facturacion,
      //     monto_neto: `$ ${MilesFormat(facturacion.monto_neto)}`,
      //     porcentaje_impuesto: `${facturacion.porcentaje_impuesto}%`,
      //     valor_impuesto: `$ ${MilesFormat(facturacion.valor_impuesto)}`,
      //     sub_total: `$ ${MilesFormat(facturacion.sub_total)}`,
      //     exento: `$ ${MilesFormat(facturacion.exento)}`,
      //     descuento: `$ ${MilesFormat(facturacion.descuento)}`,
      //     total: `$ ${MilesFormat(facturacion.total)}`,
      //   });
      // }
      if(auxHasMonth && aux){
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...facturacion,
          monto_neto: `$ ${MilesFormat(facturacion.monto_neto)}`,
          porcentaje_impuesto: `${facturacion.porcentaje_impuesto}%`,
          valor_impuesto: `$ ${MilesFormat(facturacion.valor_impuesto)}`,
          sub_total: `$ ${MilesFormat(facturacion.sub_total)}`,
          exento: `$ ${MilesFormat(facturacion.exento)}`,
          descuento: `$ ${MilesFormat(facturacion.descuento)}`,
          total: `$ ${MilesFormat(facturacion.total)}`,
        });
      }
      return acc;
    }, []) : []

    const auxPagos = !!pagos ? pagos.reduce((acc, pago) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === pago.codigo.replace("PAG", "SOL"));
      const auxHasMonth = pago.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      // if(aux){
      //   acc.push({
      //     codigo_solicitud: aux.codigo,
      //     ...pago,
      //     dias_credito: `${pago.dias_credito}`,
      //     valor_servicio: `$ ${MilesFormat(pago.valor_servicio)}`,
      //     valor_cancelado: `$ ${MilesFormat(pago.valor_cancelado)}`
      //   });
      // }
      if(auxHasMonth && aux){
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...pago,
          dias_credito: `${pago.dias_credito}`,
          valor_servicio: `$ ${MilesFormat(pago.valor_servicio)}`,
          valor_cancelado: `$ ${MilesFormat(pago.valor_cancelado)}`
        });
      }
      return acc;
    }, []) : []

    const auxCobranzas = !!cobranza ? cobranza.reduce((acc, cobranza) => {
      const aux = solicitudes.find(solicitud => solicitud.codigo === cobranza.codigo.replace("COB", "SOL"));
      const auxHasMonth = cobranza.fecha_facturacion.split('-')[1] === NUMBER_MONTHS[mes.toLowerCase()]
      // if (aux) {
      //   acc.push({
      //     codigo_solicitud: aux.codigo,
      //     ...cobranza,
      //     dias_credito: `${cobranza.dias_credito}`,
      //     valor_servicio: `$ ${MilesFormat(cobranza.valor_servicio)}`,
      //     valor_cancelado: `$ ${MilesFormat(cobranza.valor_cancelado)}`,
      //     valor_deuda: `$ ${MilesFormat(cobranza.valor_deuda)}`
      //   });
      // }
      if(auxHasMonth && aux){
        acc.push({
          codigo_solicitud: aux?.codigo || '',
          ...cobranza,
          dias_credito: `${cobranza.dias_credito}`,
          valor_servicio: `$ ${MilesFormat(cobranza.valor_servicio)}`,
          valor_cancelado: `$ ${MilesFormat(cobranza.valor_cancelado)}`,
          valor_deuda: `$ ${MilesFormat(cobranza.valor_deuda)}`
        });
      }
      return acc;
    }, []) : []

    const pdfname = `${EXCEL_CONSOLIDATED_REQUESTS}_${uuid()}.xlsx`;

    console.log('solicitudes 1', auxSolicitudes[0]);
    console.log('solicitudes 2', auxSolicitudes[1]);
    console.log('solicitudes 3', auxSolicitudes[2]);
    console.log('solicitudes 4', auxSolicitudes[3]);

    console.log('auxSolicitudes 1', auxSolicitudes[0]);
    console.log('auxSolicitudes 2', auxSolicitudes[2]);
    console.log('auxSolicitudes 3', auxSolicitudes[3]);
    console.log('auxSolicitudes 4', auxSolicitudes[4]);

    console.log('resveras', auxReservas.length);
    console.log('evaluaciones', auxEvaluaciones.length);
    console.log('resultados', auxResultados.length);
    console.log('facturaciones', auxFacturaciones.length);
    console.log('pagos', auxPagos.length);
    console.log('cobranzas', auxCobranzas.length);

    createAnualExcel(
      mes,
      pdfname,
      {
        columnsNameRequests: COLUMNS_NAME_REQUESTS,
        colummnsNameReservations: COLUMNS_NAME_RESERVATIONS,
        columnsNameEvaluations: COLUMNS_NAME_EVALUATIONS,
        columnsNameResults: COLUMNS_NAME_RESULTS,
        columnsNameInvoices: COLUMNS_NAME_INVOICES,
        columnsNamePayments: COLUMNS_NAME_PAYMENTS,
        columnsNameRequestPayments: COLUMNS_NAME_REQUESTPAYMENTS
      },
      {
        rowsDataRequests: auxSolicitudes,
        rowsDataReservations: auxReservas,
        rowsDataEvaluations: auxEvaluaciones,
        rowsDataResults: auxResultados,
        rowsDataInvoices: auxFacturaciones,
        rowsDataPayments: auxPagos,
        rowsDataRequestPayment: auxCobranzas
      },
      {
        headerKeyColorRequests: '#334ACD',
        headerKeyColorReservations: '#334ACD',
        headerKeyColorEvaluations: '#334ACD',
        headerKeyColorResults: '#334ACD',
        headerKeyCOlorInvoices: '#334ACD',
        headerKeyColorPayments: '#334ACD',
        headerKeyColorRequestPayments: '#334ACD'
      },
      {
        headersColorRequests: '#334ACD',
        headersColorReservations: '#B534BB',
        headerColorEvaluations: '#79BD35',
        headerColorResults: '#7B8497',
        headerColorInvoices: '#581845',
        headerColorPayments: '#DC4706',
        headerColorRequestPayment: '#9AA587'
      },
      {
        fontColorRequests: 'white',
        fontColorReservations: 'white',
        fontColorEvaluations: 'white',
        fontColorResults: 'white',
        fontColorInvoices: 'white',
        fontColorPayments: 'white',
        fontColorRequestPayments: 'white'
      }
    );


    console.log(auxSolicitudes[0])

    setTimeout(() => {
      const excelContent = fs.readFileSync(`uploads/${pdfname}`);

      const excelParams = {
        Bucket: AWS_BUCKET_NAME,
        Body: excelContent,
        Key: pdfname,
        ContentType: 'application/vnd.ms-excel'
      }

      uploadFileToS3(excelParams);

      sendinblue(
        emails,
        SB_TEMPLATE_SEND_CONSOLIDATE_REQUESTS,
        {
          CODIGO_SOLICITUD: ''
        },
        [
          {
            content: Buffer.from(excelContent).toString('base64'), // Should be publicly available and shouldn't be a local file
            name: `${pdfname}.xlsx`
          }
        ]
      );

      try {
        fs.unlinkSync(`uploads/${pdfname}`);
      } catch (error) {
        console.log('No se ha podido eliminar el archivo ', error)
      }

    }, 5000);

    return res.status(200).json({ err: null, msg: 'Informe generado correctamente', res: [...solicitudes] });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
});

router.post('/sendmail', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const data = req.body;
  try {
    // console.log(data)
    const gi = await db
      .collection("gi")
      .findOne({ _id: ObjectID(data.id_GI_Principal) });

    const clienteSecundario = await db
      .collection("gi")
      .findOne({ _id: ObjectID(data.id_GI_Secundario) });

    if (data.estado === 'Ingresado') {
      sendinblue(
        data.emailsArray,
        SB_TEMPLATE_INSERT_REQUEST_ID,
        {
          CODIGO_SOLICITUD: data.codigo,
          RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
          FECHA_SOLICITUD: data.fecha_solicitud,
          HORA_SOLICITUD: data.hora_solicitud,
          CATEGORIA_SOLICITUD: data.categoria1,
          NOMBRE_SERVICIO_SOLICITUD: data.nombre_servicio,
          TIPO_SERVICIO_SOLICITUD: data.tipo_servicio,
          LUGAR_SERVICIO_SOLICITUD: data.lugar_servicio,
          SUCURSAL_SOLICITUD: data.sucursal,
          RUT_CLIENTE_SECUNDARIO: clienteSecundario?.rut || '',
          NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario?.razon_social || ''
        }
      );
    }
    if (data.estado === 'Confirmado') {
      sendinblue(
        data.emailsArray,
        SB_TEMPLATE_CONFIRM_REQUEST_ID,
        {
          CODIGO_SOLICITUD: data.codigo,
          RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
          FECHA_SOLICITUD: data.fecha_solicitud,
          HORA_SOLICITUD: data.hora_solicitud,
          CATEGORIA_SOLICITUD: data.categoria1,
          NOMBRE_SERVICIO_SOLICITUD: data.nombre_servicio,
          SUCURSAL_SOLICITUD: data.sucursal,
          FECHA_CONFIRMACION_SOLICITUD: data.fecha_confirmacion,
          HORA_CONFIRMACION_SOLICITUD: data.hora_confirmacion,
          MEDIO_CONFIRMACION_SOLICITUD: data.medio_confirmacion,
          OBSERVACION_CONFIRMACION_SOLICITUD: data.observacion_solicitud[data.observacion_solicitud.length - 1].obs || '',
          RUT_CLIENTE_SECUNDARIO: clienteSecundario?.rut || '',
          NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario?.razon_social || ''
        }
      );
    }

    return res.status(200).json({ err: null, msg: 'Email enviado satisfactoriamente', res: [] })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null })
  } finally {
    conn.close();
  }
})

//SELECT WITH PAGINATION
router.post("/pagination", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    // const countSol = await db.collection("solicitudes").find({...isRolSolicitudes(dataToken.rol, dataToken.id), isActive: true}).count();
    let countSol;
    const dataToken = await verifyToken(token);
    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countSol = await db.collection("solicitudes").find({ rut_CP: dataToken.rut, isActive: true }).count();
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      console.log('herer')
      countSol = await db.collection("solicitudes").find({ id_GI_PersonalAsignado: dataToken.id, isActive: true }).count();
    }
    else {
      countSol = await db.collection("solicitudes").find({ isActive: true }).count();
    }
    // const result = await dbMONGO_DEV
    //   .collection("solicitudes")
    //   .find({...isRolSolicitudes(dataToken.rol, dataToken.id), isActive: true})
    //   .skip(skip_page)
    //   .limit(nPerPage)
    //   .sort({ codigo: -1 })
    //   .toArray();
    let result;

    console.log(dataToken)

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      result = await db
        .collection("solicitudes")
        .find({ rut_CP: dataToken.rut, isActive: true })
        .skip(skip_page)
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .limit(nPerPage)
        .toArray();
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      result = await db
        .collection("solicitudes")
        .find({ id_GI_PersonalAsignado: ObjectID(dataToken.id), isActive: true })
        .skip(skip_page)
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .limit(nPerPage)
        .toArray();
    }
    else {
      result = await db
        .collection("solicitudes")
        .find({ isActive: true })
        .skip(skip_page)
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .limit(nPerPage)
        .toArray();
    }

    // console.log(
    //   new Date(moment(result[0].fecha_solicitud, FORMAT_DATE)).getTime()
    // )

    // console.log(result.map(e => `${e.fecha_solicitud}`))

    // const resultSorted = result.sort((a, b) => {
    //   return a.estado < b.estado ? -1 : a.estado > b.estado ? 1 : 0
    // })

    // const resultSorted = result.sort((a, b) => {
    //   return new Date(moment(a.fecha_solicitud, FORMAT_DATE)).getTime() > new Date(moment(b.fecha_solicitud, FORMAT_DATE)).getTime()
    //     ? -1
    //     : new Date(moment(a.fecha_solicitud, FORMAT_DATE)).getTime() < new Date(moment(b.fecha_solicitud, FORMAT_DATE)).getTime() ? 1 : 0
    // })

    // console.log(a)

    return res.status(200).json({
      total_items: countSol,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSol / nPerPage + 1),
      solicitudes: result,
      // solicitudes: resultSorted
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      solicitudes: null,
      err: String(error)
    });
  } finally {
    conn.close()
  }
});

//SELECT BY DATE (DAY, MONTH, YEAR)
router.post("/date", async (req, res) => {
  const { month = null, year = null } = req.body;
  const conn = await connect();
  const db = conn.db('asis-db');
  const token = req.headers['x-access-token'];

  try {
    let result = []
    const dataToken = await verifyToken(token);

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      if (!!month && !!year) {
        result = await db.collection('solicitudes').find({ rut_CP: dataToken.rut, mes_solicitud: month, anio_solicitud: year, isActive: true }).toArray();
      }
      if (!!month && !year) {
        result = await db.collection('solicitudes').find({ rut_CP: dataToken.rut, mes_solicitud: month, isActive: true }).toArray();
      }
      if (!month && !!year) {
        result = await db.collection('solicitudes').find({ rut_CP: dataToken.rut, anio_solicitud: year, isActive: true }).toArray();
      }
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      if (!!month && !!year) {
        result = await db.collection('solicitudes').find({ id_GI_PersonalAsignado: ObjectID(dataToken.id), mes_solicitud: month, anio_solicitud: year, isActive: true }).toArray();
      }
      if (!!month && !year) {
        result = await db.collection('solicitudes').find({ id_GI_PersonalAsignado: ObjectID(dataToken.id), mes_solicitud: month, isActive: true }).toArray();
      }
      if (!month && !!year) {
        result = await db.collection('solicitudes').find({ id_GI_PersonalAsignado: ObjectID(dataToken.id), anio_solicitud: year, isActive: true }).toArray();
      }
    }
    else {
      if (!!month && !!year) {
        result = await db.collection('solicitudes').find({ mes_solicitud: month, anio_solicitud: year, isActive: true }).toArray();
      }
      if (!!month && !year) {
        result = await db.collection('solicitudes').find({ mes_solicitud: month, isActive: true }).toArray();
      }
      if (!month && !!year) {
        result = await db.collection('solicitudes').find({ anio_solicitud: year, isActive: true }).toArray();
      }
    }

    // console.log([month, year, result.length])

    return res.status(200).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 1,
      solicitudes: result,
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      solicitudes: null,
      err: String(error)
    });
  } finally {
    conn.close()
  }
});

//BUSCAR POR RUT O NOMBRE
router.post("/buscar", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { identificador, filtro, headFilter, pageNumber, nPerPage } = req.body;
  const skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;

  console.log([identificador, filtro, headFilter, pageNumber, nPerPage])
  const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  let rutFiltrado;

  rutFiltrado = filtro;

  if (identificador === 1 && filtro.includes("k")) {
    rutFiltrado.replace("k", "K");
  };

  const rexExpresionFiltro = new RegExp(rutFiltrado, "i");

  let result;
  let countSol;

  try {

    // if (dataToken.rol === 'Clientes') {
    //   countSol = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_Principal: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else if (dataToken.rol === 'Colaboradores') {
    //   countSol = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }
    // else {
    //   countSol = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .count();

    //   result = await db
    //     .collection("solicitudes")
    //     .find({ [headFilter]: rexExpresionFiltro, isActive: true })
    //     .skip(skip_page)
    //     .limit(nPerPage)
    //     .toArray();
    // }

    if (token && !!dataToken && dataToken.rol === CURRENT_ROL) {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, rut_CP: dataToken.rut, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, rut_CP: dataToken.rut, isActive: true })
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else if (token && !!dataToken && dataToken.rol === COLABORATION_ROL) {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, id_GI_PersonalAsignado: dataToken.id, isActive: true })
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }
    else {
      countSol = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .count();

      result = await db
        .collection("solicitudes")
        .find({ [headFilter]: rexExpresionFiltro, isActive: true })
        .sort({ fecha_solicitud_format: -1, estado: -1 })
        .skip(skip_page)
        .limit(nPerPage)
        .toArray();
    }


    return res.status(200).json({
      total_items: countSol,
      pagina_actual: pageNumber,
      nro_paginas: parseInt(countSol / nPerPage + 1),
      solicitudes: result,
    });

  } catch (error) {
    return res.status(500).json({
      total_items: 0,
      pagina_actual: 1,
      nro_paginas: 0,
      solicitudes: null,
      err: String(error)
    });
  } finally {
    conn.close()
  }
});

//SELECT REQUESTS TO CONFIRM
router.get('/ingresadas', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const result = await db.collection('solicitudes').find({ estado: 'Ingresado' }).toArray();

    return res.status(200).json({
      err: null,
      msg: 'Solicitudes encontradas',
      res: result
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: String(error),
      msg: 'No se ha podido cargar las solicitudes',
      res: null
    });
  } finally {
    conn.close()
  }
});

//SELECT FIELDS TO CONFIRM SOLICITUD
router.get("/mostrar/:id", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const { id } = req.params;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  try {
    const resultSol = await db
      .collection("solicitudes")
      .findOne({ _id: ObjectID(id) });
    const resultGI = await db
      .collection("gi")
      .findOne({ _id: ObjectID(resultSol.id_GI_Principal) });

    resultSol.email_gi = resultGI.email_central !== null ? resultGI.email_central : '';

    return res.status(200).json({ err: null, msg: '', res: resultSol });
  } catch (error) {
    return res.status(500).json({ err: String(error), msg: '', res: null });
  } finally {
    conn.close()
  }
});

//SELECT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const conn = await connect();
  const db = conn.db('asis-db');
  try {
    const result = await db.collection("solicitudes").findOne({ _id: ObjectID(id), isActive: true });
    const { observacion_solicitud, ...restOfData } = result;
    return res.status(200).json({
      err: null,
      msg: '',
      res: { ...restOfData, observacion_solicitud: !!observacion_solicitud.length ? observacion_solicitud[observacion_solicitud.length - 1].obs : '' }
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: '', res: null });
  } finally {
    conn.close()
  }
});

//INSERT
router.post("/", multer.single("archivo"), async (req, res) => {

  const conn = await connect();
  const db = conn.db('asis-db');
  let newSolicitud = JSON.parse(req.body.data);
  const nuevaObs = newSolicitud.observacion_solicitud;

  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  const items = await db.collection("solicitudes").find().sort({ codigo: -1 }).limit(1).toArray();

  console.log(items[0])

  if (!items)
    return res.status(401).json({ err: 98, msg: NOT_EXISTS, res: null });

  (items.length > 0)
    ? newSolicitud.codigo = generateNewCodeRequest(items[0].codigo || '')
    : newSolicitud.codigo = `ASIS-SOL-${YEAR}-00001`;

  newSolicitud.observacion_solicitud = [];
  newSolicitud.observacion_solicitud.push({
    obs: nuevaObs,
    fecha: getDate(new Date()),
  });

  newSolicitud.fecha_solicitud_format = new Date(moment(newSolicitud.fecha_solicitud, FORMAT_DATE));

  (req.file)
    ? newSolicitud.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    }
    : newSolicitud.url_file_adjunto = {};

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  try {
    newSolicitud.isActive = true;
    const result = await db.collection("solicitudes").insertOne(newSolicitud);

    //envio correo
    if (result.result.ok === 1 && newSolicitud.sendMail) {
      const gi = await db
        .collection("gi")
        .findOne({ _id: ObjectID(result.ops[0].id_GI_Principal) });

      const clienteSecundario = await db
        .collection("gi")
        .findOne({ _id: ObjectID(result.ops[0].id_GI_Secundario) });

      sendinblue(
        newSolicitud.emailsArray,
        SB_TEMPLATE_INSERT_REQUEST_ID,
        {
          CODIGO_SOLICITUD: newSolicitud.codigo,
          RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
          FECHA_SOLICITUD: newSolicitud.fecha_solicitud,
          HORA_SOLICITUD: newSolicitud.hora_solicitud,
          CATEGORIA_SOLICITUD: newSolicitud.categoria1,
          NOMBRE_SERVICIO_SOLICITUD: newSolicitud.nombre_servicio,
          TIPO_SERVICIO_SOLICITUD: newSolicitud.tipo_servicio,
          LUGAR_SERVICIO_SOLICITUD: newSolicitud.lugar_servicio,
          SUCURSAL_SOLICITUD: newSolicitud.sucursal,
          RUT_CLIENTE_SECUNDARIO: clienteSecundario?.rut || '',
          NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario?.razon_social || ''
        }
      );
    };

    return res.status(200).json({ err: null, msg: SUCCESSFULL_INSERT, res: result });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });

  } finally {
    conn.close()
  }

});

//TEST PARA RECIBIR EXCEL DE INGRESO MASIVO DE SOLICITUDES
router.post("/masivo", multer.single("archivo"), async (req, res) => {
  const data = excelToJson(req.file.path, "PLANTILLA SOL_ASIS");
  const conn = await connect();
  const db = conn.db('asis-db');

  try {

    if (!data || data.length === 0) return res.status(200).json({ err: null, msg: 'No existe datos en el excel ingresado', res: null });

    const companies = await db.collection('gi').find({ activo_inactivo: true, categoria: 'Empresa/Organizacion' }).toArray();
    const naturalPersons = await db.collection('gi').find({ activo_inactivo: true, categoria: 'Persona Natural' }).toArray();

    console.log(companies.length)
    console.log(naturalPersons.length)
    const { requestsMapped, notInserted } = mapRequestsToInsert(data, companies, naturalPersons);
    if (requestsMapped.length == 0) return res.status(200).json({ err: null, msg: 'Ninguna solicitud cumple con los requisitos', res: notInserted });

    const lastRequest = await db
      .collection("gi")
      .find({})
      .sort({ codigo: -1 })
      .limit(1)
      .toArray();

    let lastCode = '';
    const requests = await db.collection("solicitudes").find().sort({ codigo: -1 }).limit(1).toArray();
    console.log(requests[0])

    // const requestsWithCode = addCodeRequest(requestsMapped, requests[0] || '', moment().format('YYYY'));
    let requestsWithCode = [];
    let currentCode = !!requests[0]?.codigo ? requests[0].codigo : 'ASIS-SOL-2020-00000';

    requestsMapped.forEach(element => {
      const aux = generateNewCodeRequestWithYear(currentCode, moment(element.anio_solicitud).format('YYYY') || moment().format('YYYY'))
      requestsWithCode.push({
        codigo: aux,
        ...element
      });
      currentCode = aux;
    });

    await db.collection('solicitudes').insertMany(requestsWithCode);

    return res.status(200).json({
      err: null, msg: 'Solicitudes ingresadas correctamente', res: {
        cant_inserted: requestsWithCode.length,
        cant_notInserted: notInserted.length,
        notInserted
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null,
    });
  } finally {
    conn.close()
  }
});

//EDITAR SOLICITUD
router.put("/:id", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  if (req.file)
    solicitud.url_file_adjunto = {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      type: req.file.mimetype,
    };

  try {

    const existsRequest = await db.collection('solicitudes').findOne({ _id: ObjectID(id) });
    if (!existsRequest) {
      return res.status(400).json({ err: 98, msg: NOT_EXISTS, res: [] });
    };

    const { observacion_solicitud, ...restOfSolcitud } = solicitud;

    await db.collection("solicitudes").updateOne(
      { _id: ObjectID(id), isActive: true },
      {
        $set: {
          ...existsRequest,
          ...restOfSolcitud,
          observacion_solicitud: [
            ...existsRequest.observacion_solicitud,
            {
              obs: observacion_solicitud,
              fecha: getDate(new Date()),
            }
          ],
          fecha_solicitud_format: new Date(moment(existsRequest.fecha_solicitud, FORMAT_DATE))
        },
        // $push: {
        //   observacion_solicitud: {
        // obs: observacion_solicitud,
        // fecha: getDate(new Date()),
        //   },
        // },
      }
    );

    return res.status(200).json({ err: null, msg: SUCCESSFULL_UPDATE, res: [] });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close()
  }
});

//CONFIRMAR SOLICITUD
router.post("/confirmar/:id", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  const solicitud = JSON.parse(req.body.data);
  const { id } = req.params;

  let archivo = {};

  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  const obs = {
    obs: solicitud.observacion_solicitud,
    fecha: getDate(new Date())
  }

  try {
    //obtener mail del cliente principal
    const resultSol = await db.collection("solicitudes").updateOne(
      { _id: ObjectID(id) },
      {
        $set: {
          fecha_confirmacion: solicitud.fecha_solicitud,
          hora_confirmacion: solicitud.hora_solicitud,
          medio_confirmacion: solicitud.medio_confirmacion,
          url_file_adjunto_confirm: {},
          estado: "Confirmado",
        },
        $push: {
          observacion_solicitud: obs,
        },
      }
    );

    if (resultSol.result.ok) {
      const resultGI = await db.collection("gi").updateOne(
        { _id: ObjectID(solicitud.id_GI_Principal) },
        {
          $set: {
            email_central: solicitud.email_central,
          },
        }
      );
      if (resultGI.result.ok) {
        //-------------------------------------CREAR LA RESERVA-----------------------
        const resp = await db
          .collection("solicitudes")
          .findOne({ _id: ObjectID(id) });

        let codigoAsis = resp.codigo;
        codigoAsis = codigoAsis.replace("SOL", "AGE");
        const newReserva = {
          codigo: codigoAsis,
          id_GI_Principal: resp.id_GI_Principal,
          id_GI_Secundario: resp.id_GI_Secundario,
          id_GI_personalAsignado: resp.id_GI_PersonalAsignado,
          faena_seleccionada_cp: resp.faena_seleccionada_cp,
          valor_servicio: resp.monto_total,
          rut_cp: resp.rut_CP,
          razon_social_cp: resp.razon_social_CP,
          rut_cs: resp.rut_cs,
          razon_social_cs: resp.razon_social_cs,
          fecha_reserva: resp.fecha_servicio_solicitado,
          hora_reserva: resp.hora_servicio_solicitado,
          fecha_reserva_fin: resp.fecha_servicio_solicitado_termino,
          hora_reserva_fin: resp.hora_servicio_solicitado_termino,
          jornada: resp.jornada,
          mes: resp.mes_solicitud,
          anio: resp.anio_solicitud,
          nombre_servicio: resp.nombre_servicio,
          lugar_servicio: resp.lugar_servicio,
          sucursal: resp.sucursal,
          url_file_adjunto: archivo,
          observacion: [],
          estado: "Ingresado",
          isActive: true,
          fecha_reserva_format: new Date(moment(resp.fecha_servicio_solicitado, FORMAT_DATE))
        };

        const resulReserva = await db
          .collection("reservas")
          .insertOne(newReserva);

        //envio correo
        if (solicitud.sendMail) {
          const gi = await db
            .collection("gi")
            .findOne({ _id: ObjectID(resp.id_GI_Principal) });

          const clienteSecundario = await db
            .collection("gi")
            .findOne({ _id: ObjectID(resp.id_GI_Secundario) });

          sendinblue(
            solicitud.emailsArray,
            SB_TEMPLATE_CONFIRM_REQUEST_ID,
            {
              CODIGO_SOLICITUD: resp.codigo,
              RAZON_SOCIAL_CP_SOLICITUD: gi.razon_social || '',
              FECHA_SOLICITUD: resp.fecha_solicitud,
              HORA_SOLICITUD: resp.hora_solicitud,
              CATEGORIA_SOLICITUD: resp.categoria1,
              NOMBRE_SERVICIO_SOLICITUD: resp.nombre_servicio,
              SUCURSAL_SOLICITUD: resp.sucursal,
              FECHA_CONFIRMACION_SOLICITUD: solicitud.fecha_solicitud,
              HORA_CONFIRMACION_SOLICITUD: solicitud.hora_solicitud,
              MEDIO_CONFIRMACION_SOLICITUD: solicitud.medio_confirmacion,
              OBSERVACION_CONFIRMACION_SOLICITUD: solicitud.observacion_solicitud,
              RUT_CLIENTE_SECUNDARIO: clienteSecundario?.rut || '',
              NOMBRE_CLIENTE_SECUNDARIO: clienteSecundario?.razon_social || '',
            }
          );
        };

        return res.status(200).json({ err: null, msg: 'Solicitud confirmada', res: resulReserva });
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ err: String(error), msg: '', res: null })
  } finally {
    conn.close()
  }
});

//CONFIRM MANY
router.post("/many", multer.single("archivo"), async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  let dataJson = JSON.parse(req.body.data);
  // const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });

  // const dataToken = await verifyToken(token);

  // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

  // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
  //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

  let new_array = [];
  const obs = {
    obs: dataJson[0].observacion_solicitud,
    fecha: getDate(new Date())
  }
  // let obs = {};
  // obs.obs = dataJson[0].observacion_solicitud;
  // obs.fecha = getDate(new Date());

  dataJson[1].ids.forEach((element) => {
    new_array.push(ObjectID(element));
  });

  //verificar si hay archivo o no
  // if (req.file) {
  //   archivo = {
  //     name: req.file.originalname,
  //     size: req.file.size,
  //     path: req.file.path,
  //     type: req.file.mimetype,
  //   };
  // }
  // else {
  //   archivo = {};
  // }

  try {
    db.collection("solicitudes").updateMany(
      { _id: { $in: new_array } },
      {
        $set: {
          fecha_confirmacion: dataJson[0].fecha_solicitud,
          hora_confirmacion: dataJson[0].hora_solicitud,
          medio_confirmacion: dataJson[0].medio_confirmacion,
          url_file_adjunto_confirm: {},
          estado: "Confirmado",
        },
        $push: {
          observacion_solicitud: obs,
        },
      }
    );

    // se crea el array de objetos para la insercion de reservas
    let resp = "";
    let codigoAsis = "";
    let arrayReservas = [];

    resp = await db
      .collection("solicitudes")
      .find({ _id: { $in: new_array } })
      .toArray();

    resp.forEach((element) => {
      codigoAsis = element.codigo;
      codigoAsis = codigoAsis.replace("SOL", "AGE");
      arrayReservas.push({
        codigo: codigoAsis,
        id_GI_Principal: element.id_GI_Principal,
        id_GI_Secundario: element.id_GI_Secundario,
        id_GI_personalAsignado: element.id_GI_PersonalAsignado,
        faena_seleccionada_cp: element.faena_seleccionada_cp,
        valor_servicio: element.monto_total,
        rut_cp: element.rut_CP,
        razon_social_cp: element.razon_social_CP,
        rut_cs: element.rut_cs,
        razon_social_cs: element.razon_social_cs,
        fecha_reserva: element.fecha_servicio_solicitado,
        hora_reserva: element.hora_servicio_solicitado,
        fecha_reserva_fin: element.fecha_servicio_solicitado_termino,
        hora_reserva_fin: element.hora_servicio_solicitado_termino,
        jornada: element.jornada,
        mes: element.mes_solicitud,
        anio: element.anio_solicitud,
        nombre_servicio: element.nombre_servicio,
        lugar_servicio: element.lugar_servicio,
        sucursal: element.sucursal,
        observacion: [],
        estado: "Ingresado",
        isActive: true,
        fecha_reserva_format: new Date(moment(element.fecha_servicio_solicitado, FORMAT_DATE))
      });
    });

    const resultReserva = await db
      .collection("reservas")
      .insertMany(arrayReservas);

    return res.status(200).json({
      err: null,
      msg: 'Solicitudes confirmadas exitosamente',
      res: resultReserva
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: String(error),
      msg: ERROR,
      res: null
    });
  } finally {
    conn.close()
  }
});

router.post("/fortesting", async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');

  const evaluactions = await db.collection('evaluaciones').find({ estado: 'Evaluado' }).toArray();
  console.log(evaluactions.length)

  let cantEvaluationsIncompletate = [];

  for await (let evaluation of evaluactions) {
    const aux = await db.collection('resultados').findOne({ codigo: evaluation.codigo.replace('EVA', 'RES') });
    if (!aux) {
      cantEvaluationsIncompletate.push(evaluation);
    }
  }

  console.log(cantEvaluationsIncompletate.length);

  for await (let eva of cantEvaluationsIncompletate) {
    await db.collection('evaluaciones').updateOne({ codigo: eva.codigo }, {
      $set: {
        estado_archivo: "Sin Documento",
        estado: "Ingresado",
      }
    });
  }

  // await db.collection('solicitudes').updateMany({}, {
  //   $set: {
  //     estado: 'Ingresado'
  //   }
  // });
  // const result = await db.collection('solicitudes').find({ isActive: true }).toArray();

  // const mapped = result.map((request) => {
  //   return {
  //     ...request,
  //     fecha_solicitud_format: new Date(moment(request.fecha_solicitud, FORMAT_DATE))
  //   }
  // });

  // await db.collection('solicitudes').deleteMany();
  // await db.collection('solicitudes').insertMany(mapped);

  // let duplicated = [];
  // let noDuplicated = [];
  // let DuplicatedCode = [];
  // let DuplicatedID = [];

  // result.forEach(request => {
  //   const aux = noDuplicated.length > 0 ? noDuplicated.find(element => element.codigo === request.codigo) : undefined;
  //   if(!aux){
  //     noDuplicated.push(request)
  //   }
  //   else{
  //     DuplicatedCode.push(request.codigo)
  //     DuplicatedID.push(request._id)
  //     duplicated.push(request)
  //   }
  // });

  //veriicar si tiene reserva hecha
  // const reservations = await db.collection('reservas').find({ anio: '2020', isActive: true }).toArray();

  // for await (let duplicatedRequest of duplicated){
  //   const aux = reservations.find((reservation) => reservation.codigo === duplicatedRequest.codigo.replace('SOL', 'AGE'));
  //   if(!aux){
  //     await db.collection('solicitudes').deleteOne({ _id: ObjectID(duplicatedRequest._id) });
  //   }
  // }

  res.json({ msg: 'listo' })
  // res.json({ msg: 'listo', countDuplicated: duplicated.length, codes: DuplicatedCode, res: duplicated });

  conn.close();
});

// router.delete("/", async (req, res) => {
//   const conn = await connect();
//   const db = conn.db('asis-db');
//   const result = await db.collection('solicitudes').find({}).toArray();
//   const filtered = result.filter((element) => element.fecha_solicitud.includes(':'))

//   for await (let element of filtered) {
//     await db.collection('solicitudes').findOneAndUpdate({ _id: element._id }, {
//       $set:{
//         fecha_solicitud: moment(element.fecha_solicitud, `${FORMAT_DATE} HH:mm`).format(FORMAT_DATE)
//       }
//     })
//   }

//   conn.close();
//   res.json({ msg: 'listo' })
// })

//DELETE / ANULAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');

  try {
    const resultSol = await db.collection('solicitudes').findOneAndUpdate({ _id: ObjectID(id) }, {$set: { isActive: false}});

    if(resultSol?.value?.codigo){

      const codeSol = resultSol.value.codigo;

      await db.collection('reservas').updateOne({ codigo: codeSol.replace("SOL", "AGE") }, {$set: { isActive: false}});
      await db.collection('evaluaciones').updateOne({ codigo: codeSol.replace("SOL", "EVA") }, {$set: { isActive: false}});
      await db.collection('resultados').updateOne({ codigo: codeSol.replace("SOL", "RES") }, {$set: { isActive: false}});
      await db.collection('facturaciones').updateOne({ codigo: codeSol.replace("SOL", "FAC") }, {$set: { isActive: false}});
      await db.collection('pagos').updateOne({ codigo: codeSol.replace("SOL", "PAG") }, {$set: { isActive: false}});
      await db.collection('cobranza').updateOne({ codigo: codeSol.replace("SOL", "COB") }, {$set: { isActive: false}});
    }

    return res.status(200).json({ err: null, msg: DELETE_SUCCESSFULL, res: null });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: String(error), msg: ERROR, res: null });
  } finally {
    conn.close()
  }
});

router.delete('/deletemany/many', async (req, res) => {
  const conn = await connect();
  const db = conn.db('asis-db');
  try {

    let ids = [];
    let contador = 6210;

    for (let i = 0; i < 533; i++) {
      ids.push(`ASIS-SOL-2021-0${contador}`);
      contador++;
    };

    await db.collection('solicitudes').deleteMany({ codigo: { $in: ids } });

    return res.status(200).json({ msg: 'solicitudes eliminadas' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'error', err: String(error) });
  } finally {
    conn.close()
  }
});

export default router;

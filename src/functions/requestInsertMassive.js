import moment from 'moment';
import { FORMAT_DATE } from '../constant/var';
import { calculate } from './NewCode';

const addCodeRequest = (data, lastrequest, year) => {
  let code = {};
  if (lastrequest) {
    code = { codigo: lastrequest.codigo }
  }
  else {
    code = { codigo: `ASIS-SOL-${year}-000000` }
  }
  let nextCode = ""
  let result = data.map(function (obj) {
    const aux = moment(obj.fecha_solicitud).format('YYYY');
    nextCode = `ASIS-SOL-${!!aux ? aux : year}-${calculate(code)}`
    obj.codigo = nextCode
    code.codigo = nextCode
    return obj
  })

  return result
};

const getMonth = (date) => {
  return moment(date, FORMAT_DATE).format('MMMM');
};

const getYear = (date) => {
  return moment(date, FORMAT_DATE).format('YYYY');
};

const existsGI = (atrr, rutgi, data) => {
  const aux = data.find((element) => element.rut === rutgi);
  console.log(aux)
  if (aux) {
    return {
      _id: aux._id,
      rut: aux.rut,
      razon_social: aux.razon_social
    }
  }
  else {
    return null;
  }
};

const existProfessional = (atrr, razon, data) => {
  const aux = data.find((element) => element.razon_social === razon);
  console.log(aux)
  if (aux) {
    return {
      _id: aux._id,
      rut: aux.rut,
      razon_social: aux.razon_social
    }
  }
  else {
    return null;
  }
};

const mapRequestsToInsert = (data, companies, naturalPersons) => {
  let requestsMapped = [];
  let notInserted = [];

  data.forEach(request => {
    const auxCP = existsGI('rut', request.rut_cp, companies);
    const auxCS = existsGI('rut', request.rut_cs, naturalPersons);
    const auxProfessionalAssign = existProfessional('razon_social', request.profesional_asignado, naturalPersons);

    if (auxCP !== null && auxCS !== null && auxProfessionalAssign !== null) {
      requestsMapped.push({
        fecha_system: moment().format(FORMAT_DATE),
        hora_system: moment().format('HH:mm'),
        id_GI_Principal: auxCP._id,
        id_GI_Secundario: auxCS._id,
        rut_CP: auxCP.rut,
        razon_social_CP: auxCP.razon_social,
        rut_cs: auxCS.rut,
        razon_social_cs: auxCS.razon_social,
        nro_contrato_seleccionado_cp: '',
        faena_seleccionada_cp: '',
        id_GI_PersonalAsignado: auxProfessionalAssign,
        fecha_solicitud: request.fecha_solicitud !== '' ? request.fecha_solicitud : moment().format(FORMAT_DATE),
        hora_solicitud: '12:00',
        mes_solicitud: getMonth(request.fecha_solicitud || moment()),
        anio_solicitud: getYear(request.fecha_solicitud || moment()),
        nombre_receptor: request.receptor || '',
        categoria1: request.categoria1 || '',
        categoria2: request.categoria2 || '',
        categoria3: request.categoria3 || '',
        nombre_servicio: request.nombre_servicio || '',
        tipo_servicio: request.tipo_servicio || '',
        monto_neto: request.monto_neto || 0,
        porcentaje_impuesto: 0,
        valor_impuesto: 0,
        monto_total: request.monto_neto || 0,
        exento: 0,
        lugar_servicio: request.lugar_servicio || '',
        sucursal: request.sucursal || '',
        descripcion_servicio: request.descripcion_servicio || '',
        observacion_solicitud: [],
        fecha_servicio_solicitado: moment(request.fecha_servicio_solicitado).format(FORMAT_DATE) || moment().format(FORMAT_DATE),
        hora_servicio_solicitado: request.hora_servicio_solicitado,
        fecha_servicio_solicitado_termino: moment(request.fecha_servicio_solicitado_termino).format(FORMAT_DATE) || moment().format(FORMAT_DATE),
        hora_servicio_solicitado_termino: request.hora_servicio_solicitado_termino,
        jornada: '',
        estado: 'Ingresado',
        isActive: true,
        url_file_adjunto: {}
      });
    }
    else {
      let motivo = [];
      auxCP === null && motivo.push('RUT CP no existe en la db');
      auxCS === null && motivo.push('RUT CS no existe en la db');
      auxProfessionalAssign === null && motivo.push('Profesional asignado no existe en la db');

      notInserted.push({
        solicitud: request,
        motivo
      });
    };
  });

  return { requestsMapped, notInserted }
};

export { mapRequestsToInsert, addCodeRequest }
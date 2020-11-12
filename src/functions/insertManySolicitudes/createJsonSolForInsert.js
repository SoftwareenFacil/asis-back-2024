import moment from "moment";
moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
  weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
}
);

const getCliente = (gis, rut, categoria = '') => {
  const result = gis.find((el) => el.rut === rut && el.categoria === categoria);
  return result || {};
};

const getPersonalAsignado = (gis, name, categoria) => {
  const result = gis.find((el) => el.razon_social === name && el.categoria === categoria);
  return result || {};
}

export default function createSolicitudes(solicitudes, gis) {
  let formated_sol = [];
  let obj = {};

  if (gis.length === 0 || solicitudes.length === 0) return [];

  solicitudes.forEach(element => {
    const giPrincipal = getCliente(gis, element.RutCP, 'Empresa/Organizacion') || {};
    const giSecundario = getCliente(gis, element.RutCS, 'Persona Natural') || {};
    const giAsignado = getPersonalAsignado(gis, element.ProfesionalAsignado, 'Persona Natural') || {};

    obj.id_GI_Principal = Object.entries(giPrincipal).length > 0 ? giPrincipal._id.toString() : '';
    obj.id_GI_Secundario = Object.entries(giSecundario).length > 0 ? giSecundario._id.toString() : '';
    obj.id_GI_PersonalAsignado = Object.entries(giAsignado).length > 0 ? giAsignado._id.toString() : '';
    obj.rut_CP = Object.entries(giPrincipal).length > 0 ? giPrincipal.rut : '';
    obj.razon_social_CP = Object.entries(giPrincipal).length > 0 ? giPrincipal.razon_social : '';
    obj.nro_contrato_seleccionado_cp = '';
    obj.faena_seleccionada_cp = '';
    obj.rut_cs = Object.entries(giSecundario).length > 0 ? giSecundario.rut : '';
    obj.razon_social_cs = Object.entries(giSecundario).length > 0 ? giSecundario.razon_social : '';
    obj.fecha_solicitud = moment().format("DD-MM-YYYY");
    obj.fecha_servicio_solicitado = moment().format("DD-MM-YYYY");
    obj.mes_solicitud = moment().format("MMMM") || '';
    obj.anio_solicitud = moment().format("YYYY") || '';
    obj.nombre_receptor = element.Receptor;
    obj.categoria1 = element.Categoria1 || "";
    obj.categoria2 = element.Categoria2 || "";
    obj.categoria3 = element.Categoria3 || "";
    obj.nombre_servicio = element.Servicio || "";
    obj.tipo_servicio = element.TipoServicio || "";
    obj.monto_neto = parseInt(element.MontoNeto) || 0;
    obj.porcentaje_impuesto = parseInt(element.PorcentajeImpuesto) || 0;
    obj.valor_impuesto = parseInt(element.ValorImpuesto) || 0;
    obj.monto_total = parseInt(element.MontoTotal) || 0;
    obj.exento = parseInt(element.MontoExento) || 0;
    obj.lugar_servicio = element.LugarServicio || '';
    obj.sucursal = element.Sucursal || '';
    obj.descripcion_servicio = '';
    obj.observacion_solicitud = [{obs: element.ObservacionSolicitudIngreso, fecha: moment().format("YYYY-MM-DD HH:mm")}]|| [];
    obj.hora_servicio_solicitado = moment().format("HH:mm") || '';
    obj.fecha_servicio_solicitado_termino = moment().format("DD-MM-YYYY") || '';
    obj.hora_servicio_solicitado_termino = moment().format("HH:mm") || '';
    obj.jornada = element.Jornada;
    obj.hora_solicitud = moment().format("YYYY-MM-DD HH:mm").substr(11, 5);
    obj.estado = "Ingresado";

    formated_sol.push(obj);
    obj = {};
  });

  return formated_sol;
};

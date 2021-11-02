export const AWS_ACCESS_KEY = 'AKIAXNOYZW53QBYZ3JES';
export const AWS_SECRET_KEY = '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';
export const AWS_BUCKET_NAME = 'asis-bucket-files-s3-aws';

export const SB_TEMPLATE_INSERT_REQUEST_ID = 4;
export const SB_TEMPLATE_CONFIRM_REQUEST_ID = 5;
export const SB_TEMPLATE_CONFIRM_RESERVATION = 6;
export const SB_TEMPLATE_SEND_RESULTS = 13;
export const SB_TEMPLATE_SEND_COLLECTION_LETTER = 14;
export const SB_TEMPLATE_SEND_CONSOLIDATED_REPORT = 15;
export const SB_TEMPLATE_SEND_CONSOLIDATED_RESULTS = 16;
export const SB_TEMPLATE_SEND_CONSOLIDATE_REQUESTS = 17;

export const ALREADY_EXISTS = 'Este registro ya existe en el sistema'; // code 99result
export const NOT_EXISTS = 'Este registro no existe'; // code 98result
export const ERROR_PDF = 'Se ha generado un problema al crear el archivo'; // code 97result

export const NAME_PSICO_PDF = 'EXAMEN_PSICO.pdf';
export const NAME_AVERSION_PDF = 'EXAMEN_AVERSION.pdf';
export const OTHER_NAME_PDF = 'EXAMEN.pdf'
export const CONSOLIDATED_REPORT_PDF = 'REPORTE_CONSOLIDADO.pdf';
export const CONSOLIDATED_REPORT_RESULTS_PDF = 'REPORTE_CONSOLIDADO_RESULTS.pdf';
export const CONSOLIDATED_EXCEL_REQUESTPAYMENT = 'REPORTE_CONSOLIDADO_COBRANZA.xlsx';
export const CONSOLIDATED_EXCEL_RESULTS = 'REPORTE_CONSOLIDADO_RESULTADOS.xlsx';

export const EXCEL_CONSOLIDATED_REQUESTS = 'EXCEL_SOLICITUDES_CONSOLIDADO';
export const EXCEL_CONSOLIDATED_RESERVATIONS = 'EXCEL_RESERVAS_CONSOLIDADO';
export const EXCEL_CONSOLIDATED_EVALUATIONS = 'EXCEL_EVALUACIONES_CONSOLIDADO';
export const EXCEL_CONSOLIDATED_RESULTS = 'EXCEL_RESULTADOS_CONSOLIDADO';

export const API_KEY_SENDINBLUE = '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';

export const MONGODB_CONNECTION_DEV = 'mongodb://localhost/local-db-asis';
export const MONGODB_CONNECTION_STAGING = 'mongodb+srv://admin:Karla2021@cluster0.zaazp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
export const MONGODB_CONNECTION_PROD = 'mongodb+srv://admin:Karla2021@cluster0.3pzmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
export const MONGODB_CONNECTION_PROD_NEW = 'mongodb+srv://admin:Karla2020@cluster0.gijuv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

export const MONGODB_CLIENT_DEV = 'ASIS';

export const FORMAT_DATE = 'DD-MM-YYYY';

export const COMPANY_CATEGORY = [
  'Microempresa',
  'Pequeña Empresa',
  'Mediana Empresa',
  'Gran Empresa'
];

export const CURRENT_ROL = 'clientes';
export const COLABORATION_ROL = 'colaboradores';

export const SUCURSALES = ['Fuera de oficina', 'Oficina Illapel', 'Oficina Salamanca']
export const LUGAR_SERVICIOS = ["Oficina", "Terreno", "No Aplica"]

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const NUMBER_MONTHS = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12'
};

export const COLUMNS_NAME_REQUESTS = [
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 10,
    name: 'ESTADO',
    requestName: 'estado'
  },
  {
    width: 15,
    name: 'FECHA SOLICITUD',
    requestName: 'fecha_solicitud'
  },
  {
    width: 10,
    name: 'MES',
    requestName: 'mes_solicitud'
  },
  {
    width: 10,
    name: 'AÑO',
    requestName: 'anio_solicitud'
  },
  {
    width: 15,
    name: 'Nombre Receptor',
    requestName: 'nombre_receptor'
  },
  {
    width: 50,
    name: 'CATEGORIA 1',
    requestName: 'categoria1'
  },
  {
    width: 50,
    name: 'CATEGORIA 2',
    requestName: 'categoria2'
  },
  {
    width: 50,
    name: 'CATEGORIA 3',
    requestName: 'categoria3'
  },
  {
    width: 35,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 18,
    name: 'TIPO SERVICIO',
    requestName: 'tipo_servicio'
  },
  {
    width: 18,
    name: 'LUGAR SERVICIO',
    requestName: 'lugar_servicio'
  },
  {
    width: 15,
    name: 'SUCURSAL',
    requestName: 'sucursal'
  },
  {
    width: 12,
    name: 'MONTO NETO',
    requestName: 'monto_neto'
  },
  {
    width: 12,
    name: '% IMPUESTO',
    requestName: 'porcentaje_impuesto'
  },
  {
    width: 18,
    name: 'VALOR IMPUESTO',
    requestName: 'valor_impuesto'
  },
  {
    width: 11,
    name: 'EXENTO',
    requestName: 'exento'
  },
  {
    width: 13,
    name: 'MONTO TOTAL',
    requestName: 'monto_total'
  },
  {
    width: 30,
    name: 'DESCRIPCION DEL SERVICIO',
    requestName: 'descripcion_servicio'
  },
  {
    width: 35,
    name: 'PROFESIONAL ASIGNADO',
    requestName: 'profesional_asignado'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_CP'
  },
  {
    width: 25,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_CP'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 25,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
  {
    width: 30,
    name: 'FECHA INICIO RESERVA PRELIMINAR',
    requestName: 'fecha_servicio_solicitado'
  },
  {
    width: 30,
    name: 'HORA INICIO RESERVA PRELIMINAR',
    requestName: 'hora_servicio_solicitado'
  },
  {
    width: 30,
    name: 'FECHA FIN RESERVA PRELIMINAR',
    requestName: 'fecha_servicio_solicitado_termino'
  },
  {
    width: 30,
    name: 'HORA FIN RESERVA PRELIMINAR',
    requestName: 'hora_servicio_solicitado_termino'
  },
  {
    width: 10,
    name: 'JORNADA',
    requestName: 'jornada'
  },
  {
    width: 38,
    name: 'OBSERVACION SOLICITUD',
    requestName: 'observacion_solicitud'
  }
];

export const COLUMNS_NAME_RESERVATIONS = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 20,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 26,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 26,
    name: 'LUGAR SERVICIO',
    requestName: 'lugar_servicio'
  },
  {
    width: 26,
    name: 'SUCURSAL',
    requestName: 'sucursal'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
  {
    width: 18,
    name: 'FECHA INICIO',
    requestName: 'fecha_reserva'
  },
  {
    width: 18,
    name: 'HORA INICIO',
    requestName: 'hora_reserva'
  },
  {
    width: 18,
    name: 'FECHA FIN',
    requestName: 'fecha_reserva_fin'
  },
  {
    width: 18,
    name: 'HORA FIN',
    requestName: 'hora_reserva_fin'
  },
];

export const COLUMNS_NAME_EVALUATIONS = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 20,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 20,
    name: 'ESTADO ARCHIVO',
    requestName: 'estado_archivo'
  },
  {
    width: 35,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 20,
    name: 'FECHA INICIO',
    requestName: 'fecha_evaluacion'
  },
  {
    width: 20,
    name: 'HORA INICIO',
    requestName: 'hora_inicio_evaluacion'
  },
  {
    width: 20,
    name: 'FECHA FIN',
    requestName: 'fecha_evaluacion_fin'
  },
  {
    width: 20,
    name: 'HORA FIN',
    requestName: 'hora_termino_evaluacion'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
];

export const COLUMNS_NAME_RESULTS = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 20,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 20,
    name: 'ESTADO ARCHIVO',
    requestName: 'estado_archivo'
  },
  {
    width: 20,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 20,
    name: 'FECHA RESULTADO',
    requestName: 'fecha_resultado'
  },
  {
    width: 20,
    name: 'HORA RESULTADO',
    requestName: 'hora_resultado'
  },
  {
    width: 25,
    name: 'FECHA VENCIMIENTO EXAMEN',
    requestName: 'fecha_vencimiento_examen'
  },
  {
    width: 20,
    name: 'ESTADO RESULTADO',
    requestName: 'estado_resultado'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
];

export const COLUMNS_NAME_INVOICES = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 25,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 20,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 20,
    name: 'RAZON SOCIAL EMPRESA',
    requestName: 'razon_social_empresa'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
  {
    width: 20,
    name: 'REQUIERE OC',
    requestName: 'oc'
  },
  {
    width: 20,
    name: 'NUMERO OC',
    requestName: 'nro_oc'
  },
  {
    width: 20,
    name: 'FECHA OC',
    requestName: 'fecha_oc'
  },
  {
    width: 20,
    name: 'HORA OC',
    requestName: 'hora_oc'
  },
  {
    width: 20,
    name: 'FECHA FACTURA',
    requestName: 'fecha_facturacion'
  },
  {
    width: 20,
    name: 'NRO. FACTURA',
    requestName: 'nro_factura'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL EMPRESA',
    requestName: 'razon_social_empresa'
  },
  {
    width: 20,
    name: 'MONTO NETO',
    requestName: 'monto_neto'
  },
  {
    width: 20,
    name: '% IMPUESTO',
    requestName: 'porcentaje_impuesto'
  },
  {
    width: 12,
    name: 'IVA',
    requestName: 'valor_impuesto'
  },
  {
    width: 20,
    name: 'SUBTOTAL',
    requestName: 'sub_total'
  },
  {
    width: 20,
    name: 'EXENTO',
    requestName: 'exento'
  },
  {
    width: 20,
    name: 'DESCUENTO',
    requestName: 'descuento'
  },
  {
    width: 20,
    name: 'TOTAL',
    requestName: 'total'
  },
]

export const COLUMNS_NAME_PAYMENTS = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 25,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 20,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
  {
    width: 20,
    name: 'FECHA FACTURA',
    requestName: 'fecha_facturacion'
  },
  {
    width: 20,
    name: 'NRO. FACTURA',
    requestName: 'nro_factura'
  },
  {
    width: 20,
    name: 'CREDITO',
    requestName: 'credito'
  },
  {
    width: 20,
    name: 'DIAS CREDITO',
    requestName: 'dias_credito'
  },
  {
    width: 20,
    name: 'VALOR PAGADO',
    requestName: 'valor_cancelado'
  },
  {
    width: 20,
    name: 'VALOR SERVICIO',
    requestName: 'valor_servicio'
  },
]

export const COLUMNS_NAME_REQUESTPAYMENTS = [
  {
    width: 20,
    name: 'CODIGO SOL',
    requestName: 'codigo_solicitud'
  },
  {
    width: 20,
    name: 'CODIGO',
    requestName: 'codigo'
  },
  {
    width: 25,
    name: 'ESTADO PROCESO',
    requestName: 'estado'
  },
  {
    width: 20,
    name: 'NOMBRE SERVICIO',
    requestName: 'nombre_servicio'
  },
  {
    width: 12,
    name: 'RUT CP',
    requestName: 'rut_cp'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CP',
    requestName: 'razon_social_cp'
  },
  {
    width: 12,
    name: 'RUT CS',
    requestName: 'rut_cs'
  },
  {
    width: 35,
    name: 'RAZON SOCIAL CS',
    requestName: 'razon_social_cs'
  },
  {
    width: 20,
    name: 'FECHA FACTURA',
    requestName: 'fecha_facturacion'
  },
  {
    width: 20,
    name: 'DIAS CREDITO',
    requestName: 'dias_credito'
  },
  {
    width: 20,
    name: 'VALOR PAGADO',
    requestName: 'valor_cancelado'
  },
  {
    width: 20,
    name: 'VALOR DEUDA',
    requestName: 'valor_servicio'
  },
]
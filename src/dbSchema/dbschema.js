
const gi = [
    {
        _id: '33443444434545464TGFG67STG36FTD63G',
        codigo: 'ASIS-GI-00001',
        rut: '76.325.648-8',
        razon_social: 'Asociacion Chilena de Seguridad',
        nombre_fantasia: 'ACHS',
        rubro_principal: String,
        actividad_principal: String,
        rubro_secundario: String,
        actividad_secundaria: String,
        grupo_interes:'cliente',
        categoria: 'Empresa/Organizacion',
        categoria_empresa: 'Gran Empresa',
        categoria_cliente:'frecuente',
        genero: 'no aplca',
        fecha_inic_nac: '1910-02-17',
        nivel_educacional: 'no aplica',
        contacto: '25418458',
        contacto_2: '0',
        email_central: 'archcontacto@arch.cl',
        email_encargado: ' ',
        profesion_oficio: ' seguridad',
        cargo: 'gerente general',
        licencia_conducion: '',
        clase_licencia:['A1', 'A2'],
        ley_aplicable: '94125',
        fecha_venc_licencia: '2022-05-21',
        direccion: ' direccion detallada de la ARCH ',
        localidad: 'San Bernardo',
        comuna: 'San Bernardo',
        sector: 'Urbano',
        nacionalidad: 'Chilena',
        pais_origen: 'Chile',
        credito: 'Si',
        dias_credito: '90',
        orden_compra: 'Si',
        estado_civil: String,
        grupo_sanguineo: String,
        usa_lente_optico: String,
        usa_lente_contacto: String,
        usa_audifonos: String,
        id_GI_org_perteneciente: '78wf783fg3gf3f3fg783r',
        razon_social_org_perteneciente: 'Empresas Altamirano SpA',
        url_file_adjunto: 'src/files/7464563736463gfbce.pdf'
    }
];

const solicitud = [
    {
        _id: String,
        id_GI_Principal: String,
        id_GI_Secundario: String,
        id_GI_PersonalAsignado: String,
        rut_CP: String,
        razon_social_CP: String,       
        rut_cs: String,
        razon_social_cs: String,
        fecha_solicitud: String,
        fecha_servicio_solicitado: String,
        mes_solicitud: String,
        anio_solicitud: String,
        nombre_receptor: String,
        categoria1: String,
        categoria2: String,
        categoria3: String,
        nombre_servicio: String,
        precio: Number,
        costo_estimado: Number,
        lugar_servicio: String,
        sucursal: String,
        observacion_solicitud: Array,
        hora_solicitud: String,
        hora_servicio_solicitado: String,
        jornada: String,
        estado: 'Ingresado'
    }
];

const reserva = [
    {
        _id: String,
        codigo: String,
        id_GI_Principal: String,
        id_GI_Secundario: String,
        id_GI_PersonalAsignado: String,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        fecha_reserva: String,
        fecha_reserva_fin: String,
        hora_reserva: String,
        hora_reserva_fin: String,
        jornada: String,
        mes: String,
        anio: String,
        nombre_servicio: String,
        lugar_servicio: String,
        sucursal: String,
        observacion: Array,
        estado: 'Ingresado'
    }
];

const evaluacion = [
    {
        _id: String,
        id_GI_personalAsignado: String,
        codigo: String,
        fecha_evaluacion: String,
        fecha_evaluacion_fin: String,
        hora_inicio_evaluacion: String,
        hora_termino_evaluacion: String,
        fecha_carga_examen: String,
        hora_carga_examen: String,
        mes: String,
        anio: String,
        nombre_servicio: String,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        lugar_servicio: String,
        sucursal: String,
        observaciones: Array,
        fecha_confirmacion_examen:String,
        hora_confirmacion_examen: String,
        estado: "Ingresado",
        estado_archivo: "Sin Documento",
        archivo_examen: Object
    }
];

const resultado = [
    {
        _id:String,
        codigo: String,
        nombre_servicio: String,
        id_GI_personalAsignado: String,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        lugar_servicio: String,
        sucursal: String,
        condicionantes: String,
        vigencia_examen: String,
        observaciones: Array,
        fecha_confirmacion_examen:String,
        hora_confirmacion_examen: String,
        estado: String,
        estado_archivo: String,
        estado_resultado: String,
        archivo_resultado: Object,
        fecha_resultado: String,
        hora_resultado: String
    }
];

const facturaciones = [
    {
        _id: String,
        codigo: String,
        nombre_servicio: String,
        id_GI_personalAsignado: String,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        lugar_servicio: String,
        sucursal: String,
        condicionantes: String,
        vigencia_examen: String,
        oc: String,
        archivo_oc:String,
        fecha_oc: String,
        hora_oc: String,
        nro_oc: String,
        observaciones_oc: String,
        estado: String,
        estado_archivo: String,
        observaciones: Array,
        estado_facturacion: String,
        fecha_facturacion: String,
        nro_factura: String,
        archivo_factura: Object,
        monto_neto: Number,
        procentaje_impuesto: String,
        valor_impuesto: Number,
        sub_total: Number,
        exento: Number,
        total: Number
    }
];

const pagos = [
    {
        _id: String,
        codigo: String,
        nombre_servicio: String,
        id_GI_personalAsignado: String,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        lugar_servicio: String,
        sucursal: String,
        estado: String,
        fecha_facturacion: String,
        nro_factura: String,
        credito: String,
        dias_credito: String,
        valor_servicio: Number,
        valor_cancelado: Number,
        fecha_pago: String,
        pagos: [
            {
                fecha_pago: String,
                hora_pago: String,
                local: String,
                tipo_pago: String,
                monto: Number,
                Descuento: Number,
                total: Number
            }
        ],
        
    }
];

const cobranza = [
    {
        _id: String,
        codigo: String,
        nombre_servicio: String,
        categoria_cliente: String,
        fecha_facturacion: String,
        dias_credito: String,
        valor_servicio: Number,
        rut_cp: String,
        razon_social_cp: String,
        rut_cs: String,
        razon_social_cs: String,
        lugar_servicio: String,
        sucursal: String,
        estado: String,
        valor_cancelado: Number,
        valor_deuda: Number
    }
]

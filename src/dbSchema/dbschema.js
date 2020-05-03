
const gi = [
    {
        _id: '33443444434545464TGFG67STG36FTD63G',
        codigo: 'ASIS-GI-00001',
        rut: '76.325.648-8',
        razon_social: 'Asociacion Chilena de Seguridad',
        nombre_fantasia: 'ACHS',
        giro_principal: '',
        grio_secundario: '',
        rubro:'Seguridad',
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
        lugar_servicio: String,
        sucursal: String,
        observacion_solicitud: String,
        hora_servicio: String,
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
        hora_reserva: String,
        jornada: String,
        mes: String,
        anio: String,
        nombre_servicio: String,
        lugar_servicio: String,
        sucursal: String,
        observacion: String,
        estado: 'Ingresado'
    }
]

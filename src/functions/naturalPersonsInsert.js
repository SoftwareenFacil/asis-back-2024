import moment from 'moment'
import { FORMAT_DATE } from '../constant/var';

const mapDataToInsertManyNaturalPersons = (data) => {
  const gisMapped = data.map((gi) => {
    return {
      rut: gi.rut,
      razon_social: gi.razon_social || '',
      nombre_fantasia: gi.nombre_fantasia || '',
      rubro_principal: 'Otros.',
      actividad_principal: {
        codigo: '999999',
        actividad: 'Otros.',
        rubro: 'Otros.'
      },
      rubro_secundario: 'Otros.',
      actividad_secundaria: {
        codigo: '999999',
        actividad: 'Otros.',
        rubro: 'Otros.'
      },
      grupo_interes: gi.grupo_interes,
      categoria: gi.tipo_cliente,
      categoria_empresa: 'No Aplica',
      categoria_cliente: gi.categoria_cliente || 'Ocacional',
      fecha_inic_mac: (gi.fecha_inic_mac && gi.fecha_inic_mac !== '') ? moment(gi.fecha_inic_mac).format(FORMAT_DATE) : '01-01-2020',
      edad_gi: 0,
      contacto: gi.contacto || '',
      contacto_2: gi.contacto_secundario || '',
      email_central: (gi.email_central && gi.email_central !== '') ? gi.email_central : 'default@default.cl',
      email_encargado: gi.email_encargado || '',
      profesion_oficio: '',
      direccion: gi.direccion || '',
      localidad: gi.localidad || '',
      comuna: gi.comuna || '',
      provincia: gi.provincia || '',
      region: gi.region || '',
      sector: 'Urbano',
      nacionalidad: gi.nacionalidad || '',
      pais_origen: 'CHL',
      grado_formalización: '',
      credito: '',
      cargo: '',
      genero: gi.genero || '',
      estado_civil: gi.estado_civil || '',
      fecha_vencimiento_ci: '',
      fecha_venc_licencia: '',
      usa_pc: '',
      dias_credito: 0,
      orden_compra: '',
      url_file_adjunto: {},
      activo_inactivo: true,
      contrato_faenas: [],
      imagen_perfil_gi: '',
      licencia_conduccion: 'no',
      nivel_educacional: '',
      rol: 'Clientes',

      id_GI_org_perteneciente: '6099ecb55c9ad06429273783',
      razon_social_org_perteneciente: 'Asis Consultores SpA',

      grupo_sanguineo: '',
      usa_lente_optico: '',
      usa_lente_contacto: '',
      usa_audifonos: '',

      nro_contrato: '12345',
      faena: 'Illapel'
    }
  });

  return gisMapped;
};

export { mapDataToInsertManyNaturalPersons }
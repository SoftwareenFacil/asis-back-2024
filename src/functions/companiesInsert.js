import { COMPANY_CATEGORY, FORMAT_DATE } from "../constant/var";

import moment from "moment";

const verificateClientType = (data, type) => {
  let clients = [];
  let notInsertClient = [];

  data.forEach(element => {
    if(element?.categoria && element.categoria.toLowerCase() === type){
      clients.push(element);
    }
    else{
      notInsertClient.push(element)
    }
  });

  return { clients, notInsertClient }
};

const verificateGrupoInteres = (data) => {
  let companies = [];
  let noInserted = [];
  data.forEach(element => {
      if(element.grupo_interes &&
          (element.grupo_interes.toLowerCase() === 'colaboradores'
          || element.grupo_interes.toLowerCase() === 'clientes'
          || element.grupo_interes.toLowerCase() === 'empleados'
          || element.grupo_interes.toLowerCase() === 'admin')){
              companies.push(element)
      }
      else{
          noInserted.push(element)
      }
  });

  return { companies, noInserted }
};

const eliminatedDuplicated = (data, gisDB) => {
  let uniqueCompanies = [];
  let duplicatedGI = [];

  data.forEach(element => {
    let aux = uniqueCompanies.find((gi) => gi.rut === element.rut);
    aux = gisDB.find((gi) => gi.rut === element.rut);
    if(!aux){
      uniqueCompanies.push(element);
    }
    else{
      duplicatedGI.push(element);
    }
  });

  return { uniqueCompanies, duplicatedGI }
};

const isExistsRUT = (data) => {
  let gisWithRut = [];
  let notInsertGIWithoutRut = [];

  data.forEach(element => {
    console.log(element.rut)
    if(element?.rut && String(element.rut).includes("-")){
      gisWithRut.push(element)
    }
    else{
      notInsertGIWithoutRut.push(element)
    }
  });

  return { gisWithRut, notInsertGIWithoutRut }
}

const mapDataToInsertManyGIs = (data) => {
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
      categoria: gi.categoria,
      categoria_empresa: COMPANY_CATEGORY.some((e) => gi.categoria_empresa) ? gi.categoria_empresa : 'Microempresa',
      categoria_cliente: 'Frecuente',
      fecha_inic_mac: (!!gi.fecha_inic_mac && gi.fecha_inic_mac !== 'No Aplica') ? moment(gi.fecha_inic_mac).format(FORMAT_DATE) : '01-01-2020',
      edad_gi: 0,
      contacto: gi.contacto || '',
      contacto_2: gi.contacto_secundario || '',
      email_central: (gi.email_central && gi.email_central !== '') ? gi.email_central : 'default@default.cl',
      email_encargado: gi.email_encargado || '',
      profesion_oficio: '',
      direccion: gi.direccion || '',
      localidad: gi.localidad || '',
      comuna: '',
      provincia: '',
      region: '',
      sector: 'Urbano',
      nacionalidad: 'No Aplica',
      pais_origen: 'CHL',
      grado_formalización: '',
      credito: gi.credito || 'Si',
      cargo: '',
      genero: '',
      estado_civil: '',
      fecha_vencimiento_ci: '',
      fecha_venc_licencia: '',
      usa_pc: '',
      dias_credito: 0,
      orden_compra: gi.orden_compra || 'No',
      url_file_adjunto: {},
      activo_inactivo: true,
      contrato_faenas: [],
      imagen_perfil_gi: '',
      licencia_conduccion: '',
      nivel_educacional: '',
    }
  });

  return gisMapped;
}

export { verificateGrupoInteres, eliminatedDuplicated, verificateClientType, isExistsRUT, mapDataToInsertManyGIs }
export default function createGIs(empresas, personas){
    let array_final = []
    let obj = {}

    empresas.forEach(element => {
        obj.rut = element.rut
        obj.razon_social = element.razon_social
        obj.nombre_fantasia = element.nombre_fantasia
        obj.rubro_principal = "Otros."
        obj.actividad_principal = "Otros."
        obj.rubro_secundario = "Otros."
        obj.actividad_secundaria = "Otros."
        obj.grupo_interes = element.grupo_interes
        obj.categoria = element.categoria
        obj.categoria_empresa = element.categoria_empresa
        obj.categoria_cliente = element.categoria_cliente
        obj.fecha_inic_mac = element.fecha_inic_mac
        obj.edad_gi = 0
        obj.contacto = element.contacto,
        obj.contacto_2 = element.contacto_2 || 0,
        obj.email_central = element.email_central
        obj.email_encargado = element.email_encargado
        obj.profesion_oficio = ""
        obj.direccion = element.direccion
        obj.localidad = element.localidad
        obj.comuna = element.comuna
        obj.provincia = element.provincia
        obj.region = element.region
        obj.sector = element.sector
        obj.nacionalidad = "No Aplica"
        obj.pais_origen = element.pais_origen
        obj.grado_formalizacion = element.grado_formalizacion
        obj.nro_contrato = []
        obj.credito = element.credito
        obj.dias_credito = element.dias_credito
        obj.orden_compra = element.orden_compra
        obj.url_file_adjunto = {}
        obj.activo_inactivo = true

        array_final.push(obj)
        obj = {}
    });
    
    personas.forEach(element => {
        obj.rut = element.rut
        obj.razon_social = element.razon_social
        obj.nombre_fantasia = element.nombre_fantasia
        obj.rubro_principal = "Otros."
        obj.actividad_principal = "Otros."
        obj.rubro_secundario = "Otros."
        obj.actividad_secundaria = "Otros."
        obj.grupo_interes = element.grupo_interes
        obj.categoria = element.categoria
        obj.categoria_empresa = "No Aplica",
        obj.categoria_cliente = element.categoria_cliente
        obj.fecha_inic_mac = element.fecha_inic_mac
        obj.edad_gi = 0
        obj.contacto = element.contacto,
        obj.contacto_2 = element.contacto_2 || 0,
        obj.email_central = element.email_central
        obj.email_encargado = element.email_encargado
        obj.profesion_oficio = ""
        obj.direccion = element.direccion || '',
        obj.localidad = element.localidad
        obj.comuna = element.comuna
        obj.provincia = element.provincia
        obj.region = element.region
        obj.sector = element.sector
        obj.nacionalidad = "Chilena"
        obj.pais_origen = element.pais_origen
        obj.profesion_oficio = element.profesion_oficio
        obj.cargo = element.cargo
        obj.genero = element.genero
        obj.nivel_educacional = element.nivel_educacional
        obj.estado_civil = element.estado_civil
        obj.grupo_sanguineo = element.grupo_sanguineo
        obj.usa_lente_optico = element.usa_lente_optico
        obj.usa_lente_contacto = element.usa_lente_contacto
        obj.usa_audifonos = element.usa_audifonos
        obj.fecha_vencimiento_ci = new Date()
        obj.usa_pc = element.usa_pc
        obj.nro_contrato = []
        obj.licencia_conducion = element.licencia_conducion
        obj.clase_licencia = [element.clase_licencia]
        obj.ley_aplicable = element.ley_aplicable
        obj.fecha_venc_licencia = new Date()
        obj.estado_licencia = "No Vigente"
        obj.id_GI_org_perteneciente = "",
        obj.razon_social_org_perteneciente = "",
        obj.url_file_adjunto = {}
        obj.activo_inactivo = true

        array_final.push(obj)
        obj = {}
    });

    return array_final
}
export default function createGIs(empresas, personas){
    let array_final = []
    let obj = {}

    empresas.forEach(element => {
        obj.rut = element.Rut
        obj.razon_social = element.RazonSocial
        obj.nombre_fantasia = element.NombreFantasia
        obj.rubro_principal = "Otros."
        obj.actividad_principal = "Otros."
        obj.rubro_secundario = "Otros."
        obj.actividad_secundaria = "Otros."
        obj.grupo_interes = element.GrupoInteres
        obj.categoria = element.TipoCliente
        obj.categoria_empresa = element.CategoriaEmpresa
        obj.categoria_cliente = element.CategoriaCliente
        obj.fecha_inic_mac = element.FechaInicio
        obj.edad_gi = 0
        obj.contacto = element.ContactoPrimario,
        obj.contacto_2 = element.ContactoSecundario
        obj.email_central = element.CorreoPrimario
        obj.email_encargado = element.CorreoSecundario
        obj.profesion_oficio = ""
        obj.direccion = element.direccion
        obj.localidad = element.Localidad
        obj.comuna = element.Comuna
        obj.provincia = element.Provincia
        obj.region = element.Region
        obj.sector = element.Sector
        obj.nacionalidad = "No Aplica"
        obj.pais_origen = element.PaisOrigen
        obj.grado_formalizacion = element.GradoFormalizacion
        obj.nro_contrato = []
        obj.credito = element.Credito
        obj.dias_credito = element.DiasCredito
        obj.orden_compra = element.OrdenCompra
        obj.url_file_adjunto = {}

        array_final.push(obj)
        obj = {}
    });
    
    personas.forEach(element => {
        obj.rut = element.Rut
        obj.razon_social = element.RazonSocial
        obj.nombre_fantasia = element.NombreFantasia
        obj.rubro_principal = "Otros."
        obj.actividad_principal = "Otros."
        obj.rubro_secundario = "Otros."
        obj.actividad_secundaria = "Otros."
        obj.grupo_interes = element.GrupoInteres
        obj.categoria = element.TipoCliente
        obj.categoria_empresa = "No Aplica",
        obj.categoria_cliente = element.CategoriaCliente
        obj.fecha_inic_mac = element.FechaInicio
        obj.edad_gi = 0
        obj.contacto = element.ContactoPrimario,
        obj.contacto_2 = element.ContactoSecundario
        obj.email_central = element.CorreoPrimario
        obj.email_encargado = element.CorreoSecundario
        obj.profesion_oficio = ""
        obj.direccion = element.direccion
        obj.localidad = element.Localidad
        obj.comuna = element.Comuna
        obj.provincia = element.Provincia
        obj.region = element.Region
        obj.sector = element.Sector
        obj.nacionalidad = "Chilena"
        obj.pais_origen = element.PaisOrigen
        obj.profesion_oficio = element.ProfesionOficio
        obj.cargo = element.Cargo
        obj.genero = element.Genero
        obj.nivel_educacional = element.NivelEducacional
        obj.estado_civil = element.EstadoCivil
        obj.grupo_sanguineo = element.GrupoSanguineo
        obj.usa_lente_optico = element.LentesOpticos
        obj.usa_lente_contacto = element.LentesContacto
        obj.usa_audifonos = element.Audifonos
        obj.fecha_vencimiento_ci = new Date()
        obj.usa_pc = element.UsaPC
        obj.nro_contrato = []
        obj.licencia_conducion = element.LicenciaConducir
        obj.clase_licencia = [element.TipoLicencia]
        obj.ley_aplicable = element.LeyAplicable
        obj.fecha_venc_licencia = new Date()
        obj.estado_licencia = "No Vigente"
        obj.id_GI_org_perteneciente = "",
        obj.razon_social_org_perteneciente = "",
        obj.url_file_adjunto = {}

        array_final.push(obj)
        obj = {}
    });

    return array_final
}
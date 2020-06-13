export default function getEmpresasGI(data){
    let empresas = data.filter(gi => gi.TipoCliente === 'Empresa/Organizacion')
    return empresas
}
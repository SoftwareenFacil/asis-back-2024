export default function verificateCatPersona(data){
    let result = data.filter(e => e.CategoriaEmpresa === 'No Aplica')
    return result
}
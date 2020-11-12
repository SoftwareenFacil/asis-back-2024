export default function verificateCatPersona(data){
    let result = data.filter(e => e.categoria_empresa === 'No Aplica')
    return result
}
export default function verificateCatEmpresa(data){
    let result = data.filter(e => e.categoria_empresa === 'Microempresa')

    return result
}
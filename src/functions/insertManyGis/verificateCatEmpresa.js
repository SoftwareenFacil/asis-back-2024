export default function verificateCatEmpresa(data){
    let result = data.filter(e => e.CategoriaEmpresa === 'Microempresa')

    return result
}
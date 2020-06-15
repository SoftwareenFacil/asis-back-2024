export default function verificateOrdenCompra(data){
    let result = data.filter(e => e.OrdenCompra === 'Si' || e.OrdenCompra === 'No')
    return result
}
export default function verificateOrdenCompra(data){
    let result = data.filter(e => e.orden_compra === 'Si' || e.orden_compra === 'No')
    return result
}
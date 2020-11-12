export default function verificateCatCliente(data){
    let result = data.filter(e => e.categoria_cliente === 'Frecuente'
        || e.categoria_cliente === 'Habitual'
        || e.categoria_cliente === 'Ocasional')
    
    return result
}
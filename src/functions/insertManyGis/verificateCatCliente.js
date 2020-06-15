export default function verificateCatCliente(data){
    let result = data.filter(e => e.CategoriaCliente === 'Frecuente'
        || e.CategoriaCliente === 'Habitual'
        || e.CategoriaCliente === 'Ocasional')
    
    return result
}
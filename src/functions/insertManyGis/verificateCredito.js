export default function verificateCredito(data){
    let result = data.filter(e => e.Credito === 'Si' || e.Credito === 'No')
    return result
}
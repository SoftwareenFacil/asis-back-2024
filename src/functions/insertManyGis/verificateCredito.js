export default function verificateCredito(data){
    let result = data.filter(e => e.credito === 'Si' || e.credito === 'No')
    return result
}
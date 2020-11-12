export default function validateDiasCredito(data){
    let result = data.map(function(obj){
        if(isNaN(obj.dias_credito)){
            obj.dias_credito = 0
            return obj
        }
        else{
            return obj
        }
    })

    return result
}
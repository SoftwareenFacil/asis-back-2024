export default function validateDiasCredito(data){
    let result = data.map(function(obj){
        if(isNaN(obj.DiasCredito)){
            obj.DiasCredito = 0
            return obj
        }
        else{
            return obj
        }
    })

    return result
}
export default function getPersonasGI(data){
    let result = [{newdata: []}, {renegados: []}]
    result[0].newdata = data.filter(function(e){
        if(e.categoria === 'Persona Natural'){
            return true
        }
        else{
            result[1].renegados.push(e)
            return false
        }
    })
    return result
}
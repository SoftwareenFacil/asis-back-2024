import isValidateDate from "./isValidateDate";

export default function validateFechaInicio(data){
    let regExpresion = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/;
    let result = data.map(function(obj){
        if(obj.FechaInicio != null && obj.FechaInicio != "" && pattern.test(obj.FechaInicio)){
            return obj
        }
    })

    return result
}


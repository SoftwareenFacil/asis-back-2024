import { calculate } from "../NewCode";

export default function addCodeGI(data, lastgi, year){
    let code = {};
    if(lastgi){
        code = {codigo: lastgi.codigo}
    }
    else{
        code = {codigo: `ASIS-GI-${year}-000000`}
    }
    let nextCode = ""
    let result = data.map(function(obj){
        nextCode = `ASIS-GI-${year}-${calculate(code)}`
        obj.codigo = nextCode
        code.codigo = nextCode
        return obj
    })

    return result
}
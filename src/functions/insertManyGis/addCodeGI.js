import { calculate } from "../NewCode";

export default function addCodeGI(data, lastgi, year){
    let code = {codigo: lastgi.codigo};
    let nextCode = ""
    let result = data.map(function(obj){
        nextCode = `ASIS-GI-${year}-${calculate(code)}`
        obj.codigo = nextCode
        code.codigo = nextCode
        return obj
    })

    return result
}
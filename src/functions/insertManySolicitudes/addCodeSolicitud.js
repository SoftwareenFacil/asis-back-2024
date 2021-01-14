import { calculate } from "../NewCode";

export default function addCodeSolicitud(data, lastsol, year){
    let code = {};
    if(lastsol){
        code = {codigo: lastsol.codigo}
    }
    else{
        code = {codigo: `ASIS-SOL-${year}-000000`}
        // code = {codigo: `ASIS-SOL-2020-000000`}
    }
    let nextCode = ""
    let result = data.map(function(obj){
        nextCode = `ASIS-SOL-${year}-${calculate(code)}`
        // nextCode = `ASIS-SOL-2020-${calculate(code)}`
        obj.codigo = nextCode
        code.codigo = nextCode
        return obj
    })

    return result
}
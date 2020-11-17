export function getFechaVencExam(fecha, vigencia){
    let d = new Date(fecha)
    const v = parseInt(vigencia) || 6;
    let nuevomes = d.getMonth() + v;
    d.setMonth(nuevomes)
    d.setDate(d.getDate() + 1)
    return d
}
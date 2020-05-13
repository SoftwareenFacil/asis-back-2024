export function getFechaVencExam(fecha, vigencia){
    let d = new Date(fecha)
    const v = parseInt(vigencia.replace(/\D/g, ""));
    let nuevomes = d.getMonth() + v;
    d.setMonth(nuevomes)
    d.setDate(d.getDate() + 1)
    return d
}
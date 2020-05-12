export function CalculateFechaVenc(fecha, meses){
    let f = fecha
    let fechaActual = new Date(f)
    fechaActual = fechaActual.setMonth(fechaActual.getMonth() + meses)
    return fechaActual;
}
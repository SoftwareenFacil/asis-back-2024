export default function getFinalExistencia(result) {
  result.forEach((objeto) => {
    if (objeto.entradas > 0) {
      objeto.costo_unitario_promedio = Math.round(
        objeto.costo_total / objeto.entradas,
        0
      );
    } else {
      objeto.costo_unitario_promedio = objeto.costo_total;
    }

    if (objeto.entradas >= objeto.salidas) {
      objeto.existencia = objeto.entradas - objeto.salidas;
    } else {
      objeto.existencia = 0;
    }

    //calculo para porcentaje de existencia (stock) -> entradas/cantMaxima
    if (objeto.existencia === 0) {
      objeto.estado = "Sin Stock";
    } else if (Math.round((objeto.existencia / objeto.cantMaxima) * 100, 0) < 25){
      objeto.estado = "Adquirir Stock";
    }
    else{
      objeto.estado = "Stock al Día";
    }

    // if (objeto.existencia === 0) {
    //   objeto.estado = "Sin Stock";
    // } else if (objeto.existencia === 1) {
    //   objeto.estado = "Adquirir Stock";
    // } else {
    //   objeto.estado = "Stock al Día";
    // }
  });

  return result;
}

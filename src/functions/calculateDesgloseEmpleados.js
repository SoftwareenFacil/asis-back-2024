export default function calculateDesgloseEmpleados(
  detalle,
  abrev,
  dias,
  diasVacaciones,
  incDec,
  diasPendientes
) {
  console.log([detalle, abrev, dias, diasVacaciones, incDec, diasPendientes])
  let obj = !!detalle ? detalle : {};

  if(!!diasPendientes){
    obj.dias_pendientes = diasPendientes;
  }

  // sumamos o restamos los dias a la ausencia registrada
  switch (abrev) {
    case "E":
      if (incDec === "inc") {
        obj.enfermedad_cant += dias;
      } else {
        obj.enfermedad_cant -= dias;
      }
      break;
    case "V":
      if (incDec === "inc") {
        obj.vacaciones_cant += dias;
      } else {
        obj.vacaciones_cant -= dias;
      }
      break;
    case "M":
      if (incDec === "inc") {
        obj.maternidad_cant += dias;
      } else {
        obj.maternidad_cant -= dias;
      }
      break;
    case "T":
      if (incDec === "inc") {
        obj.tramites_cant += dias;
      } else {
        obj.tramites_cant -= dias;
      }
      break;
    case "MD":
      if (incDec === "inc") {
        obj.mediodia_cant += dias / 2;
      } else {
        obj.mediodia_cant -= dias / 2;
      }
      break;
    case "CR":
      if (incDec === "inc") {
        obj.recuperados_cant += dias;
      } else {
        obj.recuperados_cant -= dias;
      }
      break;
    case "MR":
      if (incDec === "inc") {
        obj.mediodia_recuperados_cant += dias / 2;
      } else {
        obj.mediodia_recuperados_cant -= dias / 2;
      }
      break;
    default:
      obj = {
        ...obj,
        recuperados_cant: 0,
        mediodia_recuperados_cant: 0,
        enfermedad_cant: 0,
        maternidad_cant: 0,
        mediodia_cant: 0,
        tramites_cant: 0,
        vacaciones_cant: 0
      }
      break
  }

  //luego calculamos los valores generales
  //   1.- Se suman los dias recuperados y los medias dias recuperados
  obj.dias_recuperados = obj.recuperados_cant + obj.mediodia_recuperados_cant;
  //   2.- se suman los dias de vacaciones legales y total de dias recuperados
  obj.dias_acumulados = diasVacaciones + obj.dias_recuperados;
  //   3.- se suman todas las ausencias
  obj.dias_total_ausencias =
    obj.enfermedad_cant +
    obj.maternidad_cant +
    obj.mediodia_cant +
    obj.tramites_cant +
    obj.vacaciones_cant;
  //   4.- al total de dias acumulados le resto el total de ausencias para los dias pendientes
  obj.dias_pendientes = obj.dias_acumulados - obj.dias_total_ausencias;

  return obj;
}

import cantDaysBetweenTwoDate from "./cantDaysBetweenTwoDate";

export default function calculateVacationByDay(fechainicio, fechafin){
    const pivote = 15/365;
    const cantDias = cantDaysBetweenTwoDate(fechainicio, fechafin);
    return Math.round((pivote * cantDias), 0);
}
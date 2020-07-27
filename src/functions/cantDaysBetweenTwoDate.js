import moment from "moment";
moment().format();

export default function calculateCantDiasBetweenTwoDates(fechainicio, fechafin){
    const FechaStart = moment(fechainicio);
    const FechaEnd = moment(fechafin);
    return FechaEnd.diff(FechaStart, 'days');;
};

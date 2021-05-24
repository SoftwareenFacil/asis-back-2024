import moment from "moment";
import { FORMAT_DATE } from "../constant/var";
moment().format();

export default function calculateCantDiasBetweenTwoDates(fechainicio, fechafin){
    const FechaStart = moment(fechainicio, FORMAT_DATE);
    const FechaEnd = moment(fechafin, FORMAT_DATE);
    return FechaEnd.diff(FechaStart, 'days');
};

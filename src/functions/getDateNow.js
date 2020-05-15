export function getDate(fecha){
    let d = fecha,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minutes = d.getMinutes();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    if (hour.length < 2) 
        hour = '0' + hour;
    if (minutes.length < 2) 
        minutes = '0' + minutes;
    // let fecha = `${f.toISOString().slice(0, 10)} ${f.toISOString().slice(11, f.toString().length)}`
    // let fecha = f.toLocaleDateString('cl-CL').toISO
    return `${[year, month, day].join('-')} ${[hour, minutes].join(':')}`;
}
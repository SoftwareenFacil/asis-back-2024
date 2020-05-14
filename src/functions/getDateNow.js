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
    // let fecha = `${f.toISOString().slice(0, 10)} ${f.toISOString().slice(11, f.toString().length)}`
    // let fecha = f.toLocaleDateString('cl-CL').toISO
    return `${[year, month, day].join('-')} ${[hour, minutes].join(':')}`;
}
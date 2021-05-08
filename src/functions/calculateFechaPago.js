export function getFechaPago(fecha, dias){
    let date = new Date(fecha)
    let nuevodia = date.getDate() + dias;
    date.setDate(nuevodia)
    date.setDate(date.getDate() + 1)

    let d = date,
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

        return `${[day, month, year].join('-')}`;
}
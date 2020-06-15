import validateFormatDate from "./validateFormatDate";

export default function isValidateDate(fecha) {
  let rFecha = fecha.replace("-", "/");

  if (validateFormatDate(rFecha)) {
    let fechsSplit = rFecha.split("/");
    let day = fechsSplit[0];
    let month = fechsSplit[1];
    let year = fechsSplit[2];
    let date = new Date(year, month, "0");
    if (day - 0 > date.getDate() - 0) {
      return false;
    }
    return true;
  } else {
    return false;
  }
}

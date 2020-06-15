export default function validateFormatDate(fecha){
    let RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
      if ((fecha.match(RegExPattern)) && (fecha!='')) {
            return true;
      } else {
            return false;
      }
}
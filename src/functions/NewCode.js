import moment from 'moment';

export function calculate(item){
      var lastCode = item.codigo
      var nro = 0
      var newNumber = ''

      nro = Number(lastCode.substring((lastCode.length-5), lastCode.length))
      nro = nro + 1;
      if(nro >= 1 && nro <= 9){
        newNumber = `0000${nro}`
      }
      else if(nro > 9 && nro <= 99){
        newNumber = `000${nro}`
      }
      else if(nro > 99 && nro <= 999){
        newNumber = `00${nro}`
      }
      else if(nro > 999 && nro <= 9999){
        newNumber = `0${nro}`
      }
      else{
        newNumber = nro
      }

      return newNumber;
};

export function generateNewCodeRequest(oldcode) {
  if(!oldcode) return `ASIS-${moment().format('YYYY')}-SOL-00001`;
  const aux = oldcode.split('-');
  const auxNumber = parseInt(aux[3]);
  const newNumberCode = auxNumber + 1;
  let newFormatNumber;
  if(newNumberCode >= 1 && newNumberCode <= 9){
    newFormatNumber = `0000${newNumberCode}`
  }
  else if(newNumberCode > 9 && newNumberCode <= 99){
    newFormatNumber = `000${newNumberCode}`
  }
  else if(newNumberCode > 99 && newNumberCode <= 999){
    newFormatNumber = `00${newNumberCode}`
  }
  else if(newNumberCode > 999 && newNumberCode <= 9999){
    newFormatNumber = `0${newNumberCode}`
  }
  else{
    newFormatNumber = newNumberCode
  }
  const newCode = `${aux[0]}-${aux[1]}-${aux[2]}-${newFormatNumber}`;
  return newCode;
};


export function generateNewCodeRequestWithYear(oldcode, year) {
  if(!oldcode) return `ASIS-${moment().format('YYYY')}-SOL-00001`;
  const aux = oldcode.split('-');
  const auxNumber = parseInt(aux[3]);
  const newNumberCode = auxNumber + 1;
  let newFormatNumber;
  if(newNumberCode >= 1 && newNumberCode <= 9){
    newFormatNumber = `0000${newNumberCode}`
  }
  else if(newNumberCode > 9 && newNumberCode <= 99){
    newFormatNumber = `000${newNumberCode}`
  }
  else if(newNumberCode > 99 && newNumberCode <= 999){
    newFormatNumber = `00${newNumberCode}`
  }
  else if(newNumberCode > 999 && newNumberCode <= 9999){
    newFormatNumber = `0${newNumberCode}`
  }
  else{
    newFormatNumber = newNumberCode
  }
  const newCode = `${aux[0]}-${aux[1]}-${year}-${newFormatNumber}`;
  return newCode;
};
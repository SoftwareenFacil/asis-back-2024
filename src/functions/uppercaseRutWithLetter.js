export const upperRutWithLetter = (rut) => {
  const aux = rut.split('-');
  const dv = aux.length === 2 ? aux[1] : '';
  const newDv = (dv === 'k' || dv === 'K') ? 'K' : '';

  if(newDv === 'K'){
    return `${aux[0]}-${newDv}`;
  }
  
  return rut;
};
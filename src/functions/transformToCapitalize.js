export const TransformToCapitalize = (text) => {
  const aux = text.split(' ');
  console.log(aux)
  let result = "";
  aux.forEach(element => {
    result = result + element.toString().charAt(0).toUpperCase() + element.toString().slice(1)
  }); 
  console.log(result)
  return result || text;
}
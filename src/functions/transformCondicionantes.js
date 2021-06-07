export default function getCondicionatesString(condicionantes){
  if(!condicionantes || !condicionantes.length) return '';

  let finalString = '';
  condicionantes.forEach((element, index) => {
    if(index === 0){
      finalString = element;
    }
    else {
      finalString = `${finalString}, ${element}`
    }
  });

  return finalString;
}
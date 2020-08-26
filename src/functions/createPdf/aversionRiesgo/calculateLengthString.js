export default function calculatePhases(cadena, maxLength){
    const cantCharacters = cadena.length;
    const cantPhases = Math.round((cantCharacters / maxLength), 0);

    let finalCadena = [];
    let cont = 0;

    for(let i = 0; i<cantPhases; i++){
        finalCadena.push(cadena.substr(cont, maxLength));
        cont += maxLength;
    }

    return finalCadena;
}
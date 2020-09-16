export const PromedioStringToNumber = (opcion) => {
    const cadena = opcion.ToLowerCase();
    switch (cadena) {
        case 'bajo':
            return 1
            break;
        case 'promedio':
            return 2
            break;
        case 'alto':
            return 3
            break;
        default:
            return 0
            break;
    }
};
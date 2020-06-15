export default function eliminateDuplicated(arr, prop) {
    // let nuevoArray = [];
    // let lookup  = {};

    // for (let i in arr) {
    //     lookup[arr[i][prop]] = arr[i];
    // }

    // for (i in lookup) {
    //     nuevoArray.push(lookup[i]);
    // }

    const result = Array.from(new Set(arr.map(e => e.Rut)))
        .map(Rut =>{
            return arr.find(s => s.Rut === Rut)
        })

    return result;
}
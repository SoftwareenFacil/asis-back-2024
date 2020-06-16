export default function eliminateDuplicated(arr, prop) {
    const result = Array.from(new Set(arr.map(e => e.Rut)))
        .map(Rut =>{
            return arr.find(s => s.Rut === Rut)
        })

    return result;
}
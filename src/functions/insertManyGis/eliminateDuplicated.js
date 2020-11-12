export default function eliminateDuplicated(arr, prop) {
    const result = Array.from(new Set(arr.map(e => e.rut)))
        .map(rut =>{
            return arr.find(s => s.rut === rut)
        })

    return result;
}
export default function getPersonasGI(data){
    let personas = data.filter(gi => gi.TipoCliente === 'Persona Natural')
    return personas
}
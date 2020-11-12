export default function verificateGrupoInteres(data){
    let result = data.filter(e => e.grupo_interes === 'Clientes' || e.grupo_interes === 'Empleados' || e.grupo_interes === 'Colaboradores')
    return result;
}
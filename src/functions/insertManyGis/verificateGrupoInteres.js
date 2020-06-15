export default function verificateGrupoInteres(data){
    let result = data.filter(e => e.GrupoInteres === 'Clientes' || e.GrupoInteres === 'Empleados' || e.GrupoInteres === 'Colaboradores')
    return result;
}
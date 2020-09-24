export const isRolSolicitudes = (rol, idToken) => {
    switch (rol) {
        case 'Clientes':
            return {id_GI_Principal: idToken}
        case 'Colaboradores':
            return {id_GI_PersonalAsignado: idToken}
        case 'Empleados':
            return {}
        default:
            return {}
    }
};

export const isRolReservas = (rol, idToken) => {
    switch (rol) {
        case 'Clientes':
            return {id_GI_Principal: idToken}
        case 'Colaboradores':
            return {id_GI_personalAsignado: idToken}
        case 'Empleados':
            return {}
        default:
            return {}
    }
};

export const isRolEvaluaciones = (rol, tokenRut, idToken) => {
    switch (rol) {
        case 'Clientes':
            return {rut_cp: tokenRut}
        case 'Colaboradores':
            return {id_GI_personalAsignado: idToken}
        case 'Empleados':
            return {}
        default:
            return {}
    }
};

export const isRolResultados = (rol, tokenRut, idToken) => {
    switch (rol) {
        case 'Clientes':
            return {rut_cp: tokenRut}
        case 'Colaboradores':
            return {id_GI_personalAsignado: idToken}
        case 'Empleados':
            return {}
        default:
            return {}
    }
};

export const isRolEmpleados = (rol, tokenRut, idToken) => {
    switch (rol) {
        case 'Clientes':
            return {}
        case 'Colaboradores':
            return {}
        case 'Empleados':
            return {rut: tokenRut}
        default:
            return {}
    }
};
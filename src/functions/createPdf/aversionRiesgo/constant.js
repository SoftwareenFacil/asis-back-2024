import QRCode from "qrcode";
var path = require("path");

export const titles = ['Definición de escala', 'Bajo', 'Promedio', 'Alto'];

export const generalInformation = [
    'Empresa',
    'Nombre',
    'Edad',
    'RUT',
    'Educación Formal',
    'Cargo',
    'Maquinarias a Conducir',
    'Ciudad de referencia',
    'Evaluador',
    'Fecha de Evaluación',
    'Fecha de Vencimiento'
];

export const intelectual = [
    {
        name: 'Razonamiento Abstracto',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Percepción y concentración',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Compresión de Instrucciones',
        bajo: false,
        promedio: true,
        alto: false,
    }
];

export const adecuacionNormas = [
    {
        name: 'Acato a la autoridad',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Relación con grupos de pares',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Comportamiento social',
        bajo: false,
        promedio: false,
        alto: true,
    }
];

export const estabilidadEmocional = [
    {
        name: 'Locus de control / impulsividad',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Manejo de la frustración',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Empatía',
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: 'Grado de ansiedad',
        bajo: true,
        promedio: false,
        alto: false,
    },
];

export const actPrevencionRiesgos = [
    {
        name: ['Actitud general hacia la', 'prevensión de accidentes de', 'trabajo'],
        bajo: false,
        promedio: true,
        alto: false,
    },
    {
        name: ['Confianza en acciones realizadas'],
        bajo: true,
        promedio: false,
        alto: false,
    },
    {
        name: ['Capacidad para modificar el','ambiente a favor de la seguridad'],
        bajo: true,
        promedio: false,
        alto: false,
    },
];

export const motivacionCargo = [
    {
        name: 'Orientación a la tarea',
        bajo: false,
        promedio: false,
        alto: true,
    },
    {
        name: 'Energia vital',
        bajo: false,
        promedio: true,
        alto: false,
    },
];

export const conclusion = [
    {
        name: ['No representa conductas de', 'riegos'],
        verticalSpace: 0
    },
    {
        name: ['Presenta bajas conductas', 'de riesgos'],
        verticalSpace: 170
    },
    {
        name: ['Presenta altas conductas', 'de riesgos'],
        verticalSpace: 350
    },
];

export const nameFirma = [
    'ASIS CONSULTORES'
];

export const generateQR = async (path, text) => {

    try {
        await QRCode.toFile(path , String(text), {
            color: {
                light: '#000',  // white dots
                dark: '#0000' // transparent background
            }
        })
    } catch (err) {
        console.error(err)
    }
}

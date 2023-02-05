import QRCode from "qrcode";
var path = require("path");

export const titles = ["Definición de escala", "Bajo", "Promedio", "Alto"];

export const generalInformation = [
  "Empresa",
  "Evaluado",
  "Edad",
  "RUT",
  "Educación Formal",
  "Cargo",
  "Maquinarias a Conducir",
  "Ciudad de residencia",
  "Evaluador",
  "Fecha de Evaluación",
  "Fecha de Vencimiento",
];

export const intelectual = [
  {
    name: "Razonamiento Abstracto",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Percepción y concentración",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Compresión de Instrucciones",
    bajo: false,
    promedio: true,
    alto: false,
  },
];

export const adecuacionNormas = [
  {
    name: "Acato a la autoridad",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Relación con grupos de pares",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Comportamiento social",
    bajo: false,
    promedio: false,
    alto: true,
  },
];

export const estabilidadEmocional = [
  {
    name: "Locus de control / impulsividad",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Manejo de la frustración",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Empatía",
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: "Grado de ansiedad",
    bajo: true,
    promedio: false,
    alto: false,
  },
];

export const actPrevencionRiesgos = [
  {
    name: [
      "Actitud general hacia la",
      "prevención de accidentes de",
      "trabajo",
    ],
    bajo: false,
    promedio: true,
    alto: false,
  },
  {
    name: ["Confianza en acciones realizadas"],
    bajo: true,
    promedio: false,
    alto: false,
  },
  {
    name: ["Capacidad para modificar el", "ambiente a favor de la seguridad"],
    bajo: true,
    promedio: false,
    alto: false,
  },
];

export const motivacionCargo = [
  {
    name: "Orientación a la tarea",
    bajo: false,
    promedio: false,
    alto: true,
  },
  {
    name: "Energia vital",
    bajo: false,
    promedio: true,
    alto: false,
  },
];

export const conclusion = [
  {
    name: ["No presenta conductas de", "riegos"],
    verticalSpace: 0,
  },
  {
    name: ["Presenta bajas conductas", "de riesgos"],
    verticalSpace: 170,
  },
  {
    name: ["Presenta altas conductas", "de riesgos"],
    verticalSpace: 350,
  },
];

export const nameFirma = ["ASIS CONSULTORES"];

export const generateQR = async (path, text) => {
  try {
    await QRCode.toFile(path, String(text), {
      color: {
        light: "#000", // white dots
        dark: "#0000", // transparent background
      },
    });
  } catch (err) {
    console.error("Error al llamar al qr------", err);
  }
};

export const signByAssigmentProfessional = [
  {
    rut: "12398638-5",
    sign: "firma_12398638-5.png",
  },
  {
    rut: "17969180-9",
    sign: "firma_17969180-9.png",
  },
  {
    rut: "15977537-2",
    sign: "firma_15977537-2.png",
  },
  {
    rut: "18915456-9",
    sign: "firma_18915456-9.png",
  },
  {
    rut: "18952564-8",
    sign: "firma_18952564-8.png",
  },
  {
    rut: "19295903-9",
    sign: "firma_19295903-9.jpeg",
  },
];

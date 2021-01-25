// [
//     {
//         name: "intelectual",
//         weight: 1,
//         cantItems: 3,
//         results: [3, 1, 2]
//     }
// ]

export const calculateIndicators = results => {
    return results.length > 0 && results.map(function (el) {
        const multipliedResults = multiplyResult(el.results, el.weight);
        const reduceredResults = multipliedResults.reduce((acc, el) => acc + el);
        return {
            name: el.name,
            result: reduceredResults / el.cantItems
        }
    });
};

export const multiplyResult = (results = [], weight = 0) => {
    return results.length > 0 && results.map(e => e * weight);
};

export const getResultsTest = results => {
    return results.length > 0 && results.map(e => {
        if (e.result > 1 && e.result <= 1.49) return 'bajo';
        if (e.result > 1.49 && e.result <= 2.49) return 'promedio';
        if (e.result > 2.49 && e.result <= 3) return 'alto';
        return 'sin definicion';
    })
};

export const getResultTest = number => {
    if (number > 1 && number <= 1.49) return 'Bajo';
    if (number > 1.49 && number <= 2.49) return 'Promedio';
    if (number > 2.49 && number <= 3) return 'Alto';
    return 'sin definicion';
}

export const finalResponseTest = (results, word) => {
    return results.length > 0 && results.reduce((acc, el) => {
        return el === word ? acc + 1 : acc;
    }, 0)
};

export const testResult = number => {
    if (number === 0) return 1;
    if (number > 0 && number <= 2) return 2;
    if (number >= 3) return 3;
    return 0;
};

export const getAverage = array => {
    const total = array.length;
    const arrayNumbers = array.map(e => {
        switch (e) {
            case 'Bajo':
                return 1;
            case 'Promedio':
                return 2;
            case 'Alto':
                return 3;
            default:
                break;
        }
    });
    const reducered = arrayNumbers.reduce((acc, el) => el + acc);
    const result = reducered / total;
    return result;
};

export const getAverageNumbers = text => {
    switch (text) {
        case 'Bajo':
            return 0;
        case 'Promedio':
            return 1;
        case 'Alto':
            return 2;
    };
}

export const paraPhrasesTitles = (selectionOne, selectionTwo) => {
    const data = [
        {
            name: 'Intelectual',
            descriptions: [
                'Baja capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Dificultades para anteponerse a situaciones de riesgo.',
                'Capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Capacidad para anteponerse a situaciones de riesgo.',
                'Alta capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Capacidad para anteponerse a situaciones de riesgo.'
            ]
        },
        {
            name: 'adecuaciona las normas',
            descriptions: [
                'baja adecuación a normas, se sugiere, trabajar, respeto por la autoridad y adaptación a normativas y reglamentos.',
                'Adecuada capacidad de adaptarse a normativas y procedimientos.',
                'Alta capacidad de adaptarse a normativa y procedimientos, mostrando respeto por la autoridad y adecuadas relaciones con sus pares.'
            ]
        },
        {
            name: 'estabilidad emocional',
            descriptions: [
                'Se observa inestabilidad emocional, por lo que se sugiere observa su comportamiento ante tareas que requieren concentración, paciencia, tolerancia y trabajo en equipo.',
                'Adecuada estabilidad emocional, mostrando tolerancia y control de impulsos y autocontrol.',
                'Alta estabilidad emocional, control de impulsos, tolerancia a la frustración y autocontrol.'
            ]
        },
        {
            name: 'actitud a la prevención de los riesgos',
            descriptions: [
                'Se observa una actitud insegura ante la prevención de accidentes laborales, mostrando dificultades para modificar acciones o el entorno para prevenir riesgos.',
                'Se observa un comportamiento dubitativo con respecto a la actitud general hacia la prevención, la confianza en las acciones preventivas y la capacidad de modificar el ambiente en favor de la seguridad.',
                'Se observa un comportamiento seguro, con respecto a la actitud general hacia la prevención, la confianza en las acciones preventivas y la capacidad de modificar el ambiente en favor de la seguridad.'
            ]
        },
        {
            name: 'motivacion por el cargo',
            descriptions: [
                'Se observa una baja energía vital, falta de experiencia y falta de orientación a la tarea a realizar. Se sugiere observar sus expectativas. Apoyar y supervisar la ejecución de tareas.',
                'Se observa una adecuada energía vital, experiencia y de orientación a la tarea a realizar.',
                'Se observa una alta energía vital, experiencia y orientación a la tarea.'
            ]
        },
    ];

    return data[selectionOne].descriptions[selectionTwo];
}

export const paraPhrases = [
    {
        id: 1,
        name: 'razonamiento abstracto',
        descriptions: [
            'Baja capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Dificultades para anteponerse a situaciones de riesgo.',
            'Capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Capacidad para anteponerse a situaciones de riesgo.',
            'Alta capacidad de razonar REFLEXIVAMENTE, previo a ejecutar una acción y sobre las consecuencias de una determinada conducta. Capacidad para anteponerse a situaciones de riesgo.'
        ]
    },
    {
        id: 2,
        name: 'percepcion y concentracion',
        descriptions: [
            'Baja capacidad de percibir y atender estímulos. Se sugiere observar indicadores asociados como calidad de sueño, estrés, alteraciones emocionales. ',
            'Adecuada capacidad de percibir y atender estímulos.',
            'Alta capacidad de percibir y atender estímulos.'
        ]
    },
    {
        id: 3,
        name: 'comprension de instrucciones',
        descriptions: [
            'Baja capacidad para comprender instrucciones y planificar su ejecución de manera organizada. Se sugiere poner enfasis en la retroalimentación, despues de cada indicación y supervisar la planificación de la misma.',
            'Adecuada capacidad para comprender instrucción y planificar su ejecución de manera organizada.',
            'Alta capacidad para comprender instrucción y planificar su ejecución de manera organizada.'
        ]
    },
    {
        id: 4,
        name: 'acato a la autoridad',
        descriptions: [
            'Bajo grado de respeto por la autoridad, mostrando conductas y actitudes explicitas o implícitas de desacato. Se sugiere observar su comportamiento ante las personas que ejercen autoridad en el plano laboral, tanto de comportamientos explícitos, como implícitos.',
            'Adecuado grado de respeto por la autoridad',
            'Alto  grado de respeto por la autoridad, mostrándose dispuesto a acatar las instrucciones dadas por las figuras de autoridad. '
        ]
    },
    {
        id: 5,
        name: 'relacion con grupos de pares',
        descriptions: [
            'Se observan dificultades para relacionarse de manera adecuada con sus pares. Se sugiere formas de comunicación, grado de colaboración y participación activa. Estimular el trabajo colaborativo.',
            'Adecuada capacidad para relacionarse con sus pares, mostrando disposición para el trabajo colaborativo y en equipo. ',
            'Alta capacidad para relacionarse con sus pares, mostrando disposición para el trabajo colaborativo y en equipo.'
        ]
    },
    {
        id: 6,
        name: 'comportamiento antes procedimientos normas y protocolos',
        descriptions: [
            'Sus conductas muestran baja adecuación a las normas sociales. Se sugiere reforzar normativas, procedimientos y protocolos. Se sugiere realizar re-instrucción de los mismos y explorar intereses',
            'Sus conductas muestran adecuación a las normas sociales. ',
            'Sus conductas muestran alta adecuación a las normas sociales.'
        ]
    },
    {
        id: 7,
        name: 'control de impulsos',
        descriptions: [
            'El evaluado muestra un bajo control de sus impulsos, mostrando un actuar impulsivo. Se sugiere observar toma de decisiones y enfatizar el cumplimiento de protocolos. Si se siguen observando conductas impulsivas, se sugiere realizar ejercicios para control de impulsos. ',
            'Adecuado grado de control de impulsos. ',
            'Alto grado de control de impulsos.'
        ]
    },
    {
        id: 8,
        name: 'manejo de la frustracion',
        descriptions: [
            'Se observan dificultades para manejar y controlar la frustración, lo que puede generar sentimientos de  ansiedad, impaciencia y rabia, ante una tarea. Se sugiere reorganizar las tareas proyectando pequeñas metas.  ',
            'Adecuado manejo de la frustración. Se observan elementos que ayudan al autocontrol',
            'Alto manejo de la frustración. Se observan elementos que ayudan al autocontrol'
        ]
    },
    {
        id: 9,
        name: 'empatia',
        descriptions: [
            'Dificultades para ponerse en el lugar de otros, lo que afecta el trabajo colaborativo seguro. ',
            'Adecuadas habilidades para ponerse en el lugar de otros y colaborar.',
            'Altas habilidades para ponerse en el lugar de otros y colaborar. '
        ]
    },
    {
        id: 10,
        name: 'control de ansiedad',
        descriptions: [
            'Dificultades para controlar estados de ansiedad. Se sugiere evaluar si hay presencia de la misma y se recomiendan técnicas de control como por ejemplo relajación, reestructuración cognitiva, y cambios de hábitos.',
            'Adecuada capacidad para controlar estados ansiosos, demostrando mecanismos de autocontrol emocional.',
            'Alta capacidad para controlar estados ansiosos, demostrando adecuadas herramientas de autocontrol emocional.'
        ]
    },
    {
        id: 11,
        name: 'actitud hacia prevención de accidentes de trabajo',
        descriptions: [
            'Muestra una actitud insegura hacia la prevención de accidentes de trabajo. Se sugiere reforzar conocimientos y prácticas en el área preventiva.',
            'se observa una actitud neutral hacia la prevención de accidentes de trabajo, requiere mayor motivación y conocimiento de las mismas',
            'Actitud SEGURA hacia la prevención de accidentes de trabajo.'
        ]
    },
    {
        id: 12,
        name: 'confianza en acciones preventivas',
        descriptions: [
            'Muestra una conducta insegura, ya que no presta confianza en las acciones preventivas. Se sugiere reinstruir en prevención de riesgos.',
            'Muestra una posición ambivalente y neutral con respecto a acciones preventivas',
            'Muestra confianza en acciones preventivas.'
        ]
    },
    {
        id: 13,
        name: 'capacidad para modificar el ambiente',
        descriptions: [
            'No muestra la capacidad para realizar adaptaciones y/o modificaciones en favor de la seguridad en una tarea o acción. Se sugiere, re instruir en procedimientos',
            'Muestra una actitud neutra l y no definida con respecto a la necesidad de realizar modificaciones en el ambiente en favor de la seguridad. Se sugiere reforzar actitudes preventivas y de autocuidado.',
            'Posee la capacidad para modificar el ambiente a favor de la seguridad'
        ]
    },
    {
        id: 14,
        name: 'orientacion a la tarea',
        descriptions: [
            'Le cuesta orientar sus acciones a la tarea a realizar, mostrando distractivilidad u otros intereses Se sugiere reinstruir en la tarea.',
            'Adecuada orientación a la realización de la tarea',
            'Se muestra dispuesto y orientado a la tarea'
        ]
    },
    {
        id: 15,
        name: 'energia vital',
        descriptions: [
            'Se observa una baja motivación y energía para ejecutar las tareas encomendadas. Se sugiere explorar sus motivaciones y expectativas.',
            'Adecuado nivel de energía para dar cumplimiento a la tarea.',
            'Alto nivel de energía para realizar tareas, mostrando motivación y entusiasmo.'
        ]
    },
    {
        id: 16,
        name: 'experiencia',
        descriptions: [
            'No posee mucha experiencia en las tareas a realizar, se sugiere una supervisión y acompañamiento.',
            'Se aprecia una adecuada experiencia en las tareas del cargo.',
            'Se aprecia alto nivel de experiencia en las tareas del cargo.'
        ]
    },
];

export const getFormatBar = result => {
    switch (result) {
        case 'Bajo':
            return {
                space: 110,
                height: 30,
                vertical: 130,
                color: 'red'
            }
        case 'Promedio':
            return {
                space: 70,
                height: 70,
                vertical: 130,
                color: 'orange'
            }
        case 'Alto':
            return {
                space: 30,
                height: 110,
                vertical: 130,
                color: 'green'
            }
        default:
            return {
                space: 110,
                height: 0,
                vertical: 130,
                color: '#000'
            }
    }
}

export const footer = 'Los resultados contenidos en el presente informe son de carácter CONFIDENCIAL y existe autorización para revelar su contenido al trabajador y no a terceros. Asimismo, no está permitido reproducirlo a través de fotocopias. Este informe es de carácter ESPECÍFICO para el cargo al cual la persona se encuentra desempeñando. Las conclusiones de este documento tienen una validez máxima de 2 Años.';
// Ported & adapted from Sofoskratos9/psicometria (cuestionarios de autoconocimiento adaptados; NO son instrumentos validados ni tienen valor diagnóstico)

export type PsychometricTestId =
    | 'habitos_estudio_edaom'
    | 'estilos_aprendizaje_vak'
    | 'orientacion_vocacional_chaside'
    | 'inteligencia_emocional_baron';

export type QuestionScale = 'likert_5' | 'si_no';

export interface PsychometricQuestion {
    id: number;
    text: string;
    scale: QuestionScale;
    dimension: string;
}

export interface PsychometricTestDefinition {
    id: PsychometricTestId;
    name: string;
    description: string;
    category: string;
    estimatedMinutes: number;
    questions: PsychometricQuestion[];
    scoring: Record<string, number[]>;
    norms: Record<string, Record<string, [number, number]>>;
}

export const DIMENSION_LABELS: Record<string, string> = {
    adquisicion_informacion: 'Adquisición de Información',
    recuperacion_informacion: 'Recuperación y Repaso',
    procesamiento_informacion: 'Procesamiento Profundo',
    motivacion_aprendizaje: 'Motivación Académica',
    estrategias_aprendizaje: 'Estrategias de Estudio',
    administracion_recursos: 'Administración del Tiempo',
    visual: 'Canal Visual',
    auditivo: 'Canal Auditivo',
    kinestesico: 'Canal Kinestésico',
    intereses_cientificos: 'Intereses Científicos',
    intereses_humanisticos: 'Intereses Humanísticos',
    intereses_artisticos: 'Intereses Artísticos',
    intereses_sociales: 'Intereses Sociales',
    intereses_administrativos: 'Intereses Administrativos',
    aptitudes_cientificas: 'Aptitud Científica',
    aptitudes_humanisticas: 'Aptitud Humanística',
    aptitudes_artisticas: 'Aptitud Artística',
    aptitudes_sociales: 'Aptitud Social',
    aptitudes_administrativas: 'Aptitud Administrativa',
    intrapersonal: 'Autoconciencia Emocional',
    interpersonal: 'Empatía y Relación Social',
    adaptabilidad: 'Adaptabilidad y Flexibilidad',
    manejo_estres: 'Manejo de Estrés Pre-Examen',
    estado_animo: 'Estado de Ánimo y Optimismo',
};

const RAW_TESTS = {
    "habitos_estudio_edaom": {
        "id": "habitos_estudio_edaom",
        "name": "Inventario de Hábitos de Estudio (EDAOM)",
        "description": "Evalúa las estrategias de aprendizaje y orientación motivacional en estudiantes. Cuestionario de autoconocimiento, no validado ni diagnóstico.",
        "category": "educativo",
        "questions": [
            {
                "id": 1,
                "text": "Cuando estudio, subrayo las ideas principales del texto.",
                "scale": "likert_5",
                "dimension": "adquisicion_informacion"
            },
            {
                "id": 2,
                "text": "Elaboro esquemas o mapas conceptuales para organizar la información.",
                "scale": "likert_5",
                "dimension": "adquisicion_informacion"
            },
            {
                "id": 3,
                "text": "Relaciono lo que estoy aprendiendo con conocimientos previos.",
                "scale": "likert_5",
                "dimension": "adquisicion_informacion"
            },
            {
                "id": 4,
                "text": "Busco ejemplos prácticos de los conceptos teóricos que estudio.",
                "scale": "likert_5",
                "dimension": "adquisicion_informacion"
            },
            {
                "id": 5,
                "text": "Repaso regularmente lo que he estudiado para no olvidarlo.",
                "scale": "likert_5",
                "dimension": "recuperacion_informacion"
            },
            {
                "id": 6,
                "text": "Puedo recordar fácilmente lo que he estudiado cuando lo necesito.",
                "scale": "likert_5",
                "dimension": "recuperacion_informacion"
            },
            {
                "id": 7,
                "text": "Utilizo técnicas de memorización para recordar datos importantes.",
                "scale": "likert_5",
                "dimension": "recuperacion_informacion"
            },
            {
                "id": 8,
                "text": "Cuando me preguntan algo, puedo explicarlo con mis propias palabras.",
                "scale": "likert_5",
                "dimension": "recuperacion_informacion"
            },
            {
                "id": 9,
                "text": "Planifico mi tiempo de estudio estableciendo horarios específicos.",
                "scale": "likert_5",
                "dimension": "procesamiento_informacion"
            },
            {
                "id": 10,
                "text": "Identifico las condiciones que me ayudan a concentrarme mejor.",
                "scale": "likert_5",
                "dimension": "procesamiento_informacion"
            },
            {
                "id": 11,
                "text": "Evalúo mi propio aprendizaje para identificar lo que necesito mejorar.",
                "scale": "likert_5",
                "dimension": "procesamiento_informacion"
            },
            {
                "id": 12,
                "text": "Adapto mis estrategias de estudio según la dificultad del material.",
                "scale": "likert_5",
                "dimension": "procesamiento_informacion"
            },
            {
                "id": 13,
                "text": "Estudio porque me interesa aprender, no solo por obtener buenas calificaciones.",
                "scale": "likert_5",
                "dimension": "motivacion_aprendizaje"
            },
            {
                "id": 14,
                "text": "Me siento capaz de aprender los contenidos de mis materias.",
                "scale": "likert_5",
                "dimension": "motivacion_aprendizaje"
            },
            {
                "id": 15,
                "text": "Persisto en el estudio aunque encuentre dificultades.",
                "scale": "likert_5",
                "dimension": "motivacion_aprendizaje"
            },
            {
                "id": 16,
                "text": "Me entusiasma aprender cosas nuevas y profundizar en temas interesantes.",
                "scale": "likert_5",
                "dimension": "motivacion_aprendizaje"
            },
            {
                "id": 17,
                "text": "Participo activamente en clases haciendo preguntas o comentarios.",
                "scale": "likert_5",
                "dimension": "estrategias_aprendizaje"
            },
            {
                "id": 18,
                "text": "Busco información adicional sobre temas que me interesan.",
                "scale": "likert_5",
                "dimension": "estrategias_aprendizaje"
            },
            {
                "id": 19,
                "text": "Trabajo en equipo de manera efectiva con mis compañeros.",
                "scale": "likert_5",
                "dimension": "estrategias_aprendizaje"
            },
            {
                "id": 20,
                "text": "Utilizo recursos tecnológicos para apoyar mi aprendizaje.",
                "scale": "likert_5",
                "dimension": "estrategias_aprendizaje"
            },
            {
                "id": 21,
                "text": "Mantengo un ambiente de estudio ordenado y libre de distracciones.",
                "scale": "likert_5",
                "dimension": "administracion_recursos"
            },
            {
                "id": 22,
                "text": "Administro bien mi tiempo para cumplir con todas mis actividades académicas.",
                "scale": "likert_5",
                "dimension": "administracion_recursos"
            },
            {
                "id": 23,
                "text": "Utilizo eficientemente los recursos de la biblioteca o internet para mis tareas.",
                "scale": "likert_5",
                "dimension": "administracion_recursos"
            },
            {
                "id": 24,
                "text": "Organizo mis materiales de estudio de manera que pueda encontrarlos fácilmente.",
                "scale": "likert_5",
                "dimension": "administracion_recursos"
            }
        ],
        "scoring": {
            "adquisicion_informacion": [
                1,
                2,
                3,
                4
            ],
            "recuperacion_informacion": [
                5,
                6,
                7,
                8
            ],
            "procesamiento_informacion": [
                9,
                10,
                11,
                12
            ],
            "motivacion_aprendizaje": [
                13,
                14,
                15,
                16
            ],
            "estrategias_aprendizaje": [
                17,
                18,
                19,
                20
            ],
            "administracion_recursos": [
                21,
                22,
                23,
                24
            ]
        },
        "norms": {
            "adquisicion_informacion": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "recuperacion_informacion": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "procesamiento_informacion": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "motivacion_aprendizaje": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "estrategias_aprendizaje": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "administracion_recursos": {
                "bajo": [
                    0,
                    10
                ],
                "medio": [
                    11,
                    15
                ],
                "alto": [
                    16,
                    20
                ]
            },
            "global": {
                "bajo": [
                    0,
                    60
                ],
                "medio": [
                    61,
                    90
                ],
                "alto": [
                    91,
                    120
                ]
            }
        }
    },
    "estilos_aprendizaje_vak": {
        "id": "estilos_aprendizaje_vak",
        "name": "Inventario de Estilos de Aprendizaje VAK",
        "description": "Evalúa la preferencia por los canales de aprendizaje Visual, Auditivo y Kinestésico. Adaptado para población mexicana.",
        "category": "educativo",
        "questions": [
            {
                "id": 1,
                "text": "Cuando tengo que aprender algo nuevo, prefiero ver diagramas, imágenes o videos.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 2,
                "text": "Aprendo mejor cuando escucho la información o me la explican verbalmente.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 3,
                "text": "Prefiero aprender haciendo actividades prácticas o manipulando objetos.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 4,
                "text": "Recuerdo mejor lo que veo en imágenes, esquemas o presentaciones visuales.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 5,
                "text": "Aprendo más fácilmente participando en discusiones y debates.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 6,
                "text": "Necesito moverme o hacer algo con mis manos para entender mejor un concepto.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 7,
                "text": "Prefiero leer instrucciones o ver demostraciones antes de intentar algo.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 8,
                "text": "Recuerdo mejor lo que escucho que lo que leo.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 9,
                "text": "Aprendo mejor cuando puedo experimentar y practicar lo que estoy aprendiendo.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 10,
                "text": "Cuando recuerdo un evento, frecuentemente visualizo imágenes en mi mente.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 11,
                "text": "Aprendo mejor escuchando podcasts o grabaciones de audio.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 12,
                "text": "Prefiero clases donde hay actividades y no solo teoría.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 13,
                "text": "Cuando estudio, hago diagramas, esquemas o mapas mentales.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 14,
                "text": "Me gusta repetir en voz alta lo que estoy aprendiendo.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 15,
                "text": "Aprendo mejor cuando puedo construir o crear algo con mis manos.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 16,
                "text": "Prefiero ver un video tutorial que leer instrucciones escritas.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 17,
                "text": "Recuerdo mejor las conversaciones que he tenido que los textos que he leído.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 18,
                "text": "Me gusta moverme mientras estudio o aprendo algo nuevo.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            },
            {
                "id": 19,
                "text": "Cuando conozco un lugar nuevo, puedo visualizar fácilmente cómo llegar otra vez.",
                "scale": "likert_5",
                "dimension": "visual"
            },
            {
                "id": 20,
                "text": "Aprendo mejor cuando me explican verbalmente que cuando leo por mi cuenta.",
                "scale": "likert_5",
                "dimension": "auditivo"
            },
            {
                "id": 21,
                "text": "Prefiero participar activamente en lugar de solo observar o escuchar.",
                "scale": "likert_5",
                "dimension": "kinestesico"
            }
        ],
        "scoring": {
            "visual": [
                1,
                4,
                7,
                10,
                13,
                16,
                19
            ],
            "auditivo": [
                2,
                5,
                8,
                11,
                14,
                17,
                20
            ],
            "kinestesico": [
                3,
                6,
                9,
                12,
                15,
                18,
                21
            ]
        },
        "norms": {
            "visual": {
                "bajo": [
                    0,
                    17
                ],
                "medio": [
                    18,
                    25
                ],
                "alto": [
                    26,
                    35
                ]
            },
            "auditivo": {
                "bajo": [
                    0,
                    17
                ],
                "medio": [
                    18,
                    25
                ],
                "alto": [
                    26,
                    35
                ]
            },
            "kinestesico": {
                "bajo": [
                    0,
                    17
                ],
                "medio": [
                    18,
                    25
                ],
                "alto": [
                    26,
                    35
                ]
            }
        }
    },
    "orientacion_vocacional_chaside": {
        "id": "orientacion_vocacional_chaside",
        "name": "Test de Orientación Vocacional CHASIDE",
        "description": "Evalúa intereses y aptitudes para orientación vocacional según el modelo CHASIDE. Cuestionario de autoconocimiento, no validado ni diagnóstico.",
        "category": "vocacional",
        "questions": [
            {
                "id": 1,
                "text": "Me interesa curar enfermedades.",
                "scale": "si_no",
                "dimension": "intereses_humanisticos"
            },
            {
                "id": 2,
                "text": "Me gustaría diseñar edificios, puentes o viviendas.",
                "scale": "si_no",
                "dimension": "intereses_cientificos"
            },
            {
                "id": 3,
                "text": "Me gustaría escribir obras literarias o poesía.",
                "scale": "si_no",
                "dimension": "intereses_artisticos"
            },
            {
                "id": 4,
                "text": "Me gustaría ser un líder político o social.",
                "scale": "si_no",
                "dimension": "intereses_sociales"
            },
            {
                "id": 5,
                "text": "Me gustaría ser gerente de una empresa.",
                "scale": "si_no",
                "dimension": "intereses_administrativos"
            },
            {
                "id": 6,
                "text": "Me gustaría trabajar con cálculos matemáticos.",
                "scale": "si_no",
                "dimension": "intereses_cientificos"
            },
            {
                "id": 7,
                "text": "Me gustaría enseñar lo que sé a los demás.",
                "scale": "si_no",
                "dimension": "intereses_humanisticos"
            },
            {
                "id": 8,
                "text": "Me gustaría ser actor o actriz.",
                "scale": "si_no",
                "dimension": "intereses_artisticos"
            },
            {
                "id": 9,
                "text": "Me gustaría defender causas justas.",
                "scale": "si_no",
                "dimension": "intereses_sociales"
            },
            {
                "id": 10,
                "text": "Me gustaría vender productos o servicios.",
                "scale": "si_no",
                "dimension": "intereses_administrativos"
            },
            {
                "id": 11,
                "text": "Me gustaría investigar sobre el origen del universo.",
                "scale": "si_no",
                "dimension": "intereses_cientificos"
            },
            {
                "id": 12,
                "text": "Me gustaría ayudar a personas con problemas psicológicos.",
                "scale": "si_no",
                "dimension": "intereses_humanisticos"
            },
            {
                "id": 13,
                "text": "Me gustaría componer música.",
                "scale": "si_no",
                "dimension": "intereses_artisticos"
            },
            {
                "id": 14,
                "text": "Me gustaría trabajar en proyectos comunitarios.",
                "scale": "si_no",
                "dimension": "intereses_sociales"
            },
            {
                "id": 15,
                "text": "Me gustaría organizar y dirigir el trabajo de otros.",
                "scale": "si_no",
                "dimension": "intereses_administrativos"
            },
            {
                "id": 16,
                "text": "Me gustaría hacer experimentos científicos.",
                "scale": "si_no",
                "dimension": "intereses_cientificos"
            },
            {
                "id": 17,
                "text": "Me gustaría cuidar personas enfermas.",
                "scale": "si_no",
                "dimension": "intereses_humanisticos"
            },
            {
                "id": 18,
                "text": "Me gustaría diseñar ropa, objetos o espacios.",
                "scale": "si_no",
                "dimension": "intereses_artisticos"
            },
            {
                "id": 19,
                "text": "Me gustaría trabajar por los derechos humanos.",
                "scale": "si_no",
                "dimension": "intereses_sociales"
            },
            {
                "id": 20,
                "text": "Me gustaría administrar un negocio propio.",
                "scale": "si_no",
                "dimension": "intereses_administrativos"
            },
            {
                "id": 21,
                "text": "Tengo facilidad para las matemáticas y la física.",
                "scale": "si_no",
                "dimension": "aptitudes_cientificas"
            },
            {
                "id": 22,
                "text": "Me resulta fácil comunicarme y entender a las personas.",
                "scale": "si_no",
                "dimension": "aptitudes_humanisticas"
            },
            {
                "id": 23,
                "text": "Tengo habilidad para actividades que requieren creatividad.",
                "scale": "si_no",
                "dimension": "aptitudes_artisticas"
            },
            {
                "id": 24,
                "text": "Tengo facilidad para convencer a otros sobre mis ideas.",
                "scale": "si_no",
                "dimension": "aptitudes_sociales"
            },
            {
                "id": 25,
                "text": "Soy bueno organizando personas y recursos.",
                "scale": "si_no",
                "dimension": "aptitudes_administrativas"
            },
            {
                "id": 26,
                "text": "Tengo facilidad para resolver problemas lógicos.",
                "scale": "si_no",
                "dimension": "aptitudes_cientificas"
            },
            {
                "id": 27,
                "text": "Tengo facilidad para enseñar a otros.",
                "scale": "si_no",
                "dimension": "aptitudes_humanisticas"
            },
            {
                "id": 28,
                "text": "Tengo buen sentido estético y artístico.",
                "scale": "si_no",
                "dimension": "aptitudes_artisticas"
            },
            {
                "id": 29,
                "text": "Tengo facilidad para trabajar en equipo.",
                "scale": "si_no",
                "dimension": "aptitudes_sociales"
            },
            {
                "id": 30,
                "text": "Soy bueno administrando mi tiempo y recursos.",
                "scale": "si_no",
                "dimension": "aptitudes_administrativas"
            }
        ],
        "scoring": {
            "intereses_cientificos": [
                2,
                6,
                11,
                16
            ],
            "intereses_humanisticos": [
                1,
                7,
                12,
                17
            ],
            "intereses_artisticos": [
                3,
                8,
                13,
                18
            ],
            "intereses_sociales": [
                4,
                9,
                14,
                19
            ],
            "intereses_administrativos": [
                5,
                10,
                15,
                20
            ],
            "aptitudes_cientificas": [
                21,
                26
            ],
            "aptitudes_humanisticas": [
                22,
                27
            ],
            "aptitudes_artisticas": [
                23,
                28
            ],
            "aptitudes_sociales": [
                24,
                29
            ],
            "aptitudes_administrativas": [
                25,
                30
            ]
        },
        "norms": {
            "intereses_cientificos": {
                "bajo": [
                    0,
                    1
                ],
                "medio": [
                    2,
                    3
                ],
                "alto": [
                    4,
                    4
                ]
            },
            "intereses_humanisticos": {
                "bajo": [
                    0,
                    1
                ],
                "medio": [
                    2,
                    3
                ],
                "alto": [
                    4,
                    4
                ]
            },
            "intereses_artisticos": {
                "bajo": [
                    0,
                    1
                ],
                "medio": [
                    2,
                    3
                ],
                "alto": [
                    4,
                    4
                ]
            },
            "intereses_sociales": {
                "bajo": [
                    0,
                    1
                ],
                "medio": [
                    2,
                    3
                ],
                "alto": [
                    4,
                    4
                ]
            },
            "intereses_administrativos": {
                "bajo": [
                    0,
                    1
                ],
                "medio": [
                    2,
                    3
                ],
                "alto": [
                    4,
                    4
                ]
            },
            "aptitudes_cientificas": {
                "bajo": [
                    0,
                    0
                ],
                "medio": [
                    1,
                    1
                ],
                "alto": [
                    2,
                    2
                ]
            },
            "aptitudes_humanisticas": {
                "bajo": [
                    0,
                    0
                ],
                "medio": [
                    1,
                    1
                ],
                "alto": [
                    2,
                    2
                ]
            },
            "aptitudes_artisticas": {
                "bajo": [
                    0,
                    0
                ],
                "medio": [
                    1,
                    1
                ],
                "alto": [
                    2,
                    2
                ]
            },
            "aptitudes_sociales": {
                "bajo": [
                    0,
                    0
                ],
                "medio": [
                    1,
                    1
                ],
                "alto": [
                    2,
                    2
                ]
            },
            "aptitudes_administrativas": {
                "bajo": [
                    0,
                    0
                ],
                "medio": [
                    1,
                    1
                ],
                "alto": [
                    2,
                    2
                ]
            }
        }
    },
    "inteligencia_emocional_baron": {
        "id": "inteligencia_emocional_baron",
        "name": "Inventario de Inteligencia Emocional Bar-On ICE",
        "description": "Evalúa la inteligencia emocional según el modelo de Bar-On. Cuestionario de autoconocimiento, no validado ni diagnóstico.",
        "category": "profesional",
        "questions": [
            {
                "id": 1,
                "text": "Me resulta relativamente fácil expresar mis sentimientos.",
                "scale": "likert_5",
                "dimension": "intrapersonal"
            },
            {
                "id": 2,
                "text": "Soy bueno para comprender los sentimientos de las personas.",
                "scale": "likert_5",
                "dimension": "interpersonal"
            },
            {
                "id": 3,
                "text": "Puedo mantener la calma cuando estoy molesto.",
                "scale": "likert_5",
                "dimension": "manejo_estres"
            },
            {
                "id": 4,
                "text": "Soy feliz.",
                "scale": "likert_5",
                "dimension": "estado_animo"
            },
            {
                "id": 5,
                "text": "Me resulta fácil adaptarme a situaciones nuevas.",
                "scale": "likert_5",
                "dimension": "adaptabilidad"
            },
            {
                "id": 6,
                "text": "Sé cómo mantenerme tranquilo.",
                "scale": "likert_5",
                "dimension": "manejo_estres"
            },
            {
                "id": 7,
                "text": "Me resulta fácil decirle a la gente lo que siento.",
                "scale": "likert_5",
                "dimension": "intrapersonal"
            },
            {
                "id": 8,
                "text": "Me importa lo que les sucede a las personas.",
                "scale": "likert_5",
                "dimension": "interpersonal"
            },
            {
                "id": 9,
                "text": "Sé cómo divertirme.",
                "scale": "likert_5",
                "dimension": "estado_animo"
            },
            {
                "id": 10,
                "text": "Trato de valorar y darle el mejor sentido a mi vida.",
                "scale": "likert_5",
                "dimension": "intrapersonal"
            },
            {
                "id": 11,
                "text": "Tengo fuertes impulsos que son difíciles de controlar.",
                "scale": "likert_5",
                "dimension": "manejo_estres"
            },
            {
                "id": 12,
                "text": "Me resulta difícil cambiar de opinión.",
                "scale": "likert_5",
                "dimension": "adaptabilidad"
            },
            {
                "id": 13,
                "text": "Soy optimista en la mayoría de las cosas que hago.",
                "scale": "likert_5",
                "dimension": "estado_animo"
            },
            {
                "id": 14,
                "text": "Puedo comprender preguntas difíciles.",
                "scale": "likert_5",
                "dimension": "adaptabilidad"
            },
            {
                "id": 15,
                "text": "Soy sensible a los sentimientos de las otras personas.",
                "scale": "likert_5",
                "dimension": "interpersonal"
            }
        ],
        "scoring": {
            "intrapersonal": [
                1,
                7,
                10
            ],
            "interpersonal": [
                2,
                8,
                15
            ],
            "adaptabilidad": [
                5,
                12,
                14
            ],
            "manejo_estres": [
                3,
                6,
                11
            ],
            "estado_animo": [
                4,
                9,
                13
            ]
        },
        "norms": {
            "intrapersonal": {
                "bajo": [
                    0,
                    7
                ],
                "medio": [
                    8,
                    11
                ],
                "alto": [
                    12,
                    15
                ]
            },
            "interpersonal": {
                "bajo": [
                    0,
                    7
                ],
                "medio": [
                    8,
                    11
                ],
                "alto": [
                    12,
                    15
                ]
            },
            "adaptabilidad": {
                "bajo": [
                    0,
                    7
                ],
                "medio": [
                    8,
                    11
                ],
                "alto": [
                    12,
                    15
                ]
            },
            "manejo_estres": {
                "bajo": [
                    0,
                    7
                ],
                "medio": [
                    8,
                    11
                ],
                "alto": [
                    12,
                    15
                ]
            },
            "estado_animo": {
                "bajo": [
                    0,
                    7
                ],
                "medio": [
                    8,
                    11
                ],
                "alto": [
                    12,
                    15
                ]
            },
            "global": {
                "bajo": [
                    0,
                    37
                ],
                "medio": [
                    38,
                    52
                ],
                "alto": [
                    53,
                    75
                ]
            }
        }
    }
} as const;

export const PSYCHOMETRIC_TESTS: Record<PsychometricTestId, PsychometricTestDefinition> = {
    habitos_estudio_edaom: {
        ...RAW_TESTS.habitos_estudio_edaom,
        estimatedMinutes: 6,
        questions: RAW_TESTS.habitos_estudio_edaom.questions.map((q) => ({ ...q })),
        scoring: RAW_TESTS.habitos_estudio_edaom.scoring as unknown as Record<string, number[]>,
        norms: RAW_TESTS.habitos_estudio_edaom.norms as unknown as Record<string, Record<string, [number, number]>>,
    },
    estilos_aprendizaje_vak: {
        ...RAW_TESTS.estilos_aprendizaje_vak,
        estimatedMinutes: 5,
        questions: RAW_TESTS.estilos_aprendizaje_vak.questions.map((q) => ({ ...q })),
        scoring: RAW_TESTS.estilos_aprendizaje_vak.scoring as unknown as Record<string, number[]>,
        norms: RAW_TESTS.estilos_aprendizaje_vak.norms as unknown as Record<string, Record<string, [number, number]>>,
    },
    orientacion_vocacional_chaside: {
        ...RAW_TESTS.orientacion_vocacional_chaside,
        estimatedMinutes: 7,
        questions: RAW_TESTS.orientacion_vocacional_chaside.questions.map((q) => ({ ...q })),
        scoring: RAW_TESTS.orientacion_vocacional_chaside.scoring as unknown as Record<string, number[]>,
        norms: RAW_TESTS.orientacion_vocacional_chaside.norms as unknown as Record<string, Record<string, [number, number]>>,
    },
    inteligencia_emocional_baron: {
        ...RAW_TESTS.inteligencia_emocional_baron,
        estimatedMinutes: 4,
        questions: RAW_TESTS.inteligencia_emocional_baron.questions.map((q) => ({ ...q })),
        scoring: RAW_TESTS.inteligencia_emocional_baron.scoring as unknown as Record<string, number[]>,
        norms: RAW_TESTS.inteligencia_emocional_baron.norms as unknown as Record<string, Record<string, [number, number]>>,
    },
};

export interface PsychometricDimensionScore {
    dimension: string;
    label: string;
    rawScore: number;
    maxScore: number;
    percentage: number;
    level: 'alto' | 'medio' | 'bajo';
    interpretation: string;
}

export interface PsychometricResult {
    testId: PsychometricTestId;
    testName: string;
    completedAt: string;
    globalPercentage: number;
    topDimension: string;
    dimensions: PsychometricDimensionScore[];
    recommendation: string;
}

export function scorePsychometricTest(
    testId: PsychometricTestId,
    answers: Record<number, number>
): PsychometricResult {
    const test = PSYCHOMETRIC_TESTS[testId];
    const isBinary = test.questions[0]?.scale === 'si_no';
    const maxPerItem = isBinary ? 1 : 5;

    const dimensions: PsychometricDimensionScore[] = Object.entries(test.scoring).map(([dim, qIds]) => {
        const rawScore = qIds.reduce((sum, qId) => sum + (Number(answers[qId]) || 0), 0);
        const maxScore = Math.max(1, qIds.length * maxPerItem);
        const percentage = Math.round((rawScore / maxScore) * 100);

        const norm = test.norms[dim];
        let level: 'alto' | 'medio' | 'bajo' = 'medio';
        if (norm?.alto && rawScore >= norm.alto[0]) level = 'alto';
        else if (norm?.bajo && rawScore <= norm.bajo[1]) level = 'bajo';
        else if (percentage >= 75) level = 'alto';
        else if (percentage < 50) level = 'bajo';

        const label = DIMENSION_LABELS[dim] || dim;
        let interpretation = '';
        if (level === 'alto') {
            interpretation = `Fortaleza consolidada en ${label} (${percentage}%). Aprovecha esta ventaja como pilar de tu estrategia.`;
        } else if (level === 'medio') {
            interpretation = `Nivel intermedio en ${label} (${percentage}%). Con práctica constante puede convertirse en una fortaleza clave.`;
        } else {
            interpretation = `Área prioritaria en ${label} (${percentage}%). Conviene aplicar rutinas guiadas para elevar este indicador.`;
        }

        return {
            dimension: dim,
            label,
            rawScore,
            maxScore,
            percentage,
            level,
            interpretation,
        };
    });

    const sorted = [...dimensions].sort((a, b) => b.percentage - a.percentage);
    const globalPercentage = Math.round(
        dimensions.reduce((acc, d) => acc + d.percentage, 0) / Math.max(1, dimensions.length)
    );

    const top = sorted[0];
    const lowest = sorted[sorted.length - 1];

    let recommendation = `Tu dimensión sobresaliente es ${top?.label || 'General'} (${top?.percentage ?? 0}%).`;
    if (testId === 'estilos_aprendizaje_vak' && top) {
        recommendation = `Tu canal dominante es ${top.label} (${top.percentage}%). Adapta tus resúmenes y sesiones Pomodoro usando recursos de este canal.`;
    } else if (lowest && lowest.level === 'bajo') {
        recommendation += ` Prioriza fortalecer ${lowest.label} (${lowest.percentage}%) esta semana en tu Plan de Estudio.`;
    }

    return {
        testId,
        testName: test.name,
        completedAt: new Date().toISOString(),
        globalPercentage,
        topDimension: top?.label || 'General',
        dimensions,
        recommendation,
    };
}

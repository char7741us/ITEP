import type { NotebookSection } from "./failedRules";

export interface CoachGuide {
  title: string;
  idea: string;
  pattern: string;
  example: string;
  meaning: string;
  trap: string;
  steps: [string, string, string];
}

const comprehensionGuides: { match: RegExp; guide: CoachGuide }[] = [
  {
    match: /significado|contexto|closest in meaning/i,
    guide: {
      title: "Detective de palabras",
      idea: "No necesitas traducir cada palabra. Las frases vecinas dejan huellas sobre lo que significa.",
      pattern: "Palabra desconocida → pistas cercanas → significado probable",
      example: "The path was arduous; after six hours, everyone was exhausted.",
      meaning: "“Six hours” y “exhausted” indican que arduous se parece a “difícil”.",
      trap: "Una opción puede parecerse a la palabra en su forma, pero no encajar en la frase.",
      steps: ["Lee antes y después", "Sustituye mentalmente cada opción", "Elige la que conserva el sentido"],
    },
  },
  {
    match: /idea principal|propósito|main idea|main purpose/i,
    guide: {
      title: "La idea paraguas",
      idea: "La respuesta correcta cubre todo el texto o diálogo, no solo una frase llamativa.",
      pattern: "Detalles A + B + C → una idea que los reúne",
      example: "A speaker describes costs, benefits, and a final recommendation for a new bus route.",
      meaning: "La idea central sería evaluar una nueva ruta de autobús; un costo concreto es solo un detalle.",
      trap: "Descarta respuestas demasiado estrechas o más amplias que el contenido real.",
      steps: ["Resume en una oración", "Comprueba inicio y cierre", "Descarta detalles aislados"],
    },
  },
  {
    match: /comparar|diferencias|contrast|comparison/i,
    guide: {
      title: "Dos columnas, una diferencia",
      idea: "Ubica qué se dice de cada elemento antes de comparar; no mezcles sus características.",
      pattern: "Elemento A: característica 1  ↔  Elemento B: característica 2",
      example: "The old system is cheaper, whereas the new one is faster.",
      meaning: "Viejo = más económico. Nuevo = más rápido. La palabra whereas marca contraste.",
      trap: "Una opción puede invertir A y B aunque use las mismas palabras del texto.",
      steps: ["Identifica A y B", "Busca but, whereas o however", "Verifica a quién pertenece cada rasgo"],
    },
  },
  {
    match: /causas|motivos|consecuencias|reason|cause|effect/i,
    guide: {
      title: "Cadena de causa y efecto",
      idea: "Distingue el motivo de lo que ocurrió después: la pregunta suele pedir solo uno de los dos.",
      pattern: "Causa → cambio → consecuencia",
      example: "Because the roads flooded, the event was moved indoors.",
      meaning: "Causa: inundación. Consecuencia: trasladar el evento al interior.",
      trap: "Que dos hechos estén cerca no significa que uno causó el otro.",
      steps: ["Subraya because, so o therefore", "Pregunta ‘¿por qué?’", "Comprueba la dirección de la flecha"],
    },
  },
  {
    match: /inferir|conclusión|postura|imply|infer/i,
    guide: {
      title: "Lee entre líneas",
      idea: "Una inferencia no repite el texto: combina pistas para llegar a una conclusión prudente.",
      pattern: "Pista 1 + pista 2 → conclusión razonable",
      example: "‘The tickets sold out in minutes. We should book earlier next time.’",
      meaning: "Se puede inferir que la persona quería entradas y no las consiguió a tiempo.",
      trap: "Evita opciones extremas como always o never si las pistas no las justifican.",
      steps: ["Reúne dos pistas", "Formula una conclusión pequeña", "Evita inventar información"],
    },
  },
];

const detailGuide: CoachGuide = {
  title: "Cazador de pistas",
  idea: "La respuesta está dicha en el material. Tu reto es localizarla sin dejarte distraer por palabras parecidas.",
  pattern: "Pregunta → palabra clave → frase que la confirma",
  example: "‘The workshop starts at nine, but registration opens at eight.’",
  meaning: "Si preguntan cuándo empieza el taller, la respuesta es nine, no eight.",
  trap: "Un dato mencionado puede ser verdadero, pero responder otra pregunta.",
  steps: ["Marca la palabra clave", "Busca la frase exacta", "Comprueba que contesta la pregunta"],
};

const grammarGuides: { match: RegExp; guide: CoachGuide }[] = [
  {
    match: /future perfect/i,
    guide: {
      title: "Una meta en el futuro",
      idea: "Usa future perfect para una acción que ya estará terminada antes de un momento futuro.",
      pattern: "will have + participio pasado  →  antes de una fecha futura",
      example: "By Friday, she will have finished the report.",
      meaning: "El viernes será el límite; terminar ocurre antes de ese momento.",
      trap: "Después de have va el participio (finished), no el pasado simple como forma independiente.",
      steps: ["Busca by + momento futuro", "Ubica la acción terminada", "Elige will have + participio"],
    },
  },
  {
    match: /subjunctive|essential that|recommend that|insist/i,
    guide: {
      title: "La forma base manda",
      idea: "Después de una recomendación o exigencia formal, el verbo permanece en su forma base.",
      pattern: "suggest / insist / essential + that + sujeto + verbo base",
      example: "The teacher recommended that he study every day.",
      meaning: "Aunque el sujeto sea he, aquí se usa study, no studies.",
      trap: "En pasiva: that the work be completed; no reemplaces be por is.",
      steps: ["Detecta la recomendación", "Encuentra that", "Deja el verbo en forma base"],
    },
  },
  {
    match: /third conditional|hypothetical past|unreal past|if \+ past perfect|if clauses use the past perfect/i,
    guide: {
      title: "Viaje a un pasado imaginario",
      idea: "Para imaginar un pasado diferente, conecta una condición pasada con un resultado que no ocurrió.",
      pattern: "If + had + participio → would have + participio",
      example: "If I had studied, I would have passed.",
      meaning: "No estudié; por eso no aprobé. La frase imagina lo contrario.",
      trap: "No pongas would have en la parte que empieza por if.",
      steps: ["¿Habla de un pasado irreal?", "En if usa had + participio", "En el resultado usa would have"],
    },
  },
  {
    match: /\bwish\b.*past perfect/i,
    guide: {
      title: "Un deseo sobre el pasado",
      idea: "Wish + past perfect expresa arrepentimiento por algo que ocurrió o no ocurrió.",
      pattern: "I wish + had + participio pasado",
      example: "I wish I had saved the document.",
      meaning: "No lo guardé; ahora desearía haberlo hecho.",
      trap: "No confundas el deseo sobre el pasado con un plan futuro.",
      steps: ["Ubica el arrepentimiento", "Usa had + participio", "Comprueba qué ocurrió realmente"],
    },
  },
  {
    match: /real future condition|hypothetical present condition|if \+ present|if \+ past/i,
    guide: {
      title: "¿Real o imaginario?",
      idea: "La forma del condicional cambia según si la situación es posible o solo imaginada.",
      pattern: "Posible: if + present → will  ·  Imaginario: if + past → would",
      example: "If it rains, we will stay in. / If I had time, I would join.",
      meaning: "La primera situación puede ocurrir; la segunda imagina algo distinto del presente.",
      trap: "No uses will inmediatamente después de if en la condición real.",
      steps: ["Decide si es posible", "Elige present o past tras if", "Comprueba will o would"],
    },
  },
  {
    match: /past simple|present perfect|since january|since then|finished time expression/i,
    guide: {
      title: "Dos relojes del pasado",
      idea: "Una fecha cerrada pide past simple; un periodo conectado con ahora suele pedir present perfect.",
      pattern: "yesterday / last year → past simple  ·  since / for → have + participio",
      example: "We met in March. We have worked together since then.",
      meaning: "March es una fecha terminada; since then conecta pasado y presente.",
      trap: "No combines have + participio con una fecha cerrada como yesterday.",
      steps: ["Busca marcadores de tiempo", "Pregunta si el periodo sigue abierto", "Escoge la forma verbal"],
    },
  },
  {
    match: /article|\ba\/an\b|vowel sound|consonant sound|uncountable/i,
    guide: {
      title: "Escucha antes de elegir",
      idea: "A y an dependen del sonido inicial, no siempre de la primera letra escrita.",
      pattern: "sonido consonante → a  ·  sonido vocal → an",
      example: "a useful idea  ·  an hour  ·  some advice",
      meaning: "Useful empieza con sonido /y/; la h de hour es muda; advice no se cuenta con a/an.",
      trap: "Una vocal escrita no garantiza an, y un nombre incontable puede no llevar a/an.",
      steps: ["Pronuncia la palabra", "Escucha el primer sonido", "Comprueba si el nombre es contable"],
    },
  },
  {
    match: /collection|head noun/i,
    guide: {
      title: "El jefe de la frase",
      idea: "En una expresión como “a collection of reports”, el sujeto principal es collection, no reports.",
      pattern: "collection of reports → collection (uno) → is",
      example: "The collection of maps is on the desk.",
      meaning: "Aunque maps sea plural, collection es singular y por eso el verbo es is.",
      trap: "No hagas concordar el verbo con el sustantivo que aparece justo antes.",
      steps: ["Encuentra el núcleo del sujeto", "Ignora el complemento con of", "Haz concordar el verbo con el núcleo"],
    },
  },
  {
    match: /neither.*nor/i,
    guide: {
      title: "El vecino del verbo manda",
      idea: "Con neither…nor, el verbo concuerda con el sujeto que tiene más cerca.",
      pattern: "neither A nor B → mira B → elige el verbo",
      example: "Neither the coach nor the players are ready.",
      meaning: "Players está junto al verbo y es plural; por eso se usa are.",
      trap: "No te quedes solo con el primer sujeto después de neither.",
      steps: ["Encuentra neither y nor", "Mira el sujeto después de nor", "Elige singular o plural"],
    },
  },
  {
    match: /\beach\b/i,
    guide: {
      title: "Each cuenta de uno en uno",
      idea: "Each es singular, incluso cuando va seguido de un grupo en plural.",
      pattern: "Each of + plural → verbo singular",
      example: "Each of the students has a notebook.",
      meaning: "El sujeto es each (uno por uno), aunque students esté cerca.",
      trap: "No dejes que el plural después de of te haga elegir have.",
      steps: ["Busca each", "Piensa en una persona a la vez", "Usa la forma singular del verbo"],
    },
  },
  {
    match: /subject.verb|agrees|agreement|number of|plural|singular/i,
    guide: {
      title: "Encuentra al verdadero sujeto",
      idea: "El verbo debe concordar con el sujeto real, no con el sustantivo más cercano por accidente.",
      pattern: "Sujeto real → singular/plural → forma del verbo",
      example: "Each of the students has a notebook.",
      meaning: "El sujeto es each (singular), aunque students esté cerca.",
      trap: "Frases como along with no cambian el número del sujeto principal.",
      steps: ["Encuentra quién hace la acción", "Ignora los incisos", "Haz concordar el verbo"],
    },
  },
  {
    match: /gerund|infinitive|despite|had better|consider/i,
    guide: {
      title: "La palabra siguiente importa",
      idea: "Algunas expresiones exigen una forma concreta del verbo o un sustantivo después de ellas.",
      pattern: "enjoy / avoid / consider + -ing  ·  decide + to  ·  had better + base",
      example: "She enjoys reading, decided to leave, and had better wait.",
      meaning: "Reading sigue a enjoys; to leave sigue a decided; wait sigue a had better.",
      trap: "Despite no lleva of; had better no lleva to; enjoy no lleva to.",
      steps: ["Localiza la expresión", "Mira la palabra siguiente", "Verifica la estructura exigida"],
    },
  },
  {
    match: /inversion|hardly|scarcely|no sooner|not only/i,
    guide: {
      title: "El orden se da vuelta",
      idea: "Algunas expresiones al inicio de la oración hacen que el auxiliar aparezca antes del sujeto.",
      pattern: "Expresión inicial + auxiliar + sujeto + verbo",
      example: "Hardly had she arrived when it started to rain.",
      meaning: "Después de Hardly aparece had antes de she.",
      trap: "Recuerda la pareja: hardly/scarcely…when; no sooner…than.",
      steps: ["Detecta la expresión inicial", "Invierte auxiliar y sujeto", "Comprueba when o than"],
    },
  },
  {
    match: /relative|which|whose|who refers/i,
    guide: {
      title: "Conecta las dos ideas",
      idea: "El pronombre relativo depende del antecedente: persona, cosa o posesión.",
      pattern: "persona → who  ·  cosa → which  ·  posesión → whose",
      example: "The book, which I borrowed, is fascinating.",
      meaning: "Which apunta a book; las comas añaden información extra.",
      trap: "En una cláusula explicativa entre comas, no uses that.",
      steps: ["Encuentra el antecedente", "Decide persona/cosa/posesión", "Revisa las comas"],
    },
  },
  {
    match: /passive|be \+ past participle|was believed/i,
    guide: {
      title: "La acción en primer plano",
      idea: "La voz pasiva destaca lo que recibe la acción; a veces importa más el resultado que quien actúa.",
      pattern: "be (en el tiempo correcto) + participio pasado",
      example: "The results were published yesterday.",
      meaning: "Results recibe la acción. Were muestra pasado y plural.",
      trap: "No olvides hacer concordar be con el sujeto y el tiempo de la oración.",
      steps: ["Identifica quién recibe la acción", "Escoge el tiempo de be", "Añade el participio"],
    },
  },
  {
    match: /comparative|superlative|comparison|less \+ adjective|more in the comparative/i,
    guide: {
      title: "Compara con claridad",
      idea: "Para dos cosas suele usarse un comparativo; para destacar una entre tres o más, un superlativo.",
      pattern: "2 cosas → more/less … than  ·  3+ cosas → the most …",
      example: "This route is less crowded than that one. It is the most convenient of the three.",
      meaning: "Than introduce la comparación; of the three exige superlativo.",
      trap: "No mezcles more y -er en el mismo adjetivo.",
      steps: ["Cuenta los elementos", "Busca than u of the three", "Elige comparativo o superlativo"],
    },
  },
  {
    match: /preposition|with days of the week|clock time|with months/i,
    guide: {
      title: "El calendario de on, in y at",
      idea: "Las preposiciones de tiempo ayudan a saber si hablas de día, mes o momento exacto.",
      pattern: "on + día  ·  in + mes  ·  at + hora",
      example: "on Monday  ·  in October  ·  at 3 p.m.",
      meaning: "Piensa: página del calendario, bloque de tiempo, punto del reloj.",
      trap: "No uses at con un mes ni in con una hora exacta.",
      steps: ["Identifica la unidad de tiempo", "Día → on, mes → in", "Hora exacta → at"],
    },
  },
];

const fallbackGrammarGuide: CoachGuide = {
  title: "Arma la frase como un rompecabezas",
  idea: "Esta regla tiene una pista específica. Léela y compara la estructura de cada opción antes de decidir.",
  pattern: "Pista de la regla → estructura → opción que sí encaja",
  example: "The answer must fit both the meaning and the grammar of the full sentence.",
  meaning: "No basta con que una opción “suene bien”: debe respetar la regla y el contexto.",
  trap: "Descarta una opción solo cuando puedas decir qué parte de la regla rompe.",
  steps: ["Lee la regla original", "Subraya la señal en la frase", "Compara las cuatro estructuras"],
};

export function getCoachGuide(section: NotebookSection, failedRule: string): CoachGuide {
  if (section !== "Grammar") {
    return comprehensionGuides.find(({ match }) => match.test(failedRule))?.guide ?? detailGuide;
  }
  return grammarGuides.find(({ match }) => match.test(failedRule))?.guide ?? fallbackGrammarGuide;
}

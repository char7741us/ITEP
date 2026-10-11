export type Mark = "A" | "B" | "C" | "D";

export interface ErrorWordQuestion {
  kind: "error-word";
  sentence: string;
  wrong: Mark;
  correction: string;
  explanation: string;
}

export interface CompleteSentenceQuestion {
  kind: "complete-sentence";
  sentence: string;
  choices: [string, string, string, string];
  correct: Mark;
  explanation: string;
}

export type GrammarQuestion = ErrorWordQuestion | CompleteSentenceQuestion;

export interface GrammarC1Topic {
  id: string;
  title: string;
  focus: string;
  rule: string;
  example: string;
  subtopics: string[];
  questions: GrammarQuestion[];
}

const q = (sentence: string, wrong: Mark, correction: string, explanation: string): ErrorWordQuestion =>
  ({ kind: "error-word", sentence, wrong, correction, explanation });

const f = (sentence: string, choices: [string, string, string, string], correct: Mark, explanation: string): CompleteSentenceQuestion =>
  ({ kind: "complete-sentence", sentence, choices, correct, explanation });

export const grammarC1Topics: GrammarC1Topic[] = [
  {
    id: "subject-verb-agreement",
    title: "Subject–verb agreement",
    focus: "Tu prioridad: encuentra el verbo que no concuerda con el verdadero sujeto.",
    rule: "Encuentra el núcleo del sujeto; ignora los sustantivos que se interponen. Luego verifica si el verbo debe ser singular o plural.",
    example: "The collection of maps are on display. → The collection of maps is on display.",
    subtopics: ["Núcleo del sujeto", "each / every", "neither…nor / either…or", "there is / are", "the number / a number", "sujetos interrumpidos"],
    questions: [
      q("The [[A:collection]] of rare maps [[B:are]] displayed in the [[C:west]] [[D:gallery]].", "B", "is", "El sujeto es collection (singular), no maps; por eso se usa is."),
      q("Neither the [[A:editor]] nor the [[B:reviewers]] [[C:was]] satisfied with the final [[D:draft]].", "C", "were", "Con neither…nor, el verbo concuerda con el sujeto más cercano: reviewers (plural)."),
      q("Each of the [[A:applicants]] [[B:have]] [[C:submitted]] a [[D:portfolio]].", "B", "has", "Each es singular aunque applicants esté en plural; se necesita has."),
      q("[[A:Has]] a number of studies [[B:challenged]] the [[C:original]] [[D:theory]]?", "A", "Have", "A number of + plural equivale a 'varios'; el auxiliar debe ser Have."),
      q("The [[A:number]] of participants [[B:in]] the [[C:pilot]] [[D:have]] increased.", "D", "has", "The number of se trata como singular: has increased."),
      q("The professor, together with several [[A:assistants]], [[B:are]] preparing the [[C:annual]] [[D:conference]].", "B", "is", "Together with añade información, pero el sujeto principal sigue siendo professor."),
      q("There [[A:is]] several [[B:reasons]] why the proposal [[C:deserves]] further [[D:review]].", "A", "are", "En there is/are, el verbo concuerda con lo que viene después: several reasons."),
      q("The results of the [[A:survey]], not the initial [[B:hypothesis]], [[C:suggests]] a different [[D:conclusion]].", "C", "suggest", "Results es el sujeto plural; hypothesis no controla el verbo."),
      q("One of the [[A:chapters]] on [[B:climate]] policy [[C:discuss]] the [[D:issue]] in depth.", "C", "discusses", "One es el núcleo singular de 'one of the chapters'."),
      q("Every [[A:teacher]] and [[B:student]] in the [[C:program]] [[D:were]] invited.", "D", "was", "Every aplicado a cada miembro pide verbo singular: was."),
      q("The [[A:committee]] [[B:have]] issued its final [[C:report]] [[D:today]].", "B", "has", "En inglés americano, committee es singular cuando se trata como una unidad; its lo confirma."),
      q("What the [[A:report]] [[B:reveals]] [[C:are]] a clear [[D:pattern]] of change.", "C", "is", "Toda la idea 'what the report reveals' funciona aquí como sujeto singular."),
      q("[[A:Were]] more than one [[B:researcher]] involved in the [[C:initial]] [[D:review]]?", "A", "Was", "More than one + sustantivo singular normalmente lleva verbo singular."),
      q("The quality of the [[A:responses]] to the [[B:survey]] [[C:depend]] on the [[D:questions]] asked.", "C", "depends", "El sujeto es quality (singular), no responses."),
      q("Either the [[A:students]] or their [[B:instructor]] [[C:are]] responsible for the [[D:files]].", "C", "is", "Con either…or, el sujeto más cercano es instructor (singular)."),
      q("The [[A:authors]] who contributed to the [[B:volume]] [[C:has]] extensive [[D:experience]].", "C", "have", "Authors es el sujeto plural de has; la información entre ambos no cambia la concordancia."),
      q("Each of the findings, despite [[A:minor]] variations, [[B:indicate]] a [[C:significant]] [[D:trend]].", "B", "indicates", "Each pide verbo singular incluso después de una pausa larga."),
      q("The criteria for [[A:admission]] [[B:was]] revised after the [[C:faculty]] [[D:meeting]].", "B", "were", "Criteria es el plural de criterion; se necesita were."),
      q("The evidence [[A:collected]] during the [[B:trials]] [[C:are]] still under [[D:review]].", "C", "is", "Evidence es incontable y singular; trials no es el sujeto."),
      q("The proposal, as well as two [[A:alternatives]], [[B:require]] additional [[C:financial]] [[D:support]].", "B", "requires", "As well as no convierte en plural el sujeto proposal."),
      q("The [[A:series]] of experiments [[B:have]] revealed a [[C:consistent]] [[D:pattern]].", "B", "has", "Series es el núcleo singular de este sujeto; experiments no controla el verbo."),
      f("The list of courses that require fieldwork _____ online.", ["are", "is", "have", "being"], "B", "List es el sujeto singular; courses pertenece a la cláusula intermedia."),
      f("Neither the dean nor the reviewers _____ convinced by the evidence.", ["is", "are", "has", "was"], "B", "El verbo concuerda con el sujeto más cercano: reviewers."),
      f("Each of the proposals submitted this year _____ a budget.", ["include", "includes", "including", "are"], "B", "Each es singular, aunque proposals esté en plural."),
      f("There _____ several reasons why the policy may fail.", ["is", "are", "has", "was"], "B", "Reasons es plural; por eso se usa are."),
      f("The number of applicants who completed interviews _____ risen.", ["have", "has", "are", "were"], "B", "The number of es singular, aunque applicants esté en plural."),
      f("A number of applicants who completed interviews _____ requested feedback.", ["has", "have", "is", "was"], "B", "A number of significa varios; lleva have."),
      f("The proposal, together with its appendices, _____ approval.", ["require", "requires", "are requiring", "have required"], "B", "Proposal es el sujeto singular; together with no lo cambia."),
      f("What the data reveal _____ a consistent trend.", ["are", "is", "have", "were"], "B", "Toda la cláusula What the data reveal funciona como sujeto singular."),
    ],
  },
  {
    id: "tenses-aspect",
    title: "Tiempos y aspecto verbal",
    focus: "Secuencia temporal, perfect tenses y participios.",
    rule: "Relaciona la forma verbal con las pistas de tiempo: before, since, by the time, by + fecha futura.",
    example: "By the time she arrived, they had left.",
    subtopics: ["Past perfect", "Present perfect", "Future perfect", "formas -ing", "participios"],
    questions: [
      q("By the time the seminar [[A:began]], the speaker [[B:has]] already [[C:distributed]] the revised [[D:agenda]].", "B", "had", "La distribución ocurrió antes de otro hecho pasado; se necesita past perfect: had distributed."),
      q("The researchers have [[A:analyze]] the [[B:sample]] since the [[C:project]] [[D:began]].", "A", "analyzed", "Después de have va el participio pasado: have analyzed."),
      q("At this time next month, the team will be [[A:present]] its findings at a [[B:major]] [[C:conference]] in [[D:London]].", "A", "presenting", "Will be + -ing expresa una acción en curso en un momento futuro."),
      q("The archive had [[A:close]] before the [[B:students]] [[C:arrived]] for their [[D:appointment]].", "A", "closed", "Had exige participio pasado: had closed."),
      q("By 2030, scientists will have [[A:develop]] more [[B:efficient]] methods for [[C:storing]] [[D:energy]].", "A", "developed", "Future perfect: will have + participio pasado."),
      q("By the time the review [[A:ended]], the panel had [[B:reach]] a [[C:firm]] [[D:decision]].", "B", "reached", "Después de had se usa el participio pasado: reached."),
      f("By the time the lecture began, the students _____ the article.", ["had read", "have read", "will read", "are reading"], "A", "La lectura ocurrió antes de begun: had read."),
      f("By next Friday, the team _____ its report.", ["will have submitted", "had submitted", "was submitting", "has been submitting"], "A", "By + fecha futura señala una acción que ya estará terminada."),
    ],
  },
  {
    id: "conditionals",
    title: "Condicionales e hipótesis",
    focus: "Posibilidad real, situación imaginaria y pasado irreal.",
    rule: "Ubica el tiempo de la condición y del resultado: if + past → would; if + past perfect → would have.",
    example: "If they had checked, they would have noticed.",
    subtopics: ["First / second / third conditional", "inverted conditionals", "unless", "would have"],
    questions: [
      q("If the committee [[A:had]] reviewed the evidence, it would have [[B:identify]] the [[C:error]] [[D:earlier]].", "B", "identified", "En el resultado del tercer condicional, would have lleva participio: identified."),
      q("Were the funds [[A:available]], the team [[B:will]] expand the [[C:trial]] [[D:immediately]].", "B", "would", "Were the funds available equivale a if the funds were available; el resultado usa would."),
      q("If she [[A:had]] more time, she [[B:would]] [[C:revises]] the [[D:proposal]].", "C", "revise", "Después de would se usa verbo base: revise."),
      q("Had they [[A:responded]] sooner, the outcome [[B:will]] have [[C:been]] more [[D:favorable]].", "B", "would", "Had they responded es una condición irreal pasada; el resultado pide would have."),
      q("Unless the authors [[A:submits]] the final draft, the journal [[B:cannot]] [[C:begin]] its [[D:review]].", "A", "submit", "Authors es plural; en esta condición con unless se usa present simple: submit."),
      q("If the team [[A:had]] known the deadline, it [[B:would]] have [[C:submit]] the [[D:report]].", "C", "submitted", "En el tercer condicional, would have exige participio pasado."),
      f("Had I known about the delay, I _____ earlier.", ["would have left", "will leave", "had left", "would leave"], "A", "Had I known expresa pasado irreal; corresponde would have left."),
      f("If the data were complete, the analysis _____ more reliable.", ["will be", "would be", "had been", "is"], "B", "If + pasado hipotético se combina con would + verbo base."),
    ],
  },
  {
    id: "inversion",
    title: "Inversión y énfasis",
    focus: "Rarely, hardly, no sooner y auxiliares antes del sujeto.",
    rule: "Tras ciertos adverbios iniciales, el auxiliar va antes del sujeto. Después de did va el verbo base.",
    example: "Hardly had the lecture begun when the alarm sounded.",
    subtopics: ["Negative adverbials", "hardly…when", "no sooner…than", "did + base"],
    questions: [
      q("Rarely [[A:has]] the reviewers [[B:seen]] such [[C:convincing]] [[D:evidence]].", "A", "have", "Con inversión, el auxiliar sigue concordando con reviewers (plural): have."),
      q("Only after the pilot ended [[A:did]] the researchers [[B:noticed]] the [[C:design]] [[D:flaw]].", "B", "notice", "Después de did va la forma base: notice."),
      q("Never [[A:had]] she [[B:encounter]] such a [[C:complex]] [[D:case]].", "B", "encountered", "Con had, el verbo principal va en participio: encountered."),
      q("Hardly [[A:had]] the lecture [[B:begun]] [[C:than]] the alarm [[D:sounded]].", "C", "when", "La pareja fija es hardly…when."),
      q("No sooner [[A:had]] the review [[B:started]] [[C:when]] a new [[D:issue]] emerged.", "C", "than", "La pareja fija es no sooner…than."),
      q("Seldom [[A:do]] the director [[B:accept]] such [[C:risky]] [[D:proposals]].", "A", "does", "El auxiliar invertido sigue concordando con director, sujeto singular."),
      f("Only after the audit _____ the error.", ["the team found", "did the team find", "the team finding", "the team has find"], "B", "Only after al inicio exige inversión: did the team find."),
      f("No sooner had the talk begun _____ the alarm sounded.", ["when", "than", "then", "that"], "B", "La pareja fija es no sooner…than."),
    ],
  },
  {
    id: "subjunctive",
    title: "Subjuntivo formal",
    focus: "Recommend, insist, essential + that + verbo base.",
    rule: "Tras peticiones y recomendaciones formales con that, usa la forma base, aunque el sujeto sea he/she/it.",
    example: "The board recommended that he attend.",
    subtopics: ["Mandative subjunctive", "forma base", "be pasivo", "verbos de recomendación"],
    questions: [
      q("The director recommended that every applicant [[A:submits]] a [[B:complete]] [[C:portfolio]] by [[D:Friday]].", "A", "submit", "Después de recommended that se usa verbo base: submit."),
      q("It is essential that the findings [[A:was]] [[B:reviewed]] before the report [[C:is]] [[D:released]].", "A", "be", "En el subjuntivo pasivo formal se usa be reviewed; was no concuerda con findings."),
      q("The panel insisted that he [[A:attends]] the [[B:hearing]] in [[C:person]] next [[D:week]].", "A", "attend", "Insisted that exige forma base: attend."),
      q("The board requested that the proposal [[A:be]] [[B:revises]] before final [[C:approval]] is [[D:granted]].", "B", "revised", "El subjuntivo pasivo es be + participio: be revised."),
      q("The panel requested that the findings [[A:be]] [[B:report]] in a more [[C:accessible]] [[D:format]].", "B", "reported", "El pasivo formal pide be + participio: be reported."),
      q("It is vital that the document [[A:be]] [[B:sign]] before the [[C:official]] [[D:deadline]].", "B", "signed", "El subjuntivo pasivo es be + participio: be signed."),
      f("The adviser recommended that she _____ the draft.", ["revises", "revise", "revised", "to revise"], "B", "Después de recommended that se usa el verbo base: revise."),
      f("The board insisted that the report _____ published immediately.", ["is", "be", "was", "being"], "B", "El subjuntivo pasivo formal usa be + participio."),
    ],
  },
  {
    id: "relatives-pronouns",
    title: "Relativos y pronombres",
    focus: "Who, whom, which, whose y referencias precisas.",
    rule: "Encuentra el antecedente: persona → who; cosa → which; posesión → whose. En cláusulas explicativas con comas evita that.",
    example: "The report, which was published yesterday, is online.",
    subtopics: ["Who / whom", "which / that", "whose", "where", "antecedentes"],
    questions: [
      q("The scholar [[A:which]] wrote the [[B:article]] later [[C:revised]] her [[D:conclusion]].", "A", "who", "Scholar es persona y sujeto del verbo wrote: who."),
      q("The report, [[A:that]] was published in [[B:June]], [[C:challenged]] several [[D:assumptions]].", "A", "which", "Una relativa explicativa entre comas usa which, no that."),
      q("The researchers [[A:who]] findings were [[B:cited]] thanked the [[C:committee]] for its [[D:support]].", "A", "whose", "El pronombre expresa posesión de findings: whose."),
      q("The laboratory [[A:which]] the samples were [[B:stored]] [[C:was]] recently [[D:renovated]].", "A", "where", "El laboratorio es el lugar donde se guardaron las muestras: where."),
      q("The candidate [[A:whom]] submitted the [[B:proposal]] also [[C:led]] the [[D:discussion]].", "A", "who", "Aquí el pronombre es sujeto de submitted: who."),
      q("The analyst [[A:whose]] published the [[B:study]] won an [[C:international]] [[D:award]].", "A", "who", "El pronombre es sujeto de published; whose expresaría posesión."),
      f("The scientist _____ work we cited will speak today.", ["who", "whose", "which", "whom"], "B", "Whose expresa posesión: el trabajo del científico."),
      f("The report, _____ appeared yesterday, challenges the theory.", ["that", "which", "who", "where"], "B", "Entre comas, la relativa explicativa de una cosa usa which."),
    ],
  },
  {
    id: "articles-determiners",
    title: "Artículos y determinantes",
    focus: "A, an, the, zero article, each y much/many.",
    rule: "Decide si el sustantivo es contable, singular o específico; escucha el sonido inicial, no solo la letra.",
    example: "An honest answer is more useful than a guess.",
    subtopics: ["a / an", "the / zero article", "countability", "each / every"],
    questions: [
      q("The study offers [[A:a]] [[B:honest]] assessment of the [[C:available]] [[D:evidence]].", "A", "an", "Honest comienza con sonido vocálico porque la h es muda: an honest assessment."),
      q("She gathered [[A:much]] [[B:useful]] [[C:examples]] for her [[D:presentation]].", "A", "many", "Examples es contable y plural; corresponde many."),
      q("The researchers selected [[A:an]] [[B:university]] in a [[C:rural]] [[D:area]].", "A", "a", "University empieza con sonido /juː/, consonántico: a university."),
      q("Every [[A:participants]] [[B:received]] the [[C:same]] written [[D:instructions]].", "A", "participant", "Every va seguido de sustantivo contable singular."),
      q("The team had [[A:few]] [[B:information]] about the [[C:earlier]] [[D:trial]].", "A", "little", "Information es incontable; se usa little information."),
      q("The team collected [[A:an]] [[B:useful]] [[C:example]] for the [[D:lesson]].", "A", "a", "Useful empieza con sonido /juː/, por eso se dice a useful example."),
      f("She gave _____ honest assessment of the results.", ["a", "an", "many", "few"], "B", "Honest empieza con sonido vocálico: an honest assessment."),
      f("The university collected _____ information than expected.", ["fewer", "less", "many", "few"], "B", "Information es incontable; con than se usa less."),
    ],
  },
  {
    id: "modifiers-parallelism",
    title: "Modificadores y paralelismo",
    focus: "Adjetivo vs. adverbio y listas con estructura consistente.",
    rule: "Un adverbio suele modificar el verbo; los elementos coordinados deben compartir forma gramatical.",
    example: "The team collected, analyzed, and reported the data.",
    subtopics: ["Adjective / adverb", "parallel lists", "correlative pairs", "misplaced modifiers"],
    questions: [
      q("The team [[A:careful]] [[B:reviewed]] every [[C:section]] of the [[D:report]].", "A", "carefully", "Reviewed es verbo; necesita el adverbio carefully."),
      q("The course requires [[A:reading]], [[B:writing]], and [[C:present]] [[D:research]].", "C", "presenting", "La lista debe mantener formas -ing: reading, writing, and presenting."),
      q("Her explanation was [[A:clear]], [[B:concise]], and [[C:logic]] in its [[D:structure]].", "C", "logical", "La serie contiene adjetivos: clear, concise, and logical."),
      q("The device operated [[A:efficient]] during the [[B:extended]] [[C:field]] [[D:trial]].", "A", "efficiently", "Operated es verbo; necesita efficiently."),
      q("The author not only [[A:collected]] data but also [[B:analyzing]] the [[C:results]] [[D:carefully]].", "B", "analyzed", "Not only...but also une formas paralelas: collected y analyzed."),
      q("The results were [[A:remarkable]] [[B:consistent]], and the [[C:analysis]] was [[D:thorough]].", "A", "remarkably", "Consistent es adjetivo; para intensificarlo se necesita el adverbio remarkably."),
      f("The reviewer explained the results _____.", ["clear", "clearly", "clarity", "clearing"], "B", "El verbo explained se modifica con el adverbio clearly."),
      f("The study aims to measure, compare, and _____ the results.", ["interpret", "interpreting", "interpreted", "interprets"], "A", "Los tres verbos de la lista mantienen la forma base."),
    ],
  },
  {
    id: "comparison-quantifiers",
    title: "Comparaciones y cantidades",
    focus: "As...as, than, fewer/less y formas comparativas.",
    rule: "Compara elementos equivalentes y distingue sustantivos contables de incontables.",
    example: "This method uses fewer resources than the earlier one.",
    subtopics: ["Comparatives", "as...as", "fewer / less", "double comparatives"],
    questions: [
      q("The new method uses [[A:less]] [[B:samples]] than the [[C:previous]] [[D:approach]].", "A", "fewer", "Samples es contable plural: fewer samples."),
      q("This result is [[A:more]] [[B:clearer]] than the [[C:initial]] [[D:estimate]].", "A", "much", "Clearer ya es comparativo; much clearer intensifica sin duplicarlo."),
      q("The second survey was as [[A:reliable]] [[B:than]] the [[C:first]] [[D:survey]].", "B", "as", "La estructura de igualdad es as reliable as."),
      q("The committee considered the newer model [[A:better]] [[B:then]] the [[C:older]] [[D:version]].", "B", "than", "La comparación requiere than, no then."),
      q("The newer method is [[A:most]] [[B:efficient]] than the [[C:earlier]] [[D:design]].", "A", "more", "Than exige comparativo: more efficient, no most efficient."),
      q("This sample is [[A:larger]] [[B:that]] the [[C:earlier]] [[D:sample]].", "B", "than", "El comparativo larger va seguido de than."),
      f("The revised method is _____ efficient than the earlier one.", ["more", "most", "as", "much"], "A", "Than pide una forma comparativa: more efficient."),
      f("The second sample contains _____ participants than the first.", ["less", "fewer", "little", "much"], "B", "Participants es contable plural: fewer participants."),
    ],
  },
  {
    id: "passive-participles",
    title: "Voz pasiva y participios",
    focus: "Be + participio, pasiva en distintos tiempos y -ed/-ing.",
    rule: "En voz pasiva, conserva el tiempo en be y usa participio pasado para el verbo principal.",
    example: "The samples were examined under a microscope.",
    subtopics: ["Passive voice", "past participles", "-ed / -ing adjectives", "perfect passive"],
    questions: [
      q("The samples were [[A:examine]] under a [[B:powerful]] [[C:microscope]] [[D:yesterday]].", "A", "examined", "Were + participio: were examined."),
      q("The findings have [[A:been]] [[B:publish]] in a [[C:peer-reviewed]] [[D:journal]].", "B", "published", "El perfecto pasivo se forma con have been + participio."),
      q("The lecture was so [[A:interested]] that the [[B:audience]] [[C:stayed]] for [[D:questions]].", "A", "interesting", "La charla causa interés, por eso es interesting; el público está interested."),
      q("A revised version will [[A:be]] [[B:release]] after the [[C:final]] [[D:review]].", "B", "released", "Will be necesita participio para la pasiva: released."),
      q("The participants were [[A:surprising]] by the [[B:unexpected]] [[C:change]] in [[D:schedule]].", "A", "surprised", "Las personas sienten la sorpresa: were surprised."),
      q("The data were [[A:collecting]] during the [[B:summer]] field [[C:study]] [[D:abroad]].", "A", "collected", "Were + participio expresa la voz pasiva: were collected."),
      f("The samples _____ before the analysis began.", ["had been labeled", "have labeled", "were labeling", "will label"], "A", "La pasiva anterior a otro evento pasado usa had been labeled."),
      f("The findings will _____ in the final report.", ["present", "be presented", "be presenting", "presented"], "B", "La pasiva futura se forma con will be + participio."),
    ],
  },
  {
    id: "verb-patterns",
    title: "Patrones verbales",
    focus: "Infinitivo, gerundio y verbos que exigen una forma.",
    rule: "Aprende el patrón del verbo principal: avoid + -ing; decide + to; let + verbo base.",
    example: "They decided to revise the proposal.",
    subtopics: ["Gerunds", "infinitives", "bare infinitive", "verb complements"],
    questions: [
      q("The authors [[A:avoided]] [[B:repeat]] the [[C:same]] [[D:mistake]].", "B", "repeating", "Avoid requiere -ing: avoided repeating."),
      q("The team [[A:finished]] [[B:revise]] the [[C:final]] [[D:proposal]].", "B", "revising", "Finish requiere -ing: finished revising."),
      q("The supervisor made the interns [[A:checks]] every [[B:figure]] [[C:very]] [[D:carefully]].", "A", "check", "Después de make + objeto va el verbo base: made the interns check."),
      q("She suggested [[A:review]] the [[B:notes]] before the [[C:next]] [[D:session]].", "A", "reviewing", "Suggest + -ing: suggested reviewing."),
      q("The analyst considered [[A:change]] the [[B:criteria]] after the [[C:pilot]] [[D:study]].", "A", "changing", "Consider + -ing: considered changing."),
      q("The panel recommended [[A:postpone]] the [[B:meeting]] until [[C:next]] [[D:week]].", "A", "postponing", "Recommend va seguido de -ing si no hay objeto personal: recommended postponing."),
      f("She avoided _____ the same error.", ["repeat", "repeating", "to repeat", "repeated"], "B", "Avoid va seguido de -ing: avoided repeating."),
      f("The supervisor made them _____ the figures.", ["checking", "to check", "check", "checked"], "C", "Make + persona lleva verbo base: made them check."),
    ],
  },
  {
    id: "prepositions-connectors",
    title: "Preposiciones y conectores",
    focus: "Although/despite, because/because of y colocaciones.",
    rule: "Después de despite usa sustantivo o -ing; although introduce una cláusula completa.",
    example: "Despite the delay, the team finished on time.",
    subtopics: ["although / despite", "because / because of", "dependent prepositions", "transition words"],
    questions: [
      q("The survey continued [[A:although]] the [[B:heavy]] [[C:rain]] [[D:today]].", "A", "despite", "Despite va seguido de un sustantivo; although exige una cláusula con verbo."),
      q("The report depends [[A:in]] [[B:accurate]] data from [[C:several]] [[D:sources]].", "A", "on", "La colocación correcta es depend on."),
      q("The data were [[A:consistent]] [[B:to]] the [[C:earlier]] [[D:results]].", "B", "with", "La colocación es consistent with."),
      q("They [[A:participated]] [[B:on]] the [[C:international]] [[D:workshop]].", "B", "in", "La colocación es participate in."),
      q("The delay occurred [[A:because]] [[B:to]] the [[C:heavy]] [[D:rain]].", "B", "of", "Because of va seguido de un grupo nominal: because of the heavy rain."),
      q("The new policy is similar [[A:with]] the [[B:older]] [[C:regional]] [[D:policy]].", "A", "to", "La colocación correcta es similar to."),
      f("_____ the rain, the survey continued.", ["Although", "Despite", "Because", "Unless"], "B", "Despite se usa ante un sustantivo; although necesita una cláusula."),
      f("The conclusions are consistent _____ the earlier results.", ["to", "with", "on", "in"], "B", "La colocación es consistent with."),
    ],
  },
  {
    id: "reported-speech",
    title: "Estilo indirecto y secuencia",
    focus: "Reportar afirmaciones, preguntas y consejos.",
    rule: "En estilo indirecto, usa orden sujeto-verbo en las preguntas y ajusta el tiempo cuando corresponde.",
    example: "She asked where the samples were stored.",
    subtopics: ["Backshift", "reported questions", "say / tell", "reported requests"],
    questions: [
      q("She asked [[A:did]] the [[B:samples]] [[C:were]] in [[D:storage]].", "A", "whether", "La pregunta indirecta usa whether + sujeto + verbo: whether the samples were in storage."),
      q("The lecturer [[A:told]] that the [[B:results]] [[C:were]] still [[D:preliminary]].", "A", "said", "Say that introduce la afirmación sin objeto; told necesitaría un destinatario."),
      q("He asked [[A:whether]] the [[B:committee]] [[C:approve]] the [[D:proposal]] yesterday.", "C", "approved", "Yesterday sitúa la aprobación en el pasado: approved."),
      q("The adviser [[A:said]] us to [[B:revise]] the [[C:abstract]] [[D:carefully]].", "A", "told", "Tell + persona + to; said us to es incorrecto."),
      q("The researcher explained that she [[A:is]] [[B:working]] on the [[C:project]] the [[D:previous]] year.", "A", "was", "The previous year sitúa el trabajo en el pasado respecto a explained."),
      q("The instructor [[A:said]] the students that the [[B:exam]] [[C:was]] [[D:difficult]].", "A", "told", "Tell + destinatario + that; said no toma el objeto the students de esta forma."),
      f("She asked _____ the samples were ready.", ["did", "whether", "do", "are"], "B", "La pregunta indirecta usa whether + sujeto + verbo."),
      f("The adviser _____ us to revise the abstract.", ["said", "told", "spoke", "mentioned"], "B", "Tell + persona + to: told us to revise."),
    ],
  },
];

export interface SentencePart { text: string; mark?: Mark }

export function sentenceParts(sentence: string): SentencePart[] {
  const parts: SentencePart[] = [];
  const marker = /\[\[([ABCD]):([^\]]+)\]\]/g;
  let previous = 0;
  for (const match of sentence.matchAll(marker)) {
    const position = match.index ?? 0;
    if (position > previous) parts.push({ text: sentence.slice(previous, position) });
    parts.push({ text: match[2], mark: match[1] as Mark });
    previous = position + match[0].length;
  }
  if (previous < sentence.length) parts.push({ text: sentence.slice(previous) });
  return parts;
}

export function correctedSentence(question: ErrorWordQuestion): string {
  return sentenceParts(question.sentence)
    .map((part) => part.mark === question.wrong ? question.correction : part.text)
    .join("");
}

export function completedSentence(question: CompleteSentenceQuestion): string {
  return question.sentence.replace("_____", question.choices["ABCD".indexOf(question.correct)]);
}

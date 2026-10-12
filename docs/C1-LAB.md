# Laboratorio rumbo a C1 · octubre de 2026

Material original adicional, no bancos filtrados ni certificación de nivel:

- 12 talleres, 72 preguntas de estructuras en dos formularios por tema.
- 12 lecturas de 170–260 palabras con 36 preguntas de comprensión.
- 12 diálogos de 75–160 palabras con 36 preguntas de comprensión.
- 48 consignas Speaking (24 de cada formato) y 24 Writing (12 de cada formato).
- Las 60 sesiones anteriores, bancos históricos y resultados se conservan.

## Método y alcance

Contraste explicado → producción breve sin modelo → tres preguntas → reparación → dos respuestas productivas conservadas → nueva consigna → revisión diferida. Las estructuras incluyen tiempos/aspecto, concordancia, condicionales mixtos, modales, pasiva, relativas, patrones verbales, inversión, determinantes y concesión. Se reparan fundamentos que bloquean producción avanzada; no se etiqueta cada pregunta como C1.

El calendario 1/3/7/14 días es una decisión de producto basada en espaciado y recuperación activa, no un protocolo validado para garantizar C1. Un fallo o abrir el modelo reinicia el intervalo al día siguiente. Solo una ronda por fecha/perfil. Los mismos dos formularios vuelven a aparecer: distinguir familiaridad de transferencia mediante nuevas consignas y evaluación externa.

No inferir regresión personal comparando notas de tareas o dificultades diferentes. Comparar dos respuestas a la misma consigna describe revisión inmediata, no retención ni una medición independiente de nivel. Las notas de IA pueden fluctuar.

Fuentes primarias consultadas:

- [IES, Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1): espaciado, recuperación y evaluación del propio aprendizaje.
- [Consejo de Europa, aspectos cualitativos del habla MCER](https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use): precisión, fluidez, amplitud y coherencia C1.
- [iTEP, Academic Orientation Guide](https://www.itepexam.com/wp-content/uploads/2013/10/Academic-Orientation-Guide1.pdf): formatos y rangos orientativos. No prueba una distribución concreta de acentos.

## Voces y operación

`POST /api/listening-audio` acepta solo un ID conocido del banco y un acento permitido; nunca texto libre. Usa exclusivamente `GEMINI_API_KEY` del servidor y Gemini TTS. EE. UU., Canadá, Reino Unido, Australia e India son acentos **solicitados** a una voz sintética, no grabaciones de hablantes locales ni representaciones de toda una región. Requieren revisión auditiva antes de anunciar autenticidad regional.

La sugerencia de acentos favorece Norteamérica en 6 de cada 10 sesiones. Es una distribución de práctica, no una afirmación sobre el examen oficial. El estudiante puede elegir cualquiera. Los simulacros cronometrados mantienen sus pistas y reglas originales; la variedad se ofrece en las 60 sesiones de práctica y el laboratorio.

La generación usa cuota y puede tener coste. Hay timeout de 45 s, validación WAV, errores públicos genéricos, cuerpo máximo de 2 KB, control de origen y límite básico compartido de 12 peticiones/min/IP/instancia. La caché del servidor y la de la visita tienen un máximo de 12 audios; no son almacenamiento permanente ni cuota comercial distribuida. No añadir una API de síntesis de texto arbitrario ni exponer la clave al cliente. Antes de venta: autenticación, cuotas/presupuesto distribuidos y revisión contractual del proveedor.

IMPORTANTE: los audios heredados se produjeron en parte mediante voces del sistema macOS. No se crean más audios de ese tipo en este cambio. [Las licencias publicadas de Apple restringen usos públicos/comerciales de System Voices](https://www.apple.com/legal/sla/docs/macOSCatalina.pdf). Revisar el acuerdo aplicable a la versión usada y sustituir/autorizar los audios heredados **antes de comercializar**; conservar archivos existentes no concede derechos. El nuevo reproductor no presenta una pista heredada como si tuviera el acento seleccionado.

## Datos

Nuevas claves bajo `<perfil>:lab:v1:…` en el almacén persistente existente. No se contabilizan como días del programa original. Las rondas incluyen formulario y uso del modelo; ambas tomas, notas de reparación y borradores se incluyen en las copias de Mis datos. Las grabaciones usan IndexedDB, se exportan solo al incluir audios. No hay sincronización entre dispositivos ni acceso a notas personales desde el servidor. Solo al pulsar Evaluar se transmite una respuesta productiva al proveedor de IA.

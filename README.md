# iTEP Simulator

Simulacro de práctica completo para el examen **iTEP Academic-Plus**, construido con Next.js 16, React 19 y TypeScript.

## Características

- **5 secciones completas**: Reading, Listening, Grammar, Writing y Speaking
- **Temporizador real** con conteo regresivo en cada sección
- **Calificación por IA** usando Google Gemini para Writing y Speaking
- **Rubric detallado** con 4 dimensiones de evaluación (Fluidez, Gramática, Vocabulario, Coherencia)
- **Niveles CEFR** automáticos (Below B2, B2, C1, C2)
- **Dashboard de progreso** con gráficos de tendencia por habilidad
- **Mi espacio de estudio**: misión personalizada, calendario mensual de actividad, racha real, meta diaria ajustable, ocho logros y destellos por esfuerzo; todo persistido localmente y separado por perfil
- **Ruta personal semanal**: compromiso flexible de 2, 3 o 5 días, prioridad por habilidad y fecha de examen opcional; brújula de práctica que no confunde participación con nivel de inglés
- **Reto de 3 minutos**: recuperación activa antes de ver opciones, confianza, explicación y reflexión guardada; rota los 13 temas de Grammar y lleva errores al Cuaderno sin duplicar puntos
- **Mis datos**: exportación e importación local de progreso y grabaciones opcionales. La restauración añade registros faltantes sin reemplazar respuestas existentes; los archivos no están cifrados y deben mantenerse privados
- **Compañero virtual Mochi**: ilustración animada, nombre y colores personalizables; niveles y accesorios desbloqueables sin perder avances por descansar; respeta movimiento reducido
- **Coach de estudio** con Gemini: planes basados en resultados, reglas pendientes y feedback; explicaciones contextuales y microretos interactivos en el inicio y las áreas de práctica. Guía local cuando la IA no está disponible; oculto durante simulacros
- **Pausas interactivas** entre ejercicios: el estudiante elige un reto, aclarar una duda o descansar. Enfoque de 5/10/15 minutos que acompaña la navegación, se pausa al salir de la pestaña y no concede puntos por dejar correr el reloj
- **Cuaderno de Errores** local: agrupa temas fallados, ofrece mini lecciones ilustradas y retos de tres preguntas; registra días de estudio y logros por perfil. Tres aciertos consecutivos dominan un tema
- **Ruta Grammar C1 de 20 días** dentro del Cuaderno: 13 temas, 125 preguntas originales de detección de una palabra incorrecta y completar oraciones, repasos mixtos y reto final con preguntas nuevas. El avance diario se guarda localmente por perfil; cada día se aprueba con al menos 85 % de aciertos. No garantiza alcanzar C1 en ese plazo
- **Reintento de calificación** en resultados: cuando Gemini falla, Writing y Speaking pueden calificarse posteriormente desde las respuestas ya guardadas sin repetir el simulacro
- **6 simulacros completos nuevos** con lecturas, preguntas y audios distintos; los 2 bancos anteriores y sus 30 combinaciones permanecen disponibles para abrir resultados históricos, pero no se asignan a simulacros nuevos
- **60 sesiones cortas de práctica** con Grammar, Reading, Listening, Writing y Speaking: 60 textos, 60 diálogos con audio de dos voces, 540 preguntas objetivas y 120 consignas de producción; avance local por perfil
- **Modo Práctica** y **Modo Entrenamiento Intensivo**
- **Grabación de audio** directa desde el navegador con MediaRecorder API
- **Persistencia local** usando IndexedDB para intentos y grabaciones, y localStorage para el cuaderno

## Requisitos

- Node.js 20.9+ (verificado con Node.js 24.17)
- npm, yarn o pnpm
- API key de Google Gemini solo para la evaluación opcional de Writing/Speaking y la generación de preguntas nuevas del Cuaderno; las mini lecciones y los retos cubiertos por el banco de las 60 sesiones funcionan sin ella

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/itep-simulator.git
cd itep-simulator

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tu API key de Gemini
```

## Variables de Entorno

```env
# Una sola key de Gemini para todo: calificación de Writing/Speaking,
# generación de ejercicios gemelos y generación
# de audio real de Listening (TTS), y el futuro agente de voz de Modo Práctica.
GEMINI_API_KEY=tu_api_key_aqui
```

Gestiona tu clave en [Google AI Studio](https://aistudio.google.com/apikey). La disponibilidad, cuotas y tratamiento de datos dependen de tu proyecto y facturación. Revisa las [condiciones de Gemini](https://ai.google.dev/gemini-api/terms): esta integración está prevista para mayores de 18 años; no envíes datos sensibles. La clave permanece en el servidor, nunca en variables `NEXT_PUBLIC_*` ni en copias de progreso.

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter
npm run test             # Ejecutar tests
npm run validate:content # Valida los bancos de contenido contra el schema
npm run generate:audio   # Genera el audio real de Listening con Gemini TTS
                          # (requiere GEMINI_API_KEY; sin ella, el navegador usa
                          # su propia voz sintética como respaldo automático)
npm run render:daily-audio # Reconstruye los 60 audios de práctica (macOS: say + afconvert)
npm run render:mock-audio  # Reconstruye los 36 audios de los seis simulacros nuevos (macOS)
```

## Estructura del Proyecto

```
├── app/                    # Páginas Next.js (App Router)
│   ├── exam/               # Páginas del examen
│   ├── results/            # Página de resultados
│   ├── dashboard/          # Dashboard de progreso
│   ├── cuaderno-errores/   # Práctica de temas fallados
│   ├── practica-diaria/    # Plan de 60 sesiones originales
│   └── api/                # Calificación, ejercicios gemelos y coach
├── components/             # Componentes React
│   ├── exam/               # Componentes del examen
│   ├── dashboard/          # Componentes del dashboard
│   ├── learning/           # Espacio de estudio, mascota, coach, calendario y enfoque
│   └── results/            # Componentes de resultados
├── lib/                    # Lógica de negocio
│   ├── audio/              # Grabación y reproducción de audio
│   ├── content/            # Packs de contenido
│   ├── exam/               # Máquina de estados y scoring
│   ├── gemini/             # Integración con Google Gemini
│   ├── grammar-c1/         # Banco, plan de 20 días y progreso local
│   ├── notebook/           # Reglas falladas, estado persistente y rachas
│   ├── learning/           # Actividad real, recompensas, enfoque y contrato del coach
│   ├── storage/            # Persistencia (IndexedDB, localStorage)
│   └── types/              # Definiciones TypeScript
└── scripts/                # Scripts de validación
```

## Tecnologías

- **Framework**: Next.js 16.4.0 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **State**: XState v5 (máquina de estados del examen)
- **IA**: Google Gemini (Flash-Lite para Writing y Flash 3.8 para Speaking, con respaldo cruzado) para calificación
- **Almacenamiento**: IndexedDB + localStorage
- **Tests**: Vitest + Testing Library

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio (Vercel detecta Next.js automáticamente, sin configuración extra).
3. Antes del primer deploy, agrega la variable de entorno `GEMINI_API_KEY` en **Project Settings → Environment Variables** (Production, Preview y Development).
4. Deploy. Cada push a la rama principal despliega automáticamente.

Si generaste audio real con `npm run generate:audio`, los archivos `.wav` en `public/audio/` se despliegan como assets estáticos junto con el resto del sitio — no se necesita configuración adicional ni almacenamiento externo.

## Origen y alcance del material diario

Las 60 sesiones de `/practica-diaria` y los seis simulacros nuevos usan escenarios originales escritos para este proyecto. No se han copiado bancos de examen ni preguntas oficiales. La distribución de destrezas y los tipos de Writing/Speaking se inspiran en el [folleto oficial iTEP Academic](https://www.itepexam.com/wp-content/uploads/2022/05/iTEP-Academic-Brochure.pdf) y en la [guía de preparación iTEP](https://www.itepexam.com/wp-content/uploads/2013/10/iTEP-Preparation-Guide-3rd-Edition-22JUN12.pdf). La [página oficial de exámenes de práctica](https://www.itepexam.com/schedule-itep/prepare/practice-tests/) ofrece sus formularios auténticos por separado; este material no pretende sustituirlos.

Cada sesión diaria es deliberadamente más corta que un simulacro completo: contiene tres preguntas de Grammar, tres de Reading, tres de Listening, una tarea de Writing y una de Speaking. Se alternan mensajes breves y ensayos, así como los dos tipos de Speaking. Los audios estáticos fueron sintetizados con las voces de macOS y no dependen de Gemini. El progreso queda en `localStorage` y las grabaciones en `IndexedDB` del mismo navegador; borrar los datos del sitio elimina ese avance.

El plan `/cuaderno-errores/grammar` dedica cuatro días a subject–verb agreement, doce a los demás temas esenciales, tres a repasos mixtos y el último a un reto de trece preguntas inéditas. La guía oficial de iTEP permite identificar una palabra **o frase** incorrecta; este módulo usa deliberadamente solo palabras, como entrenamiento específico, y no es una certificación C1. No se reproducen preguntas oficiales.

## Compañero, calendario y coach

`itep-simulator:learning-companion` guarda actividad y personalización por perfil en localStorage. Una respuesta objetiva suma 5 destellos; una práctica oral o texto evaluado, 15; una ronda, 20; un tema superado, 30; una sesión diaria, 40; un simulacro completo, 80. Identificadores estables evitan sumar de nuevo por un autoguardado o una recarga. Abrir páginas, saludar a la mascota o dejar correr el enfoque no crea rachas. Los días se calculan en la zona horaria del navegador; antes de practicar hoy, la racha puede continuar desde ayer. Se recuperan sesiones, días de Grammar aprobados, temas superados y simulacros anteriores cuando hay una fecha guardada; no se inventan fechas para respuestas antiguas sin fecha.

`POST /api/coach` valida consulta, contexto y un resumen acotado de progreso; Gemini devuelve texto estructurado y un microreto opcional, validado antes de mostrarlo. No envía nombre de perfil, grabaciones ni todos los intentos al proveedor. La conversación es temporal y la clave permanece en el servidor. Ante ausencia o fallo de IA se ofrece una guía local identificada como tal. El coach no es un evaluador oficial ni promete alcanzar C1 en un plazo. No aparece durante `/exam/run/*`. El avance de estudio permanece en este navegador: no hay sincronización entre dispositivos ni base de datos externa.

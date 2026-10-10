# iTEP Simulator

Simulacro de práctica completo para el examen **iTEP Academic-Plus**, construido con Next.js 16, React 19 y TypeScript.

## Características

- **5 secciones completas**: Reading, Listening, Grammar, Writing y Speaking
- **Temporizador real** con conteo regresivo en cada sección
- **Calificación por IA** usando Google Gemini para Writing y Speaking
- **Rubric detallado** con 4 dimensiones de evaluación (Fluidez, Gramática, Vocabulario, Coherencia)
- **Niveles CEFR** automáticos (Below B2, B2, C1, C2)
- **Dashboard de progreso** con gráficos de tendencia por habilidad
- **Cuaderno de Errores** local: agrupa temas fallados y genera tres ejercicios nuevos por tema con Gemini; tres aciertos consecutivos lo marcan como dominado
- **6 simulacros completos nuevos** con lecturas, preguntas y audios distintos; los 2 bancos anteriores y sus 30 combinaciones permanecen disponibles para abrir resultados históricos, pero no se asignan a simulacros nuevos
- **60 sesiones cortas de práctica** con Grammar, Reading, Listening, Writing y Speaking: 60 textos, 60 diálogos con audio de dos voces, 540 preguntas objetivas y 120 consignas de producción; avance local por perfil
- **Modo Práctica** y **Modo Entrenamiento Intensivo**
- **Grabación de audio** directa desde el navegador con MediaRecorder API
- **Persistencia local** usando IndexedDB para intentos y grabaciones, y localStorage para el cuaderno

## Requisitos

- Node.js 18+ 
- npm, yarn o pnpm
- API key de Google Gemini solo para la evaluación opcional de Writing/Speaking y los ejercicios del Cuaderno de Errores; las 60 sesiones y sus audios funcionan sin ella

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

Consíguela gratis en [Google AI Studio](https://aistudio.google.com/apikey).

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
│   └── api/                # API routes para calificación y ejercicios gemelos
├── components/             # Componentes React
│   ├── exam/               # Componentes del examen
│   ├── dashboard/          # Componentes del dashboard
│   └── results/            # Componentes de resultados
├── lib/                    # Lógica de negocio
│   ├── audio/              # Grabación y reproducción de audio
│   ├── content/            # Packs de contenido
│   ├── exam/               # Máquina de estados y scoring
│   ├── gemini/             # Integración con Google Gemini
│   ├── notebook/           # Reglas falladas, estado persistente y rachas
│   ├── storage/            # Persistencia (IndexedDB, localStorage)
│   └── types/              # Definiciones TypeScript
└── scripts/                # Scripts de validación
```

## Tecnologías

- **Framework**: Next.js 16.3.3 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **State**: XState v5 (máquina de estados del examen)
- **IA**: Google Gemini (gemini-3.7-flash, con respaldo gemini-3.5-flash-lite) para calificación
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

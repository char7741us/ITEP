# iTEP Simulator

Simulacro de práctica completo para el examen **iTEP Academic-Plus**, construido con Next.js 16, React 19 y TypeScript.

## Características

- **5 secciones completas**: Reading, Listening, Grammar, Writing y Speaking
- **Temporizador real** con conteo regresivo en cada sección
- **Calificación por IA** usando Google Gemini para Writing y Speaking
- **Rubric detallado** con 4 dimensiones de evaluación (Fluidez, Gramática, Vocabulario, Coherencia)
- **Niveles CEFR** automáticos (Below B2, B2, C1, C2)
- **Dashboard de progreso** con gráficos de tendencia por habilidad
- **2 packs de contenido** con preguntas de dificultad examen real
- **Modo Práctica** y **Modo Entrenamiento Intensivo**
- **Grabación de audio** directa desde el navegador con MediaRecorder API
- **Persistencia local** usando IndexedDB para intentos y grabaciones

## Requisitos

- Node.js 18+ 
- npm, yarn o pnpm
- API key de Google Gemini (para calificación con IA)

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
# API key de Google Gemini para calificación de Writing y Speaking
GEMINI_API_KEY=tu_api_key_aqui

# API key del AI Gateway de Vercel (opcional)
AI_GATEWAY_API_KEY=tu_api_key_aqui
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
npm run test     # Ejecutar tests
```

## Estructura del Proyecto

```
├── app/                    # Páginas Next.js (App Router)
│   ├── exam/               # Páginas del examen
│   ├── results/            # Página de resultados
│   ├── dashboard/          # Dashboard de progreso
│   └── api/                # API routes para calificación
├── components/             # Componentes React
│   ├── exam/               # Componentes del examen
│   ├── dashboard/          # Componentes del dashboard
│   └── results/            # Componentes de resultados
├── lib/                    # Lógica de negocio
│   ├── audio/              # Grabación y reproducción de audio
│   ├── content/            # Packs de contenido
│   ├── exam/               # Máquina de estados y scoring
│   ├── gemini/             # Integración con Google Gemini
│   ├── storage/            # Persistencia (IndexedDB, localStorage)
│   └── types/              # Definiciones TypeScript
└── scripts/                # Scripts de validación
```

## Tecnologías

- **Framework**: Next.js 16.3.3 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **State**: XState v5 (máquina de estados del examen)
- **IA**: Google Gemini (gemini-2.5-flash) para calificación
- **Almacenamiento**: IndexedDB + localStorage
- **Tests**: Vitest + Testing Library

## Licencia

MIT

# Revisión de producto — estudiantes que preparan iTEP

## Experiencia implementada

- Inicio con misión, mascota, calendario, racha, meta y coach contextual.
- Ruta semanal editable: 2/3/5 días, habilidad prioritaria y fecha opcional. Solo las respuestas y prácticas reales activan el calendario; los puntos no representan nivel de inglés.
- Reto diario de tres minutos: hipótesis sin opciones, confianza, respuesta, explicación y reflexión persistente. Los errores alimentan el Cuaderno; una misma respuesta no duplica puntos. Rotación determinista de los 13 temas de Grammar.
- Respaldos portables validados: perfiles, progreso, Cuaderno, historial terminado y voz opcional. Sin sincronización automática, cifrado ni cuentas protegidas. Conservan registros existentes y añaden los faltantes; cerrar otras pestañas antes de restaurar.
- Feedback parcial honesto: Writing/Speaking sin evaluación no se presentan como cero ganado ni determinan la debilidad del alumno. El promedio incompleto se identifica como provisional.
- Estados de fallo y recuperación, advertencias de conexión/almacenamiento, navegación accesible y enlaces para saltar al contenido.

## Correcciones y protección

- Guardar el resultado durable antes de retirar la copia de reanudación del examen; reintento visible si falla.
- Validar entrada, tamaño real del cuerpo, formato de audio, rúbrica y dimensiones antes de guardar una nota. Recalcular promedio y banda en el servidor. Límites de tiempo y respaldo entre modelos.
- No devolver mensajes privados del proveedor ni claves al cliente. Instrucción del evaluador que trata la respuesta del alumno como datos, no como órdenes.
- Comprobación de origen y límite de 12 consultas/minuto por dirección y por instancia, compartido entre endpoints de IA. **No equivale a autenticación ni a cuotas distribuidas y no impide el abuso de clientes externos.**
- Cabeceras `nosniff`, protección de marcos, política de referente y permisos limitados a micrófono propio; deshabilitar `X-Powered-By`.
- Actualizar Next.js y su configuración de lint a 16.4.0, retirar SDK de IA no utilizado y mantener herramientas de generación fuera de dependencias de producción.

## Antes de cobrar a estudiantes

Esta entrega mejora el producto de práctica; no constituye una certificación de ausencia de errores ni habilita por sí sola una plataforma de venta.

1. Definir edad del público. Las condiciones actuales de Gemini exigen mayores de 18 años y excluyen clientes dirigidos o probablemente accesibles a menores. Si el público incluye menores, resolver proveedor/contrato y protección de datos antes de ofrecer IA. Un aviso de edad por sí solo no resuelve esto.
2. Elegir acceso: el perfil local **no es una cuenta**. Los datos son visibles para quien use el mismo navegador. Para restringir un producto pagado hacen falta identidad/acceso real y un diseño acordado; no ocultar que los datos no se sincronizan.
3. Elegir precio/pago, soporte, devolución, privacidad y términos comerciales. No se creó checkout, suscripción ni aceptación de contratos sin estas decisiones.
4. Definir límites de gasto de Google, cuotas durables por usuario, protección de endpoints en el borde y alertas. La limitación en memoria no controla el presupuesto en un despliegue distribuido.
5. Confirmar facturación y región de Gemini: el tratamiento de textos/audio difiere entre servicios gratuitos y de pago. No solicitar datos sensibles; informar del envío al proveedor y revisar requisitos aplicables con asesoría adecuada.
6. Revisar editorialmente respuestas y distractores; contrastar la estimación de notas con profesores y muestras calificadas. El contenido es original e independiente, no material oficial filtrado; no prometer C1 en 20 días ni equivalencia certificada.
7. Pruebas con estudiantes reales, dispositivos/Safari/Chrome, permiso real de micrófono y volumen de usuarios esperado. Este control manual no sustituye pruebas de carga ni auditoría de seguridad independiente.

## Verificación reproducible

`npm test`, `npm run lint`, `npm run validate:content`, `npm run build` y `npm audit --omit=dev`.

Revisión de esta entrega: tests de entradas y respuestas de IA, reglas de resultados parciales, ruta semanal, reto persistente y aislamiento entre perfiles, esquema/mezcla/restauración de respaldos y rollback ante cuota insuficiente. Navegación manual en compilación de producción: ruta personal, fecha, reto erróneo→Cuaderno, reflexión tras recarga, exportar→importar→recargar sin duplicar actividad y diseño móvil a 390 px.

La auditoría de dependencias de producción no detectó vulnerabilidades conocidas tras la actualización (11 de octubre de 2026). El árbol de herramientas de desarrollo aún informa nueve alertas altas transitivas relacionadas con `braces`/`micromatch` y herramientas de lint/generación. No se aplicaron degradaciones forzadas que romperían el proyecto; revisar versiones corregidas y ejecutar estas herramientas solo sobre entradas de confianza. No afirmar que toda la cadena está libre de vulnerabilidades.

Fuentes: [condiciones de Gemini](https://ai.google.dev/gemini-api/terms), [Next.js 16.4](https://nextjs.org/blog/next-16-4), [OWASP: consumo de recursos sin restricciones](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/).

"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="es"><body style={{ margin: 0, padding: 32, background: "#faf7f0", color: "#5b2938", fontFamily: "system-ui, sans-serif" }}><main style={{ maxWidth: 600, margin: "60px auto" }}><h1>Necesitamos volver a cargar tu espacio.</h1><p>No borres los datos de este navegador: ahí se conserva el progreso que se haya guardado.</p><button onClick={retry} style={{ padding: "12px 20px", cursor: "pointer" }}>Volver a intentar</button></main></body></html>;
}

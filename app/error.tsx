"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-16"><p className="text-4xl" aria-hidden="true">🌿</p><h1 className="text-2xl">Esta parte necesita un momento.</h1><p className="text-sm text-muted-foreground">Ocurrió un problema al mostrar la página. No borres los datos del navegador: ahí está tu progreso guardado. Si puedes, descarga una copia antes de cambiar de navegador.</p><div className="flex flex-wrap gap-4"><button onClick={retry} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Volver a intentar</button><Link href="/mis-datos" className="self-center text-sm underline">Guardar una copia</Link><Link href="/" className="self-center text-sm underline">Mi espacio</Link></div></div>;
}

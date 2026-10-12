import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto max-w-xl space-y-4 px-4 py-16"><p className="study-eyebrow">NOS SALIMOS UN MOMENTO DE LA RUTA</p><h1 className="text-3xl">Esta página no está aquí.</h1><p className="text-sm text-muted-foreground">Puedes volver a tu espacio o elegir una práctica. Un enlace incorrecto no borra tu avance guardado.</p><div className="flex flex-wrap gap-5 text-sm font-semibold"><Link href="/" className="underline underline-offset-4">Volver a mi espacio</Link><Link href="/practica-diaria" className="underline underline-offset-4">Elegir práctica diaria</Link></div></div>;
}

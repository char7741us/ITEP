"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStorageProblem } from "@/lib/storage/health";

export function SystemNotice() {
  const storageProblem = useStorageProblem();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (!storageProblem && !offline) return null;
  return <aside role={storageProblem ? "alert" : "status"} className="border-b border-amber-800/20 bg-amber-50 px-4 py-3 text-sm text-amber-950"><div className="mx-auto max-w-6xl">
    {storageProblem ? <p>{storageProblem} <Link href="/mis-datos" className="font-semibold underline">Mis datos →</Link></p> : <p>Estás sin conexión. La IA y el contenido que no se haya cargado necesitan internet. Conserva esta pestaña y vuelve a intentar al reconectarte.</p>}
  </div></aside>;
}

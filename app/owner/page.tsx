"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMe, apiOwnerCitas } from "../../lib/services/api";

export default function OwnerHome() {
  const [name, setName] = useState<string>("");
  const [citas, setCitas] = useState<any[]>([]);

  useEffect(() => {
    apiMe().then((me) => setName(me.dueno?.nombres || ""));
    apiOwnerCitas().then(setCitas);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Hola {name} 👋</h1>
      <p className="text-slate-600 mt-1">Administra a tus mascotas y agenda tus citas.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/owner/mascotas" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium text-slate-900">Mascotas</div>
          <div className="text-sm text-slate-600">Registrar, editar o eliminar</div>
        </Link>
        <Link href="/owner/citas" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium text-slate-900">Citas</div>
          <div className="text-sm text-slate-600">Agenda y consulta el estado</div>
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Próximas citas</h2>
        {citas.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no tienes citas registradas.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {citas.map((c) => (
              <li key={c.id} className="p-3 flex items-center justify-between text-sm">
                <span>
                  {new Date(c.fecha).toISOString().slice(0, 10)} · {c.horaTexto} · {c.estado}
                </span>
                <span className="text-slate-500">Motivo: {c.motivo}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


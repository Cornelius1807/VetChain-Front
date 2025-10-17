"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMe, apiVetCitas } from "../../lib/services/api";

export default function VetHome() {
  const [vet, setVet] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);

  useEffect(() => {
    apiMe().then((me) => setVet(me.veterinario));
    apiVetCitas().then(setCitas);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Bienvenido {vet?.nombre ?? ""}</h1>
      {vet && (vet.cuenta?.estado === "pending" || vet?.estadoVerificacion === false) && (
        <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          Tu cuenta está pendiente de aprobación por un administrador.
        </p>
      )}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/vet/agenda" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Agenda</div>
          <div className="text-sm text-slate-600">Bloquea o libera horarios</div>
        </Link>
        <Link href="/vet/citas" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Citas</div>
          <div className="text-sm text-slate-600">Revisa y atiende pacientes</div>
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Citas registradas</h2>
        {citas.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no hay citas.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {citas.map((c) => (
              <li key={c.id} className="p-3 flex items-center justify-between text-sm">
                <span>
                  {new Date(c.fecha).toISOString().slice(0, 10)} · {c.horaTexto} · {c.estado}
                </span>
                <Link className="text-teal-700 hover:underline" href={`/vet/citas/${c.id}`}>
                  Ver/Atender
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

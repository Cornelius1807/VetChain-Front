"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiVetCitas } from "../../../lib/services/api";

export default function VetCitasPage() {
  const [citas, setCitas] = useState<any[]>([]);

  useEffect(() => {
    apiVetCitas().then(setCitas);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Citas</h1>
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
    </div>
  );
}

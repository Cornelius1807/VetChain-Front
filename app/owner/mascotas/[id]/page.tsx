"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiHistorial } from "../../../../lib/services/api";

export default function HistorialMascotaPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiHistorial(id).then(setItems);
  }, [id]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Historial Clínico</h1>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">Sin atenciones registradas.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {items.map((c) => (
            <li key={c.id} className="p-3 text-sm">
              <div className="font-medium">
                {new Date(c.fecha).toISOString().slice(0, 10)} · {c.horaTexto} · {c.estado}
              </div>
              {c.hallazgos ? (
                <div className="mt-1">Hallazgos: {(() => { try { return JSON.parse(c.hallazgos).join(", "); } catch { return String(c.hallazgos); } })()}</div>
              ) : null}
              {c.tratamiento ? <div className="mt-1">Tratamiento: {c.tratamiento}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


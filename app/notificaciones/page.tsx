"use client";

import { useEffect, useState } from "react";
import { apiListNotifications } from "../../lib/services/api";
import type { NotificacionDTO } from "../../lib/types/api";

export default function NotificacionesPage() {
  const [items, setItems] = useState<NotificacionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiListNotifications()
      .then(setItems)
      .catch(() => setError("No se pudieron cargar las notificaciones."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando notificaciones...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Notificaciones</h1>
        <p className="text-sm text-slate-600">Eventos enviados por el sistema a tu correo registrado.</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-slate-600">No tienes notificaciones recientes.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {items.map((notif) => (
            <li key={notif.id} className="p-4 space-y-1 text-sm">
              <p className="font-semibold text-slate-900">{notif.tipo}</p>
              <p className="text-xs text-slate-500">{formatDateTime(notif.createdAt)}</p>
              <pre className="rounded-md bg-slate-50 p-3 text-xs text-slate-700 overflow-auto">
                {JSON.stringify(notif.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

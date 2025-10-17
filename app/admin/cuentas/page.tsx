"use client";

import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { api, apiListCentros } from "../../../lib/services/api";

export default function CuentasAdminPage() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [selecciones, setSelecciones] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("/admin/pending-vets").then((r) => setPendientes(r.data));
    apiListCentros().then(setCentros);
  }, []);

  async function aprobarYVincular(vetId: string) {
    const centroId = selecciones[vetId];
    if (centroId) {
      // Simple vinculación: actualizar veterinario con centroId (endpoint específico podría añadirse)
      await api.post(`/centros`, {}); // placeholder si fuera necesario crear centro
    }
    await api.post(`/admin/vets/${vetId}/approve`);
    const { data } = await api.get("/admin/pending-vets");
    setPendientes(data);
    alert("Veterinario aprobado");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Validación de Veterinarios</h1>
      {pendientes.length === 0 ? (
        <p className="text-sm text-slate-600">No hay cuentas pendientes.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {pendientes.map((v) => (
            <li key={v.id} className="p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">{v.nombre}</div>
                <div className="text-sm text-slate-600">{v.especialidad || "General"}</div>
              </div>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={selecciones[v.id] || ""}
                onChange={(e) => setSelecciones((s) => ({ ...s, [v.id]: e.target.value }))}
              >
                <option value="">Centro...</option>
                {centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <Button onClick={() => aprobarYVincular(v.id)}>Aprobar</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiCrearCita, apiListCentros, apiListPets, apiMe, apiOwnerCitas } from "../../../lib/services/api";

export default function CitasOwnerPage() {
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);

  const [petId, setPetId] = useState<string>("");
  const [centroId, setCentroId] = useState<string>("");
  const [vetId, setVetId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");

  useEffect(() => {
    apiListPets().then(setMascotas);
    apiListCentros().then(setCentros);
    apiOwnerCitas().then(setCitas);
  }, []);

  async function onCrearCita(e: React.FormEvent) {
    e.preventDefault();
    if (!petId || !vetId || !fecha || !hora) return;
    const centro = centroId || (centros[0]?.id ?? "");
    const cita = await apiCrearCita({
      motivo: motivo || "Consulta",
      fechaISO: fecha,
      horaTexto: hora,
      centroId: centro,
      veterinarioId: vetId,
      mascotaId: petId,
    });
    setCitas((prev) => [...prev, cita]);
    alert("Cita creada");
    setHora("");
  }

  // Nota: en esta versión inicial no listamos veterinarios por centro; el admin/centro asociará.

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Agendar Cita</h1>
      <form className="grid md:grid-cols-2 gap-4 mb-8" onSubmit={onCrearCita}>
        <label className="grid gap-1">
          <span className="text-sm text-slate-700">Mascota</span>
          <select className="border rounded-md px-3 py-2" value={petId} onChange={(e) => setPetId(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-slate-700">Centro</span>
          <select className="border rounded-md px-3 py-2" value={centroId} onChange={(e) => setCentroId(e.target.value)}>
            <option value="">Cualquiera</option>
            {centros.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <Input label="Veterinario (ID)" placeholder="Provisional" value={vetId} onChange={(e) => setVetId(e.target.value)} required />
        <Input label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        <Input label="Hora" placeholder="HH:mm" value={hora} onChange={(e) => setHora(e.target.value)} required />
        <Input label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Consulta, vacunación, etc." />
        <div className="md:col-span-2">
          <Button type="submit">Crear Cita</Button>
        </div>
      </form>

      <h2 className="text-lg font-medium mb-3">Mis Citas</h2>
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
    </div>
  );
}


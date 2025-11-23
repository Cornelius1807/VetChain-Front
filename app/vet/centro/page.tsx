"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiCreateCentro, apiListCentros, apiMe, apiVetUpdateCentro } from "../../../lib/services/api";
import type { CentroDTO, MeResponse } from "../../../lib/types/api";

export default function VetCentroPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [selectedCentro, setSelectedCentro] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    Promise.all([apiMe(), apiListCentros()])
      .then(([info, centrosResp]) => {
        setMe(info);
        setCentros(centrosResp);
        if (info.veterinario?.centroId) setSelectedCentro(info.veterinario.centroId);
      })
      .finally(() => setLoading(false));
  }, []);

  const vet = me?.veterinario;

  async function handleAsignar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCentro) {
      setFeedback("Selecciona un centro para asignar.");
      return;
    }
    try {
      setSaving(true);
      await apiVetUpdateCentro({ centroId: selectedCentro });
      const refreshed = await apiMe();
      setMe(refreshed);
      setFeedback("Centro asignado correctamente.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "No se pudo actualizar el centro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCrear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre || !form.direccion) {
      setFeedback("Nombre y dirección son obligatorios.");
      return;
    }
    try {
      setSaving(true);
      const centro = await apiCreateCentro({ nombre: form.nombre, direccion: form.direccion, telefono: form.telefono || undefined, email: form.email || undefined, consultorios: [] });
      setCentros((prev) => [...prev, centro]);
      setSelectedCentro(centro.id);
      setForm({ nombre: "", direccion: "", telefono: "", email: "" });
      setFeedback("Centro creado y asignado.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "No se pudo crear el centro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando...</div>;
  if (!vet) return <div className="mx-auto max-w-4xl px-4 py-8">Este módulo solo está disponible para veterinarios.</div>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Centros veterinarios</h1>
        <p className="text-sm text-slate-600">Asigna el centro donde trabajas o crea uno nuevo si cuentas con permiso.</p>
      </header>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Asignar centro existente</h2>
        <form className="mt-4 flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleAsignar}>
          <label className="flex-1 text-sm text-slate-700">
            Selecciona centro
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={selectedCentro}
              onChange={(e) => setSelectedCentro(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {centros.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={!selectedCentro || saving}>
            {saving ? "Guardando..." : "Asignar"}
          </Button>
        </form>
        {vet.centro && (
          <p className="mt-2 text-sm text-slate-500">
            Centro actual: <span className="font-semibold text-slate-800">{vet.centro.nombre}</span>
          </p>
        )}
      </section>

      {vet.puedeCrearCentro && (
        <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Crear nuevo centro</h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCrear}>
            <Input
              label="Nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            />
            <Input
              label="Dirección"
              required
              value={form.direccion}
              onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
            />
            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
            />
            <Input
              label="Correo"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creando..." : "Crear centro"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {feedback && <p className="text-sm text-teal-700">{feedback}</p>}
    </div>
  );
}

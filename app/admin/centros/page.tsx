"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiCreateCentro, apiListCentros } from "../../../lib/services/api";
import type { CentroDTO } from "../../../lib/types/api";
import { useSession } from "../../../lib/auth/session";

export default function CentrosAdminPage() {
  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { cuenta, loading: sessionLoading } = useSession();
  const isAdmin = cuenta?.rol === "admin";
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    email: "",
    telefono: "",
    rangoAtencionInicio: "08:00",
    rangoAtencionFin: "20:00",
    rangoConsultaInicio: "09:00",
    rangoConsultaFin: "18:00",
    consultorios: "",
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAdmin) {
      setError("Debes iniciar sesion como administrador.");
      setLoading(false);
      return;
    }
    apiListCentros()
      .then(setCentros)
      .catch(() => setError("No se pudieron cargar los centros."))
      .finally(() => setLoading(false));
  }, [sessionLoading, isAdmin]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;
    setError(null);
    if (!form.nombre || !form.direccion) {
      setError("Nombre y direccion son obligatorios.");
      return;
    }
    const consultorios = form.consultorios
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
    try {
      setSaving(true);
      const centro = await apiCreateCentro({
        nombre: form.nombre,
        direccion: form.direccion,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        rangoAtencionInicio: form.rangoAtencionInicio,
        rangoAtencionFin: form.rangoAtencionFin,
        rangoConsultaInicio: form.rangoConsultaInicio,
        rangoConsultaFin: form.rangoConsultaFin,
        consultorios,
      });
      setCentros((prev) => [...prev, centro]);
      setForm({
        nombre: "",
        direccion: "",
        email: "",
        telefono: "",
        rangoAtencionInicio: "08:00",
        rangoAtencionFin: "20:00",
        rangoConsultaInicio: "09:00",
        rangoConsultaFin: "18:00",
        consultorios: "",
      });
    } catch {
      setError("No se pudo crear el centro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || sessionLoading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando centros...</div>;
  if (!isAdmin) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-red-600">No tienes permiso para ver esta seccion.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Centros veterinarios</h1>
        <p className="text-sm text-slate-600">Registra centros para que los veterinarios puedan asignar sus agendas.</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Crear centro</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Input
            name="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            required
          />
          <Input
            name="direccion"
            label="Direccion"
            value={form.direccion}
            onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
            required
          />
          <Input
            name="email"
            label="Correo"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            name="telefono"
            label="Telefono"
            value={form.telefono}
            onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
          />
          <Input
            name="rangoAtencionInicio"
            label="Inicio atencion"
            type="time"
            value={form.rangoAtencionInicio}
            onChange={(e) => setForm((prev) => ({ ...prev, rangoAtencionInicio: e.target.value }))}
          />
          <Input
            name="rangoAtencionFin"
            label="Fin atencion"
            type="time"
            value={form.rangoAtencionFin}
            onChange={(e) => setForm((prev) => ({ ...prev, rangoAtencionFin: e.target.value }))}
          />
          <Input
            name="rangoConsultaInicio"
            label="Inicio consulta"
            type="time"
            value={form.rangoConsultaInicio}
            onChange={(e) => setForm((prev) => ({ ...prev, rangoConsultaInicio: e.target.value }))}
          />
          <Input
            name="rangoConsultaFin"
            label="Fin consulta"
            type="time"
            value={form.rangoConsultaFin}
            onChange={(e) => setForm((prev) => ({ ...prev, rangoConsultaFin: e.target.value }))}
          />
          <label className="md:col-span-2 grid gap-1">
            <span className="text-sm text-slate-700">Consultorios (uno por linea)</span>
            <textarea
              className="rounded-md border px-3 py-2 min-h-[90px]"
              value={form.consultorios}
              onChange={(e) => setForm((prev) => ({ ...prev, consultorios: e.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Registrar centro"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white">
        <h2 className="text-lg font-semibold text-slate-900 px-5 py-4 border-b">Centros registrados</h2>
        <ul className="divide-y">
          {centros.map((centro) => (
            <li key={centro.id} className="p-5 space-y-1 text-sm">
              <p className="text-base font-semibold text-slate-900">{centro.nombre}</p>
              <p className="text-slate-600">{centro.direccion}</p>
              <p className="text-xs text-slate-500">
                Contacto: {centro.telefono ?? "N/D"} - {centro.email ?? "N/D"}
              </p>
              <p className="text-xs text-slate-500">
                Atencion: {centro.rangoAtencionInicio ?? "-"} a {centro.rangoAtencionFin ?? "-"} | Consultas:{" "}
                {centro.rangoConsultaInicio ?? "-"} a {centro.rangoConsultaFin ?? "-"}
              </p>
              <p className="text-xs text-slate-500">Consultorios: {centro.consultorios.length}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

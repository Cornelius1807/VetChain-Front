"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiMe, apiRequestReset, apiUpdateMe } from "../../lib/services/api";
import type { MeResponse } from "../../lib/types/api";

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    apiMe()
      .then(setMe)
      .catch(() => setError("No se pudo cargar tu perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando...</div>;
  if (!me) return <div className="mx-auto max-w-4xl px-4 py-8">No encontramos tu informacion.</div>;

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!me) return;

    const formData = new FormData(event.currentTarget);
    const patch = buildPatch(me, formData);
    if (!Object.keys(patch).length) {
      setFeedback("No hay cambios por guardar.");
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      setError(null);
      await apiUpdateMe(patch);
      const refreshed = await apiMe();
      setMe(refreshed);
      setFeedback("Datos actualizados correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!me?.cuenta?.correo) return;
    setResetMessage(null);
    try {
      const response = await apiRequestReset(me.cuenta.correo);
      setResetMessage(response.token ? `Token de prueba: ${response.token}` : "Solicitud enviada al correo registrado.");
    } catch {
      setResetMessage("No se pudo enviar la solicitud. Intenta mas tarde.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-600">Consulta y actualiza solo tu informacion personal.</p>
      </div>

      <section className="rounded-lg border bg-white p-5 space-y-4">
        <header>
          <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Cuenta</p>
          <p className="text-xs text-slate-500">Rol: {me.cuenta.rol} - Estado: {me.cuenta.estado}</p>
        </header>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
          <Input name="correo" label="Correo electronico" defaultValue={me.cuenta.correo} type="email" required />
          {me.dueno && <Input name="telefono" label="Telefono" defaultValue={me.dueno.telefono ?? ""} />}
          {me.dueno && <Input name="nombres" label="Nombres" defaultValue={me.dueno.nombres} required />}
          {me.dueno && <Input name="apellidos" label="Apellidos" defaultValue={me.dueno.apellidos} required />}

          {me.veterinario && <Input name="nombre" label="Nombre" defaultValue={me.veterinario.nombre} required />}
          {me.veterinario && <Input name="telefono" label="Telefono" defaultValue={me.veterinario.telefono ?? ""} />}
          {me.veterinario && (
            <Input name="especialidad" label="Especialidad" defaultValue={me.veterinario.especialidad} required />
          )}

          {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
          {feedback && !error && <p className="text-sm text-teal-700 md:col-span-2">{feedback}</p>}
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-5 space-y-3">
        <header>
          <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Seguridad</p>
          <p className="text-xs text-slate-500">La contrasena nunca se muestra. Solo puedes cambiarla via correo.</p>
        </header>
        <Button type="button" onClick={handlePasswordReset}>
          Enviar solicitud para cambiar contrasena
        </Button>
        {resetMessage && <p className="text-xs text-slate-600">{resetMessage}</p>}
      </section>
    </div>
  );
}

function buildPatch(me: MeResponse, formData: FormData) {
  const patch: Record<string, unknown> = {};
  const correo = String(formData.get("correo") || "").trim();
  if (correo && correo !== me.cuenta.correo) patch.correo = correo;

  if (me.dueno) {
    const nombres = String(formData.get("nombres") || "").trim();
    const apellidos = String(formData.get("apellidos") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    if (nombres && nombres !== me.dueno.nombres) patch.nombres = nombres;
    if (apellidos && apellidos !== me.dueno.apellidos) patch.apellidos = apellidos;
    if (telefono !== (me.dueno.telefono ?? "")) patch.telefono = telefono || null;
  }

  if (me.veterinario) {
    const nombre = String(formData.get("nombre") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const especialidad = String(formData.get("especialidad") || "").trim();
    if (nombre && nombre !== me.veterinario.nombre) patch.nombre = nombre;
    if (telefono !== (me.veterinario.telefono ?? "")) patch.telefono = telefono || null;
    if (especialidad && especialidad !== me.veterinario.especialidad) patch.especialidad = especialidad;
  }

  return patch;
}

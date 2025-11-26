"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useSession } from "../../lib/auth/session";
import { apiMe, apiRequestDeleteAccount, apiRequestReset, apiUpdateMe } from "../../lib/services/api";
import type { MeResponse } from "../../lib/types/api";
import { absoluteUrl } from "../../lib/utils/url";

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { refresh } = useSession();

  useEffect(() => {
    apiMe()
      .then(setMe)
      .catch(() => setError("No se pudo cargar tu perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando...</div>;
  if (!me) return <div className="mx-auto max-w-4xl px-4 py-8">No encontramos tu informacion.</div>;
  const avatarSrc = avatarPreview ?? absoluteUrl(me.cuenta.avatarURL);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!me) return;

    const formData = new FormData(event.currentTarget);
    const patch = buildPatch(me, formData);
    if (avatarData) {
      patch.avatarData = avatarData;
    } else if (removeAvatar) {
      patch.removeAvatar = true;
    }
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
      setAvatarPreview(null);
      setAvatarData(null);
      setRemoveAvatar(false);
      await refresh();
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

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarPreview(null);
      setAvatarData(null);
      setRemoveAvatar(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
        setAvatarData(reader.result);
        setRemoveAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatarClick() {
    setAvatarPreview(null);
    setAvatarData(null);
    setRemoveAvatar(true);
  }

  async function handleDeleteRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteFeedback(null);
    setDeleteError(null);
    try {
      setDeleteLoading(true);
      await apiRequestDeleteAccount(deleteMotivo.trim() || undefined);
      setDeleteFeedback(
        "Solicitud enviada. El administrador revisará tu pedido y recibirás un correo cuando se complete."
      );
      setDeleteMotivo("");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo enviar la solicitud. Intenta nuevamente.");
    } finally {
      setDeleteLoading(false);
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
          <div className="md:col-span-2 flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="Avatar" width={80} height={80} className="h-20 w-20 object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Sin foto</div>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <label className="font-medium text-slate-700">
                Foto de perfil
                <input type="file" accept="image/*" className="mt-1 text-sm" onChange={handleAvatarChange} />
              </label>
              {(me.cuenta.avatarURL || avatarPreview) && (
                <button
                  type="button"
                  className="self-start text-xs font-semibold text-red-600 hover:underline"
                  onClick={handleRemoveAvatarClick}
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>
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

      <section className="rounded-lg border bg-white p-5 space-y-4">
        <header>
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Eliminar cuenta</p>
          <p className="text-xs text-slate-500">
            Puedes solicitar la eliminación de tu cuenta. Un administrador deberá aprobarla y se conservará solo la
            información auditoría requerida.
          </p>
        </header>
        <form className="space-y-3" onSubmit={handleDeleteRequest}>
          <label className="grid gap-1 text-sm text-slate-700">
            Motivo (opcional)
            <textarea
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              value={deleteMotivo}
              onChange={(e) => setDeleteMotivo(e.target.value)}
              placeholder="Cuéntanos por qué quieres eliminar tu cuenta..."
            />
          </label>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          {deleteFeedback && !deleteError && <p className="text-sm text-teal-700">{deleteFeedback}</p>}
          <Button type="submit" disabled={deleteLoading}>
            {deleteLoading ? "Enviando..." : "Solicitar eliminación"}
          </Button>
        </form>
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

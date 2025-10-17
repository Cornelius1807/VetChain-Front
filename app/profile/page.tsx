"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiMe, apiRequestReset, apiUpdateMe } from "../../lib/services/api";

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    apiMe().then(setMe).finally(() => setLoading(false));
  }, []);

  async function onUpdate(formData: FormData) {
    const patch: any = {};
    for (const [k, v] of formData.entries()) patch[k] = v;
    await apiUpdateMe(patch);
    alert("Datos actualizados");
  }

  async function onRequestReset() {
    const resp = await apiRequestReset(me?.cuenta?.correo);
    if (resp.token) setResetToken(resp.token);
    alert("Se envió una solicitud al correo registrado (simulada)");
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando…</div>;
  if (!me) return <div className="mx-auto max-w-4xl px-4 py-8">No hay datos</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Mi perfil</h1>
      <div className="rounded-md border p-4 grid gap-3">
        <div className="text-sm text-slate-700">Rol: {me.cuenta.rol}</div>
        <form action={onUpdate as any} className="grid md:grid-cols-2 gap-3">
          <Input name="correo" label="Correo" defaultValue={me.cuenta.correo} />
          {me.dueno && <Input name="telefono" label="Teléfono" defaultValue={me.dueno.telefono || ""} />}
          {me.dueno && <Input name="nombres" label="Nombres" defaultValue={me.dueno.nombres || ""} />}
          {me.dueno && <Input name="apellidos" label="Apellidos" defaultValue={me.dueno.apellidos || ""} />}
          {me.veterinario && <Input name="nombre" label="Nombre" defaultValue={me.veterinario.nombre || ""} />}        
          {me.veterinario && <Input name="especialidad" label="Especialidad" defaultValue={me.veterinario.especialidad || ""} />}
          <div className="md:col-span-2">
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-md border p-4">
        <div className="text-sm text-slate-700 mb-2">Seguridad</div>
        <Button onClick={onRequestReset}>Solicitar cambio de contraseña</Button>
        {resetToken && (
          <p className="text-xs text-slate-500 mt-2">Token simulado para pruebas: {resetToken}</p>
        )}
      </div>
    </div>
  );
}


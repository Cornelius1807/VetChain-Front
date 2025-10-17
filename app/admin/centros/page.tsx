"use client";

import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { api, apiListCentros } from "../../../lib/services/api";

export default function CentrosAdminPage() {
  const [centros, setCentros] = useState<any[]>([]);

  useEffect(() => {
    apiListCentros().then(setCentros);
  }, []);

  async function onCreate(formData: FormData) {
    const payload = {
      nombre: String(formData.get("nombre") || ""),
      direccion: String(formData.get("direccion") || ""),
      email: String(formData.get("correo") || ""),
      telefono: String(formData.get("telefono") || ""),
    };
    const { data } = await api.post("/centros", payload);
    setCentros((prev) => [...prev, data]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Centros Veterinarios</h1>
      <form action={onCreate as any} className="grid sm:grid-cols-2 gap-4 mb-6">
        <Input name="nombre" label="Nombre" required />
        <Input name="direccion" label="Dirección" required />
        <Input name="correo" label="Correo" type="email" />
        <Input name="telefono" label="Teléfono" />
        <div className="sm:col-span-2">
          <Button type="submit">Crear Centro</Button>
        </div>
      </form>

      <ul className="divide-y rounded-md border">
        {centros.map((c) => (
          <li key={c.id} className="p-3 text-sm">
            <div className="font-medium">{c.nombre}</div>
            <div className="text-slate-600">{c.direccion}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

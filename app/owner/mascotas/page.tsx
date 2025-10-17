"use client";

import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiCreatePet, apiDeletePet, apiListPets } from "../../../lib/services/api";

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    apiListPets().then(setMascotas);
  }, []);

  async function onAdd(formData: FormData) {
    const body = {
      nombre: String(formData.get("nombre") || ""),
      especie: String(formData.get("especie") || ""),
      raza: String(formData.get("raza") || ""),
      genero: String(formData.get("genero") || ""),
      edad: Number(formData.get("edad") || 0),
    };
    const nueva = await apiCreatePet(body);
    setMascotas((prev) => [...prev, nueva]);
    setAdding(false);
  }

  async function onDelete(id: string) {
    await apiDeletePet(id);
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Mis Mascotas</h1>
      {adding ? (
        <form action={onAdd as any} className="grid sm:grid-cols-2 gap-4 mb-6">
          <Input name="nombre" label="Nombre" required />
          <Input name="especie" label="Especie" placeholder="Perro, Gato, ..." required />
          <Input name="raza" label="Raza" required />
          <Input name="genero" label="Género" placeholder="Macho/Hembra" required />
          <Input name="edad" label="Edad" type="number" min={0} required />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit">Guardar</Button>
            <Button type="button" variant="secondary" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setAdding(true)}>Registrar Mascota</Button>
      )}

      <ul className="mt-6 divide-y rounded-md border">
        {mascotas.map((m) => (
          <li key={m.id} className="p-3 flex gap-4 items-center justify-between">
            <div>
              <div className="font-medium">{m.nombre}</div>
              <div className="text-sm text-slate-600">
                {m.especie} {m.raza ? `· ${m.raza}` : ""} {m.edad ? `· ${m.edad} años` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <a className="text-teal-700 hover:underline text-sm" href={`/owner/mascotas/${m.id}`}>
                Ver historial
              </a>
              <Button variant="ghost" onClick={() => onDelete(m.id)}>
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


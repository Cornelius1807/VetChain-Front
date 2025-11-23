"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../../components/owner/Sidebar";
import Button from "../../../components/ui/Button";
import { apiListVetsActivos, apiMe } from "../../../lib/services/api";
import type { VeterinarioDTO } from "../../../lib/types/api";
import DogImage from "../../../src/assets/perro.png";

export default function OwnerVetsPage() {
  const [ownerName, setOwnerName] = useState<string | undefined>();
  const [vets, setVets] = useState<VeterinarioDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiMe(), apiListVetsActivos()])
      .then(([me, vetsResp]) => {
        setOwnerName(me.dueno ? `${me.dueno.nombres} ${me.dueno.apellidos}` : me.cuenta.correo);
        setVets(vetsResp);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return vets.filter(
      (vet) =>
        vet.nombre.toLowerCase().includes(q) ||
        (vet.especialidad?.toLowerCase().includes(q) ?? false) ||
        (vet.centro?.nombre?.toLowerCase().includes(q) ?? false)
    );
  }, [vets, query]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <OwnerSidebar ownerName={ownerName} active="veterinarios" />
      <div className="flex-1 space-y-6 px-4 py-8 md:px-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-teal-600">Veterinarios</p>
            <h1 className="text-3xl font-semibold">Especialistas disponibles</h1>
            <p className="text-sm text-slate-500">Encuentra al profesional ideal y agenda desde esta sección.</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o especialidad..."
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm md:w-72"
          />
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando veterinarios...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No se encontraron veterinarios con esos criterios.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((vet) => (
              <article key={vet.id} className="rounded-3xl border border-slate-200 bg-white text-slate-900 p-6 shadow-lg">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Image src={DogImage} alt={vet.nombre} className="h-20 w-20 rounded-full object-cover" />
                  <div>
                    <p className="text-lg font-semibold">{vet.nombre}</p>
                    <p className="text-sm text-slate-500">{vet.especialidad}</p>
                    {vet.centro && <p className="text-xs text-slate-400">{vet.centro.nombre}</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full px-4"
                    onClick={() => alert("Perfil detallado disponible próximamente.")}
                  >
                    Ver perfil
                  </Button>
                  <Link href="/owner/citas" className="rounded-full bg-teal-600 px-4 py-2 text-white">
                    Agendar cita
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

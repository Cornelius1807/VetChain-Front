"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { apiVetCitas, apiAtenderCita } from "../../../../lib/services/api";

export default function CitaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const [cita, setCita] = useState<any | null>(null);

  useEffect(() => {
    apiVetCitas().then((cs) => setCita(cs.find((c: any) => c.id === id) || null));
  }, [id]);

  async function onAtender(formData: FormData) {
    const hall = String(formData.get("hallazgos") || "")
      .split("\n")
      .filter(Boolean);
    const prueba = String(formData.get("prueba") || "");
    const tratamiento = String(formData.get("tratamiento") || "");
    await apiAtenderCita(id, { hallazgos: hall, prueba, tratamiento });
    alert("Cita atendida y registrada en historial");
    router.push("/vet/citas");
  }

  if (!cita) return <div className="mx-auto max-w-3xl px-4 py-8">Cita no encontrada.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Atender Cita</h1>
      <div className="text-sm text-slate-700 mb-4">
        {new Date(cita.fecha).toISOString().slice(0, 10)} · {cita.horaTexto} · Estado: {cita.estado}
      </div>
      <form action={onAtender as any} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-slate-700">Hallazgos (uno por línea)</span>
          <textarea name="hallazgos" className="border rounded-md px-3 py-2 min-h-24" />
        </label>
        <Input name="prueba" label="Prueba realizada" />
        <label className="grid gap-1">
          <span className="text-sm text-slate-700">Tratamiento</span>
          <textarea name="tratamiento" className="border rounded-md px-3 py-2 min-h-24" />
        </label>
        <Button type="submit">Registrar atención</Button>
      </form>
    </div>
  );
}

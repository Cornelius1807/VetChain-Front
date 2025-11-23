"use client";

import { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiResetPassword } from "../../../lib/services/api";

export default function ResetPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params?.token || "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contrasena = String(formData.get("contrasena") || "");
    await apiResetPassword(token, contrasena);
    alert("Contrasena actualizada");
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold mb-4">Restablecer contrasena</h1>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input name="contrasena" label="Nueva contrasena" type="password" required />
        <Button type="submit">Actualizar</Button>
      </form>
    </div>
  );
}

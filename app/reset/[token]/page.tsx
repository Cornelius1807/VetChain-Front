"use client";

import { useParams, useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiResetPassword } from "../../../lib/services/api";

export default function ResetPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params?.token || "");

  async function onSubmit(formData: FormData) {
    const contrasena = String(formData.get("contrasena") || "");
    await apiResetPassword(token, contrasena);
    alert("Contraseña actualizada");
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold mb-4">Restablecer contraseña</h1>
      <form className="grid gap-4" action={onSubmit as any}>
        <Input name="contrasena" label="Nueva contraseña" type="password" required />
        <Button type="submit">Actualizar</Button>
      </form>
    </div>
  );
}


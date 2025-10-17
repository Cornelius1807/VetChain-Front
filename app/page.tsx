"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useSession } from "../lib/auth/session";

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"dueno" | "veterinario">("dueno");
  const { login, signupOwner, signupVet } = useSession();
  const router = useRouter();

  async function handleLogin(formData: FormData) {
    const correo = String(formData.get("correo") || "");
    const contrasena = String(formData.get("contrasena") || "");
    if (!correo || !contrasena) {
      alert("Debe ingresar correo y contraseña");
      return;
    }
    try {
      const cuenta = await login(correo, contrasena);
      if (cuenta.rol === "dueno") router.push("/owner");
      else if (cuenta.rol === "veterinario") router.push("/vet");
      else router.push("/admin");
    } catch (e) {
      alert("Credenciales inválidas (correo o contraseña) o cuenta no activa");
    }
  }

  async function handleSignup(formData: FormData) {
    if (role === "dueno") {
      await signupOwner({
        dni: String(formData.get("dni") || ""),
        nombres: String(formData.get("nombres") || ""),
        apellidos: String(formData.get("apellidos") || ""),
        correo: String(formData.get("correo") || ""),
        contrasena: String(formData.get("contrasena") || ""),
        telefono: String(formData.get("telefono") || ""),
      });
      alert("Registro creado. Revisa tu correo para confirmar la cuenta.");
    } else {
      await signupVet({
        dni: String(formData.get("dni") || ""),
        nombre: String(formData.get("nombre") || ""),
        correo: String(formData.get("correo") || ""),
        contrasena: String(formData.get("contrasena") || ""),
        especialidad: String(formData.get("especialidad") || ""),
      });
      alert("Registro enviado. Pendiente de aprobación del administrador.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div className="order-2 md:order-1">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-12 h-12 rounded-md bg-teal-700" />
          <div className="text-3xl font-semibold text-slate-900">
            <span className="text-teal-700">Vet</span> Chain
          </div>
        </div>
        <p className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          La historia clínica digital de tu mascota,
          <span className="text-teal-700"> siempre a tu alcance.</span>
        </p>
        <p className="mt-4 text-slate-600">Conecta dueños, veterinarios y clínicas en una sola plataforma.</p>
      </div>
      <div className="order-1 md:order-2">
        <div className="rounded-2xl border shadow-sm p-6 bg-white">
          <div className="flex items-center gap-4 text-sm mb-4">
            <button className={`flex-1 py-2 rounded-md ${mode === "login" ? "bg-teal-700 text-white" : "bg-slate-100"}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button className={`flex-1 py-2 rounded-md ${mode === "signup" ? "bg-teal-700 text-white" : "bg-slate-100"}`} onClick={() => setMode("signup")}>
              Sign Up
            </button>
          </div>

          {mode === "login" ? (
            <form className="grid gap-4" action={handleLogin as any}>
              <Input name="correo" label="Correo electrónico" placeholder="ejemplo@gmail.com" type="email" required />
              <Input name="contrasena" label="Contraseña" placeholder="Ingresa tu contraseña" type="password" required />
              <Button type="submit" className="mt-2">Login</Button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm mb-2">
                <button className={`flex-1 py-2 rounded-md ${role === "dueno" ? "bg-teal-50 text-teal-800" : "bg-slate-100"}`} onClick={() => setRole("dueno")}>
                  Dueño de Mascota
                </button>
                <button className={`flex-1 py-2 rounded-md ${role === "veterinario" ? "bg-teal-50 text-teal-800" : "bg-slate-100"}`} onClick={() => setRole("veterinario")}>
                  Veterinario
                </button>
              </div>
              {role === "dueno" ? (
                <form className="grid gap-4" action={handleSignup as any}>
                  <Input name="dni" label="DNI" required />
                  <Input name="nombres" label="Nombres" required />
                  <Input name="apellidos" label="Apellidos" required />
                  <Input name="telefono" label="Teléfono" required />
                  <Input name="correo" label="Correo electrónico" type="email" required />
                  <Input name="contrasena" label="Contraseña" type="password" required />
                  <Button type="submit" className="mt-2">Crear cuenta</Button>
                </form>
              ) : (
                <form className="grid gap-4" action={handleSignup as any}>
                  <Input name="dni" label="DNI" required />
                  <Input name="nombre" label="Nombre" required />
                  <Input name="especialidad" label="Especialidad" required />
                  <Input name="correo" label="Correo electrónico" type="email" required />
                  <Input name="contrasena" label="Contraseña" type="password" required />
                  <Button type="submit" className="mt-2">Enviar registro</Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}


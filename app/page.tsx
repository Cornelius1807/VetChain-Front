"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useSession } from "../lib/auth/session";
import { apiRequestReset, apiResetPassword } from "../lib/services/api";
import Logo from "../src/assets/LOGO.png";

type VetDocsState = {
  tituloName?: string;
  tituloData?: string;
  constanciaName?: string;
  constanciaData?: string;
};

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"dueno" | "veterinario">("dueno");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [resetConfirmInfo, setResetConfirmInfo] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [vetDocs, setVetDocs] = useState<VetDocsState>({});
  const { login, signupOwner, signupVet } = useSession();
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    const formData = new FormData(event.currentTarget);
    const correo = String(formData.get("correo") || "").trim();
    const contrasena = String(formData.get("contrasena") || "");

    if (!correo || !contrasena) {
      setLoginError("Ingresa correo y contrasena.");
      return;
    }

    try {
      setLoginLoading(true);
      const cuenta = await login(correo, contrasena);
      if (cuenta.rol === "dueno") router.push("/owner");
      else if (cuenta.rol === "veterinario") router.push("/vet");
      else router.push("/admin");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    const formData = new FormData(event.currentTarget);

    try {
      setSignupLoading(true);
      if (role === "dueno") {
        const payload = buildOwnerPayload(formData);
        await signupOwner(payload);
        setSignupSuccess("Cuenta creada y activa. Ya puedes iniciar sesion.");
        setMode("login");
        event.currentTarget.reset();
      } else {
        const payload = buildVetPayload(formData, vetDocs);
        await signupVet(payload);
        setSignupSuccess("Registro enviado. El administrador debe aprobar tu cuenta.");
        event.currentTarget.reset();
      }
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : "No se pudo completar el registro.");
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetEmail) return;
    try {
      setResetLoading(true);
      const resp = await apiRequestReset(resetEmail);
      setResetInfo(resp.token ? `Solicitud enviada. Token temporal: ${resp.token}` : "Solicitud enviada al correo.");
    } catch (err) {
      setResetInfo(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetTokenInput || !resetNewPassword) return;
    try {
      setResetLoading(true);
      await apiResetPassword(resetTokenInput, resetNewPassword);
      setResetConfirmInfo("Contraseña actualizada correctamente.");
      setResetTokenInput("");
      setResetNewPassword("");
    } catch (err) {
      setResetConfirmInfo(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setResetLoading(false);
    }
  }

  function handleVetFileChange(event: ChangeEvent<HTMLInputElement>, kind: "titulo" | "constancia") {
    const file = event.target.files?.[0];
    const nameKey = kind === "titulo" ? "tituloName" : "constanciaName";
    const dataKey = kind === "titulo" ? "tituloData" : "constanciaData";
    if (!file) {
      setVetDocs((prev) => ({ ...prev, [nameKey]: undefined, [dataKey]: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setVetDocs((prev) => ({
        ...prev,
        [nameKey]: file.name,
        [dataKey]: typeof reader.result === "string" ? reader.result : undefined,
      }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2">
      <div className="order-2 md:order-1">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-teal-100 bg-white shadow">
            <Image src={Logo} alt="VetChain" className="h-12 w-12 object-contain" />
          </span>
          <div className="text-3xl font-semibold text-slate-900">
            <span className="text-teal-700">Vet</span> Chain
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          La historia clinica digital de tu mascota,
          <span className="text-teal-700"> siempre a tu alcance.</span>
        </p>
        <p className="mt-4 text-slate-600">
          Conecta duenos, veterinarios y clinicas en una sola plataforma.
        </p>
      </div>
      <div className="order-1 md:order-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-teal-100 bg-white shadow">
              <Image src={Logo} alt="VetChain" className="h-10 w-10 object-contain" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-teal-600">Bienvenido</p>
              <p className="text-lg font-semibold text-slate-900">Accede o crea tu cuenta</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm mb-4">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md ${mode === "login" ? "bg-teal-700 text-white" : "bg-slate-100"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md ${mode === "signup" ? "bg-teal-700 text-white" : "bg-slate-100"}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {mode === "login" ? (
            <form className="grid gap-4" onSubmit={handleLogin}>
              <Input name="correo" label="Correo electronico" placeholder="ejemplo@gmail.com" type="email" required />
              <Input name="contrasena" label="Contrasena" placeholder="Ingresa tu contrasena" type="password" required minLength={8} />
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <Button type="submit" className="mt-2" disabled={loginLoading}>
                {loginLoading ? "Validando..." : "Login"}
              </Button>
              <button
                type="button"
                className="text-left text-xs text-teal-700 underline"
                onClick={() => {
                  setShowReset((prev) => !prev);
                  setResetInfo(null);
                  setResetConfirmInfo(null);
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm mb-2">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${role === "dueno" ? "bg-teal-50 text-teal-800" : "bg-slate-100"}`}
                  onClick={() => setRole("dueno")}
                >
                  Dueno de Mascota
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${role === "veterinario" ? "bg-teal-50 text-teal-800" : "bg-slate-100"}`}
                  onClick={() => setRole("veterinario")}
                >
                  Veterinario
                </button>
              </div>
              <form className="grid gap-4" onSubmit={handleSignup}>
                {role === "dueno" ? (
                  <>
                    <Input name="dni" label="DNI" required />
                    <Input name="nombres" label="Nombres" required />
                    <Input name="apellidos" label="Apellidos" required />
                    <Input name="telefono" label="Telefono" required />
                    <Input name="correo" label="Correo electronico" type="email" required />
                    <Input
                      name="contrasena"
                      label="Contrasena"
                      type="password"
                      required
                      minLength={8}
                      title="Minimo 8 caracteres con letras, numeros y simbolos"
                    />
                  </>
                ) : (
                  <>
                    <Input name="dni" label="DNI" required />
                    <Input name="nombre" label="Nombre completo" required />
                    <Input name="especialidad" label="Especialidad" required />
                    <Input name="telefono" label="Telefono" />
                    <Input name="correo" label="Correo electronico" type="email" required />
                    <Input name="contrasena" label="Contrasena" type="password" required minLength={8} />
                    <label className="grid gap-1 text-sm text-slate-700">
                      Subir título profesional (PDF/DOC)
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="rounded-md border border-slate-200 px-3 py-2"
                        onChange={(e) => handleVetFileChange(e, "titulo")}
                      />
                      {vetDocs.tituloName && <span className="text-xs text-slate-500">Seleccionado: {vetDocs.tituloName}</span>}
                    </label>
                    <label className="grid gap-1 text-sm text-slate-700">
                      Subir constancia laboral (PDF/DOC)
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="rounded-md border border-slate-200 px-3 py-2"
                        onChange={(e) => handleVetFileChange(e, "constancia")}
                      />
                      {vetDocs.constanciaName && <span className="text-xs text-slate-500">Seleccionado: {vetDocs.constanciaName}</span>}
                    </label>
                  </>
                )}
                {signupError && <p className="text-sm text-red-600">{signupError}</p>}
                {signupSuccess && <p className="text-sm text-teal-700">{signupSuccess}</p>}
                <Button type="submit" className="mt-2" disabled={signupLoading}>
                  {signupLoading ? "Guardando..." : role === "dueno" ? "Crear cuenta" : "Enviar registro"}
                </Button>
              </form>
            </>
          )}
          {mode === "login" && showReset && (
            <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <form className="space-y-2" onSubmit={handleResetRequest}>
                <p className="font-semibold text-slate-700">Solicita el correo de recuperación</p>
                <Input
                  label="Correo registrado"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? "Enviando..." : "Enviar correo"}
                </Button>
                {resetInfo && <p className="text-xs text-slate-600">{resetInfo}</p>}
              </form>
              <form className="space-y-2" onSubmit={handleResetConfirm}>
                <p className="font-semibold text-slate-700">¿Ya tienes el token?</p>
                <Input
                  label="Token recibido"
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  required
                />
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? "Guardando..." : "Cambiar contraseña"}
                </Button>
                {resetConfirmInfo && <p className="text-xs text-slate-600">{resetConfirmInfo}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function buildOwnerPayload(formData: FormData) {
  const contrasena = String(formData.get("contrasena") || "");
  const hasLetter = /[A-Za-z]/.test(contrasena);
  const hasNumber = /\d/.test(contrasena);
  const hasSymbol = /[^A-Za-z0-9]/.test(contrasena);
  if (contrasena.length < 8 || !hasLetter || !hasNumber || !hasSymbol) {
    throw new Error("La contrasena debe tener minimo 8 caracteres con letras, numeros y simbolos.");
  }

  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const telefono = String(formData.get("telefono") || "").trim();
  const dni = String(formData.get("dni") || "").trim();
  const nombres = String(formData.get("nombres") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();

  return {
    dni,
    nombres,
    apellidos,
    telefono,
    correo,
    contrasena,
  };
}

function buildVetPayload(formData: FormData, docs: VetDocsState) {
  const contrasena = String(formData.get("contrasena") || "");
  if (contrasena.length < 8) {
    throw new Error("La contrasena debe tener minimo 8 caracteres.");
  }

  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const telefono = String(formData.get("telefono") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  return {
    dni: String(formData.get("dni") || "").trim(),
    nombre,
    especialidad: String(formData.get("especialidad") || ""),
    telefono: telefono || undefined,
    correo,
    contrasena,
    tituloData: docs.tituloData,
    constanciaData: docs.constanciaData,
  };
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../lib/auth/session";

export default function Header() {
  const { cuenta, logout } = useSession();
  const pathname = usePathname();
  const mainLink = cuenta?.rol === "dueno" ? "/owner" : cuenta?.rol === "veterinario" ? "/vet" : cuenta?.rol === "admin" ? "/admin" : "/";

  const links = [
    { href: mainLink, label: "Inicio" },
    { href: "/profile", label: "Perfil" },
    ...(cuenta?.rol === "dueno" ? [{ href: "/owner/mascotas", label: "Mascotas" }, { href: "/owner/citas", label: "Citas" }] : []),
    ...(cuenta?.rol === "veterinario" ? [{ href: "/vet/agenda", label: "Agenda" }, { href: "/vet/citas", label: "Citas" }] : []),
    ...(cuenta?.rol === "admin" ? [{ href: "/admin/centros", label: "Centros" }, { href: "/admin/cuentas", label: "Cuentas" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href={mainLink} className="flex items-center gap-2 text-teal-700 font-semibold">
          <span className="inline-block w-6 h-6 bg-teal-700 rounded-sm" />
          <span>VetChain</span>
        </Link>
        <nav className="ml-6 flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`hover:text-teal-700 ${pathname === l.href ? "text-teal-700 font-medium" : "text-slate-700"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {cuenta ? (
            <>
              <span className="text-slate-600">{cuenta.correo} · {cuenta.rol}</span>
              <button className="text-teal-700 hover:underline" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <Link href="/" className="text-teal-700 hover:underline">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}


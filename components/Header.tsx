"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "../lib/auth/session";
import Logo from "../src/assets/LOGO.png";

export default function Header() {
  const { cuenta, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const mainLink =
    cuenta?.rol === "dueno" ? "/owner" : cuenta?.rol === "veterinario" ? "/vet" : cuenta?.rol === "admin" ? "/admin" : "/";

  const links = [
    { href: mainLink, label: "Inicio" },
    { href: "/profile", label: "Perfil" },
    { href: "/notificaciones", label: "Notificaciones" },
    ...(cuenta?.rol === "dueno"
      ? [
          { href: "/owner/mascotas", label: "Mascotas" },
          { href: "/owner/citas", label: "Citas" },
          { href: "/owner/veterinarios", label: "Veterinarios" },
        ]
      : []),
    ...(cuenta?.rol === "veterinario"
      ? [
          { href: "/vet/agenda", label: "Agenda" },
          { href: "/vet/citas", label: "Citas" },
          { href: "/vet/centro", label: "Centros" },
        ]
      : []),
    ...(cuenta?.rol === "admin"
      ? [
          { href: "/admin/centros", label: "Centros" },
          { href: "/admin/cuentas", label: "Cuentas" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={mainLink} className="flex items-center gap-3 font-semibold text-teal-700">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-100 bg-white shadow-sm">
            <Image src={Logo} alt="VetChain" className="h-7 w-7 object-contain" />
          </span>
          <span className="tracking-tight">VetChain</span>
        </Link>
        <nav className="ml-6 flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-teal-700 ${pathname === link.href ? "text-teal-700 font-medium" : "text-slate-700"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {cuenta ? (
            <>
              <span className="text-slate-600">
                {cuenta.correo} - {cuenta.rol}
              </span>
              <button
                className="text-teal-700 hover:underline"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <Link href="/" className="text-teal-700 hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

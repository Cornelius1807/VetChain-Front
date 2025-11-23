"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "../../src/assets/LOGO.png";
import Dog from "../../src/assets/perro.png";

type Props = {
  ownerName?: string;
  active: "mascotas" | "citas" | "veterinarios";
};

const links = [
  { href: "/owner/mascotas", label: "Mascotas", key: "mascotas" },
  { href: "/owner/citas", label: "Calendario", key: "citas" },
  { href: "/owner/veterinarios", label: "Veterinarios", key: "veterinarios" },
];

export default function OwnerSidebar({ ownerName, active }: Props) {
  return (
    <aside className="flex w-56 flex-col justify-between border-r border-slate-200 bg-white px-5 py-8 text-slate-900">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image src={Logo} alt="VetChain Logo" className="h-14 w-14 rounded-full border border-slate-200 bg-white p-2" />
          <p className="text-xs uppercase tracking-wide text-slate-500">Bienvenido</p>
          <p className="text-base font-semibold text-slate-900">{ownerName ?? "Usuario"}</p>
        </div>
        <Image src={Dog} alt="Pet" className="mx-auto h-20 w-20 rounded-full border border-slate-200 object-cover" />
        <nav className="space-y-2 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`flex items-center justify-between rounded-full border px-4 py-2 ${
                active === link.key ? "border-teal-500 bg-teal-50 text-teal-700" : "border-transparent bg-slate-100 text-slate-700"
              }`}
            >
              <span>{link.label}</span>
              {active === link.key && <span className="text-xs font-semibold">?</span>}
            </Link>
          ))}
        </nav>
      </div>
      <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
        Eliminar Cuenta
      </button>
    </aside>
  );
}

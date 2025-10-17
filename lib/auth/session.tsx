"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe, apiRegisterOwner, apiRegisterVet, setAuthToken } from "../services/api";

type CuentaUI = { correo: string; rol: "dueno" | "veterinario" | "admin" } | null;

type SessionData = { token: string | null; cuenta: CuentaUI };

type SessionCtx = {
  cuenta: CuentaUI;
  login: (correo: string, contrasena: string) => Promise<CuentaUI>;
  logout: () => void;
  signupOwner: (args: { dni: string; nombres: string; apellidos: string; correo: string; contrasena: string; telefono: string }) => Promise<void>;
  signupVet: (args: { dni: string; nombre: string; correo: string; contrasena: string; especialidad: string }) => Promise<void>;
};

const CTX = createContext<SessionCtx | undefined>(undefined);
const SKEY = "vetchain_session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [cuenta, setCuenta] = useState<CuentaUI>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SKEY);
      if (raw) {
        const { token } = JSON.parse(raw) as SessionData;
        if (token) {
          setAuthToken(token);
          apiMe().then((me) => {
            const rol = me.cuenta.rol as "dueno" | "veterinario" | "admin";
            setCuenta({ correo: me.cuenta.correo, rol });
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  const login = async (correo: string, contrasena: string) => {
    const data = await apiLogin(correo, contrasena);
    setAuthToken(data.token);
    const me = await apiMe();
    const info: CuentaUI = { correo: me.cuenta.correo, rol: me.cuenta.rol };
    setCuenta(info);
    window.localStorage.setItem(SKEY, JSON.stringify({ token: data.token, cuenta: info } satisfies SessionData));
    return info;
  };

  const logout = () => {
    setCuenta(null);
    setAuthToken(null);
    window.localStorage.setItem(SKEY, JSON.stringify({ token: null, cuenta: null } satisfies SessionData));
  };

  const signupOwner: SessionCtx["signupOwner"] = async (args) => {
    await apiRegisterOwner(args);
  };

  const signupVet: SessionCtx["signupVet"] = async (args) => {
    await apiRegisterVet(args);
  };

  const value = useMemo<SessionCtx>(() => ({ cuenta, login, logout, signupOwner, signupVet }), [cuenta]);

  return <CTX.Provider value={value}>{children}</CTX.Provider>;
}

export function useSession() {
  const ctx = useContext(CTX);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe, apiRegisterOwner, apiRegisterVet, setAuthToken, isAxiosError } from "../services/api";
import type { MeResponse, RegisterOwnerInput, RegisterVetInput } from "../types/api";

type CuentaUI = { correo: string; rol: "dueno" | "veterinario" | "admin" } | null;

type SessionData = { token: string | null; cuenta: CuentaUI };

type SessionCtx = {
  cuenta: CuentaUI;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<CuentaUI>;
  logout: () => void;
  signupOwner: (args: RegisterOwnerInput) => Promise<void>;
  signupVet: (args: RegisterVetInput) => Promise<void>;
};

const CTX = createContext<SessionCtx | undefined>(undefined);
const SKEY = "vetchain_session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [cuenta, setCuenta] = useState<CuentaUI>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SKEY);
      if (raw) {
        const { token } = JSON.parse(raw) as SessionData;
        if (token) {
          setAuthToken(token);
          apiMe()
            .then((me) => setCuenta(mapCuenta(me)))
            .catch(() => {
              setAuthToken(null);
              window.localStorage.removeItem(SKEY);
              setCuenta(null);
            })
            .finally(() => setLoading(false));
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    try {
      const data = await apiLogin(correo, contrasena);
      setAuthToken(data.token);
      const me = await apiMe();
      const info = mapCuenta(me);
      setCuenta(info);
      window.localStorage.setItem(SKEY, JSON.stringify({ token: data.token, cuenta: info } satisfies SessionData));
      return info;
    } catch (error) {
      setAuthToken(null);
      window.localStorage.removeItem(SKEY);
      throw new Error(readableError(error));
    }
  };

  const logout = () => {
    setCuenta(null);
    setAuthToken(null);
    window.localStorage.setItem(SKEY, JSON.stringify({ token: null, cuenta: null } satisfies SessionData));
  };

  const signupOwner: SessionCtx["signupOwner"] = async (args) => {
    try {
      await apiRegisterOwner(args);
    } catch (error) {
      throw new Error(readableError(error));
    }
  };

  const signupVet: SessionCtx["signupVet"] = async (args) => {
    try {
      await apiRegisterVet(args);
    } catch (error) {
      throw new Error(readableError(error));
    }
  };

  const value = useMemo<SessionCtx>(() => ({ cuenta, loading, login, logout, signupOwner, signupVet }), [cuenta, loading]);

  return <CTX.Provider value={value}>{children}</CTX.Provider>;
}

export function useSession() {
  const ctx = useContext(CTX);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

function mapCuenta(me: MeResponse): CuentaUI {
  return { correo: me.cuenta.correo, rol: me.cuenta.rol };
}

function readableError(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error ?? "Solicitud rechazada por el servidor.";
  }
  if (error instanceof Error) return error.message;
  return "Ocurrio un error inesperado. Intenta nuevamente.";
}

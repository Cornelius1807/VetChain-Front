"use client";

import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL });

export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// Auth
export async function apiLogin(correo: string, contrasena: string) {
  const { data } = await api.post("/auth/login", { correo, contrasena });
  return data as { token: string; rol: string };
}

export async function apiRegisterOwner(input: {
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  telefono: string;
}) {
  const { data } = await api.post("/auth/register/owner", input);
  return data as { id: string; confirmToken: string };
}

export async function apiRegisterVet(input: {
  dni: string;
  nombre: string;
  correo: string;
  contrasena: string;
  especialidad: string;
  tituloURL?: string;
  constanciaURL?: string;
  centroId?: string;
}) {
  const { data } = await api.post("/auth/register/vet", input);
  return data as { id: string };
}

export async function apiMe() {
  const { data } = await api.get("/me");
  return data;
}

export async function apiUpdateMe(patch: any) {
  const { data } = await api.put("/me", patch);
  return data;
}

export async function apiRequestReset(correo: string) {
  const { data } = await api.post("/auth/request-password-reset", { correo });
  return data as { ok: boolean; token?: string };
}

export async function apiResetPassword(token: string, contrasena: string) {
  const { data } = await api.post("/auth/reset-password", { token, contrasena });
  return data as { ok: boolean };
}

// Centros
export async function apiListCentros() {
  const { data } = await api.get("/centros");
  return data as any[];
}

// Pets
export async function apiListPets() {
  const { data } = await api.get("/pets");
  return data as any[];
}
export async function apiCreatePet(pet: any) {
  const { data } = await api.post("/pets", pet);
  return data;
}
export async function apiUpdatePet(id: string, patch: any) {
  const { data } = await api.put(`/pets/${id}`, patch);
  return data;
}
export async function apiDeletePet(id: string) {
  const { data } = await api.delete(`/pets/${id}`);
  return data;
}

// Citas
export async function apiOwnerCitas() {
  const { data } = await api.get("/citas/owner");
  return data as any[];
}
export async function apiVetCitas() {
  const { data } = await api.get("/citas/vet");
  return data as any[];
}
export async function apiCrearCita(body: any) {
  const { data } = await api.post("/citas", body);
  return data;
}
export async function apiAtenderCita(id: string, body: any) {
  const { data } = await api.patch(`/citas/${id}/atender`, body);
  return data;
}
export async function apiHistorial(mascotaId: string) {
  const { data } = await api.get(`/historial/${mascotaId}`);
  return data as any[];
}


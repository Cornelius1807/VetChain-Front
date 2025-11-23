"use client";

import axios, { AxiosError } from "axios";
import type {
  CitaDTO,
  CentroDTO,
  CentroCreateInput,
  DisponibilidadResponse,
  HistorialResponse,
  MascotaDTO,
  MeResponse,
  NotificacionDTO,
  PendingVetDTO,
  ProgramacionPayload,
  RegisterOwnerInput,
  RegisterVetInput,
  VeterinarioDTO,
} from "../types/api";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL });

type EstadoCita = CitaDTO["estado"];

export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function isAxiosError(error: unknown): error is AxiosError<{ error?: string }> {
  return error instanceof AxiosError;
}

// --- Auth -----------------------------------------------------------------

export async function apiLogin(correo: string, contrasena: string): Promise<{ token: string; rol: string }> {
  const { data } = await api.post("/auth/login", { correo, contrasena });
  return data;
}

export async function apiRegisterOwner(input: RegisterOwnerInput): Promise<{ id: string }> {
  const { data } = await api.post("/auth/register/owner", input);
  return data;
}

export async function apiRegisterVet(input: RegisterVetInput): Promise<{ id: string }> {
  const { data } = await api.post("/auth/register/vet", input);
  return data;
}

export async function apiMe(): Promise<MeResponse> {
  const { data } = await api.get("/me");
  return data as MeResponse;
}

export async function apiUpdateMe(patch: Record<string, unknown>): Promise<{ ok: boolean }> {
  const { data } = await api.put("/me", patch);
  return data;
}

export async function apiRequestReset(correo: string): Promise<{ ok: boolean; token?: string }> {
  const { data } = await api.post("/auth/request-password-reset", { correo });
  return data;
}

export async function apiResetPassword(token: string, contrasena: string): Promise<{ ok: boolean }> {
  const { data } = await api.post("/auth/reset-password", { token, contrasena });
  return data;
}

// --- Catálogos -------------------------------------------------------------

export async function apiListCentros(): Promise<CentroDTO[]> {
  const { data } = await api.get("/centros");
  return data as CentroDTO[];
}

export async function apiCreateCentro(payload: CentroCreateInput): Promise<CentroDTO> {
  const { data } = await api.post("/centros", payload);
  return data as CentroDTO;
}

export async function apiListVetsActivos(params?: { centroId?: string }): Promise<VeterinarioDTO[]> {
  const { data } = await api.get("/veterinarios/activos", { params });
  return data as VeterinarioDTO[];
}

export async function apiDisponibilidad(veterinarioId: string, centroId?: string): Promise<DisponibilidadResponse> {
  const { data } = await api.get("/citas/disponibilidad", { params: { veterinarioId, centroId } });
  return data as DisponibilidadResponse;
}

// --- Mascotas -------------------------------------------------------------

export async function apiListPets(): Promise<MascotaDTO[]> {
  const { data } = await api.get("/mascotas");
  return data as MascotaDTO[];
}

export async function apiCreatePet(pet: {
  nombre: string;
  especie: string;
  raza: string;
  genero: string;
  edad: number;
  peso?: number;
  descripcion?: string;
}): Promise<MascotaDTO> {
  const { data } = await api.post("/mascotas", pet);
  return data as MascotaDTO;
}

export async function apiUpdatePet(id: string, patch: Partial<MascotaDTO>): Promise<MascotaDTO> {
  const { data } = await api.put(`/mascotas/${id}`, patch);
  return data as MascotaDTO;
}

export async function apiDeletePet(id: string): Promise<{ ok: boolean }> {
  const { data } = await api.delete(`/mascotas/${id}`);
  return data;
}

// --- Citas -----------------------------------------------------------------

export async function apiOwnerCitas(): Promise<CitaDTO[]> {
  const { data } = await api.get("/citas/owner");
  return data as CitaDTO[];
}

export async function apiVetCitas(): Promise<CitaDTO[]> {
  const { data } = await api.get("/citas/vet");
  return data as CitaDTO[];
}

export async function apiCrearCita(payload: { mascotaId: string; veterinarioId: string; motivo: string; slotId: string }): Promise<CitaDTO> {
  const { data } = await api.post("/citas", payload);
  return data as CitaDTO;
}

export async function apiCancelarCita(id: string, motivo: string): Promise<{ ok: boolean }> {
  const { data } = await api.patch(`/citas/${id}/cancel`, { motivo });
  return data;
}

export async function apiAtenderCita(
  id: string,
  body: { hallazgos?: string; pruebas?: string; tratamiento?: string; estado?: EstadoCita }
): Promise<{ ok: boolean }> {
  const { data } = await api.patch(`/citas/${id}/atender`, body);
  return data;
}

export async function apiHistorial(mascotaId: string): Promise<HistorialResponse> {
  const { data } = await api.get(`/historial/${mascotaId}`);
  return data as HistorialResponse;
}

// --- Veterinarios ---------------------------------------------------------

export async function apiProgramarAgenda(payload: ProgramacionPayload): Promise<{ ok: boolean; created: number }> {
  const { data } = await api.post("/vet/programaciones", payload);
  return data;
}

export async function apiVetUpdateCentro(payload: { centroId?: string }): Promise<{ ok: boolean }> {
  const { data } = await api.patch("/vet/centro", payload);
  return data;
}

// --- Admin ----------------------------------------------------------------

export async function apiListPendingVets(): Promise<PendingVetDTO[]> {
  const { data } = await api.get("/admin/pending-vets");
  return data as PendingVetDTO[];
}

export async function apiApproveVet(
  vetId: string,
  payload?: { centroId?: string; permitirCrearCentro?: boolean }
): Promise<{ ok: boolean }> {
  const { data } = await api.post(`/admin/vets/${vetId}/approve`, payload);
  return data;
}

export async function apiRejectVet(vetId: string, motivo: string): Promise<{ ok: boolean }> {
  const { data } = await api.post(`/admin/vets/${vetId}/reject`, { motivo });
  return data;
}

// --- Notificaciones -------------------------------------------------------

export async function apiListNotifications(): Promise<NotificacionDTO[]> {
  const { data } = await api.get("/notificaciones");
  return data as NotificacionDTO[];
}

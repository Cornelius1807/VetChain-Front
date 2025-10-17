"use client";

import { uid } from "../utils/id";
import { addMinutes, generateDailySlots, nextDays, startOfWeek, toHM, toISODate } from "../utils/time";
import type {
  CentroVeterinario,
  CitaMedica,
  Cuenta,
  DuenoMascota,
  EstadoCita,
  HistorialClinico,
  ID,
  Mascota,
  Rol,
  VetChainDBSchema,
  Veterinario,
} from "../domain/types";

const KEY = "vetchain_db";

function emptyDB(): VetChainDBSchema {
  return {
    cuentas: [],
    duenos: [],
    veterinarios: [],
    centros: [],
    mascotas: [],
    citas: [],
    historiales: [],
    notificaciones: [],
  };
}

export function readDB(): VetChainDBSchema {
  if (typeof window === "undefined") return emptyDB();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return emptyDB();
  try {
    return JSON.parse(raw) as VetChainDBSchema;
  } catch {
    return emptyDB();
  }
}

export function writeDB(db: VetChainDBSchema) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

export function seedIfNeeded() {
  const db = readDB();
  if (db.cuentas.length === 0) {
    const adminCuenta: Cuenta = {
      idCuenta: uid(),
      correo: "admin@vetchain.com",
      contrasena: "admin123",
      rol: "admin",
      estado: true,
      fechaCreacion: new Date().toISOString(),
    };
    db.cuentas.push(adminCuenta);
    writeDB(db);
  }
}

// Auth
export function findCuentaByCorreo(correo: string): Cuenta | undefined {
  const db = readDB();
  return db.cuentas.find((c) => c.correo.toLowerCase() === correo.toLowerCase());
}

export function login(correo: string, contrasena: string): Cuenta | null {
  const c = findCuentaByCorreo(correo);
  if (c && c.contrasena === contrasena && c.estado) return c;
  return null;
}

export function crearCuenta(
  rol: Rol,
  correo: string,
  contrasena: string,
  nombre: string,
  extra?: { especialidad?: string; centroVeterinarioId?: ID }
): { cuenta: Cuenta; perfilId: ID } {
  const db = readDB();
  if (db.cuentas.some((c) => c.correo.toLowerCase() === correo.toLowerCase())) {
    throw new Error("Correo ya registrado");
  }
  const cuenta: Cuenta = {
    idCuenta: uid(),
    correo,
    contrasena,
    rol,
    estado: rol !== "veterinario", // veterinario requiere verificación
    fechaCreacion: new Date().toISOString(),
  };
  db.cuentas.push(cuenta);

  if (rol === "dueno") {
    const id = uid();
    const dueno: DuenoMascota = {
      idPersona: id,
      idDueno: id,
      nombre,
      cuentaId: cuenta.idCuenta,
    };
    db.duenos.push(dueno);
    writeDB(db);
    return { cuenta, perfilId: dueno.idDueno };
  }
  if (rol === "veterinario") {
    const id = uid();
    const vet: Veterinario = {
      idPersona: id,
      idVeterinario: id,
      nombre,
      cuentaId: cuenta.idCuenta,
      especialidad: extra?.especialidad,
      estadoVerificacion: false,
      centroVeterinarioId: extra?.centroVeterinarioId,
    };
    db.veterinarios.push(vet);
    writeDB(db);
    return { cuenta, perfilId: vet.idVeterinario };
  }
  // admin no crea perfil adicional aquí
  writeDB(db);
  return { cuenta, perfilId: cuenta.idCuenta };
}

// Admin
export function crearCentro(input: Omit<CentroVeterinario, "idCentroVeterinario" | "veterinariosIds">): CentroVeterinario {
  const db = readDB();
  const centro: CentroVeterinario = {
    ...input,
    idCentroVeterinario: uid(),
    veterinariosIds: [],
  };
  db.centros.push(centro);
  writeDB(db);
  return centro;
}

export function listarCentros(): CentroVeterinario[] {
  return readDB().centros;
}

export function aprobarVeterinario(vetId: ID) {
  const db = readDB();
  const vet = db.veterinarios.find((v) => v.idVeterinario === vetId);
  if (vet) {
    vet.estadoVerificacion = true;
    const cuenta = db.cuentas.find((c) => c.idCuenta === vet.cuentaId);
    if (cuenta) cuenta.estado = true;
    writeDB(db);
  }
}

export function vincularVetACentro(vetId: ID, centroId: ID) {
  const db = readDB();
  const vet = db.veterinarios.find((v) => v.idVeterinario === vetId);
  const centro = db.centros.find((c) => c.idCentroVeterinario === centroId);
  if (vet && centro) {
    vet.centroVeterinarioId = centroId;
    if (!centro.veterinariosIds.includes(vetId)) centro.veterinariosIds.push(vetId);
    writeDB(db);
  }
}

// Dueño - Mascotas
export function listarMascotas(duenoId: ID): Mascota[] {
  return readDB().mascotas.filter((m) => m.duenoId === duenoId);
}

export function duenoByCuentaId(cuentaId: ID) {
  return readDB().duenos.find((d) => d.cuentaId === cuentaId) || null;
}

export function vetByCuentaId(cuentaId: ID) {
  return readDB().veterinarios.find((v) => v.cuentaId === cuentaId) || null;
}

export function centroById(id: ID) {
  return readDB().centros.find((c) => c.idCentroVeterinario === id) || null;
}

export function listarVetsActivos(): Veterinario[] {
  return readDB().veterinarios.filter((v) => v.estadoVerificacion);
}

export function listarVetsPorCentro(centroId: ID): Veterinario[] {
  const db = readDB();
  const centro = db.centros.find((c) => c.idCentroVeterinario === centroId);
  if (!centro) return [];
  return db.veterinarios.filter(
    (v) => v.estadoVerificacion && (v.centroVeterinarioId === centroId || centro.veterinariosIds.includes(v.idVeterinario))
  );
}

export function listarVetsPendientes(): Veterinario[] {
  return readDB().veterinarios.filter((v) => !v.estadoVerificacion);
}

export function crearMascota(duenoId: ID, data: Omit<Mascota, "idMascota" | "duenoId">): Mascota {
  const db = readDB();
  const mascota: Mascota = { idMascota: uid(), duenoId, ...data };
  db.mascotas.push(mascota);
  // crear historial
  const hist: HistorialClinico = { idHistorial: uid(), mascotaId: mascota.idMascota, entradas: [] };
  db.historiales.push(hist);
  writeDB(db);
  return mascota;
}

export function actualizarMascota(mascotaId: ID, patch: Partial<Mascota>) {
  const db = readDB();
  const m = db.mascotas.find((x) => x.idMascota === mascotaId);
  if (m) Object.assign(m, patch);
  writeDB(db);
}

export function eliminarMascota(mascotaId: ID) {
  const db = readDB();
  db.mascotas = db.mascotas.filter((m) => m.idMascota !== mascotaId);
  db.historiales = db.historiales.filter((h) => h.mascotaId !== mascotaId);
  writeDB(db);
}

// Citas y Agenda mínima
export function horasTrabajoDefault() {
  return { horaInicio: "09:00", horaFinal: "17:00" } as const;
}

export function slotsDisponiblesParaVetSemana(vetId: ID, fromDate?: Date): { fechaISO: string; hora: string; iso: string }[] {
  const db = readDB();
  const vet = db.veterinarios.find((v) => v.idVeterinario === vetId);
  if (!vet || !vet.estadoVerificacion) return [];
  const range = horasTrabajoDefault();
  const start = startOfWeek(fromDate ?? new Date());
  const days = nextDays(start, 7);
  const booked = db.citas
    .filter((c) => c.veterinarioId === vetId && c.estado !== "Cancelada")
    .map((c) => `${c.fecha} ${c.hora}`);
  const slots = days.flatMap((d) => {
    const daySlots = generateDailySlots(d, range.horaInicio, range.horaFinal, 30);
    return daySlots
      .map((s) => ({ fechaISO: toISODate(s), hora: toHM(s), iso: s.toISOString() }))
      .filter((s) => !booked.includes(`${s.fechaISO} ${s.hora}`));
  });
  return slots;
}

export function crearCita(
  input: Omit<CitaMedica, "idCita" | "estado" | "creadaEn" | "hallazgos" | "prueba" | "tratamiento" | "resumen" | "programacion">
): CitaMedica {
  const db = readDB();
  // verificar disponibilidad
  const ya = db.citas.find(
    (c) => c.veterinarioId === input.veterinarioId && c.fecha === input.fecha && c.hora === input.hora && c.estado !== "Cancelada"
  );
  if (ya) throw new Error("Horario no disponible");
  const cita: CitaMedica = {
    ...input,
    idCita: uid(),
    estado: "Programada",
    creadaEn: new Date().toISOString(),
    programacion: { fechaActual: startOfWeek(new Date(input.fecha)).toISOString() },
  };
  db.citas.push(cita);
  writeDB(db);
  return cita;
}

export function listarCitasPorDueno(duenoId: ID): CitaMedica[] {
  return readDB().citas.filter((c) => c.duenoId === duenoId);
}

export function listarCitasPorVet(vetId: ID): CitaMedica[] {
  return readDB().citas.filter((c) => c.veterinarioId === vetId);
}

export function actualizarEstadoCita(idCita: ID, estado: EstadoCita) {
  const db = readDB();
  const c = db.citas.find((x) => x.idCita === idCita);
  if (c) c.estado = estado;
  writeDB(db);
}

export function atenderCita(
  idCita: ID,
  datos: Partial<Pick<CitaMedica, "hallazgos" | "prueba" | "tratamiento" | "resumen" | "estado">>
) {
  const db = readDB();
  const c = db.citas.find((x) => x.idCita === idCita);
  if (!c) return;
  Object.assign(c, datos);
  if (datos.estado === "Atendida") {
    let hist = db.historiales.find((h) => h.mascotaId === c.mascotaId);
    if (!hist) {
      hist = { idHistorial: uid(), mascotaId: c.mascotaId, entradas: [] };
      db.historiales.push(hist);
    }
    if (!hist.entradas.includes(c.idCita)) hist.entradas.push(c.idCita);
  }
  writeDB(db);
}

export function historialDeMascota(mascotaId: ID): CitaMedica[] {
  const db = readDB();
  const hist = db.historiales.find((h) => h.mascotaId === mascotaId);
  if (!hist) return [];
  return hist.entradas
    .map((id) => db.citas.find((c) => c.idCita === id))
    .filter(Boolean) as CitaMedica[];
}

export type EstadoCuenta = "active" | "inactive" | "pending" | "rejected";
export type Rol = "dueno" | "veterinario" | "admin";

export type CuentaDTO = {
  id: string;
  correo: string;
  rol: Rol;
  estado: EstadoCuenta;
  creadoEn: string;
  confirmadoEn?: string | null;
};

export type DuenoDTO = {
  id: string;
  cuentaId: string;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion?: string | null;
};

export type CentroResumenDTO = {
  id: string;
  nombre: string;
  direccion: string;
};

export type VeterinarioDTO = {
  id: string;
  cuentaId: string;
  dni: string;
  nombre: string;
  apellidos?: string | null;
  telefono?: string | null;
  especialidad: string;
  centroId?: string | null;
  tituloURL?: string | null;
  constanciaURL?: string | null;
  puedeCrearCentro: boolean;
  centro?: CentroResumenDTO | null;
};

export type ConsultorioDTO = {
  id: string;
  centroId: string;
  nombre: string;
};

export type CentroDTO = {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  email?: string | null;
  rangoAtencionInicio?: string | null;
  rangoAtencionFin?: string | null;
  rangoConsultaInicio?: string | null;
  rangoConsultaFin?: string | null;
  consultorios: ConsultorioDTO[];
};

export type MascotaDTO = {
  id: string;
  duenoId: string;
  nombre: string;
  especie: string;
  raza: string;
  genero: string;
  edad: number;
  peso?: number | null;
  descripcion?: string | null;
  imagenURL?: string | null;
  activa: boolean;
};

export type HorarioSlotDTO = {
  id: string;
  veterinarioId: string;
  centroId: string | null;
  consultorioId: string | null;
  programacionId: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: "LIBRE" | "RESERVADO" | "BLOQUEADO" | "FUERA_RANGO";
};

export type CitaDTO = {
  id: string;
  motivo: string;
  fecha: string;
  estado: "Programada" | "Confirmada" | "Atendida" | "Cancelada" | "Rechazada";
  creadoEn: string;
  motivoCancelacion?: string | null;
  centroId: string;
  consultorioId?: string | null;
  veterinarioId: string;
  duenoId: string;
  mascotaId: string;
  slotId?: string | null;
  hallazgos?: string | null;
  pruebas?: string | null;
  tratamiento?: string | null;
  centro?: CentroDTO;
  veterinario?: VeterinarioDTO;
  mascota?: MascotaDTO;
  dueno?: DuenoDTO;
  slot?: HorarioSlotDTO;
};

export type NotificacionDTO = {
  id: string;
  cuentaId?: string | null;
  correoDestino: string;
  tipo: string;
  payload: unknown;
  estado: string;
  createdAt: string;
  enviadoAt?: string | null;
  citaId?: string | null;
};

export type MeResponse = {
  cuenta: CuentaDTO;
  dueno?: DuenoDTO;
  veterinario?: VeterinarioDTO;
};

export type DisponibilidadResponse = HorarioSlotDTO[];

export type OwnerCitaResponse = CitaDTO[];

export type HistorialResponse = {
  mascota: MascotaDTO;
  citas: CitaDTO[];
};

export type RegisterOwnerInput = {
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  telefono: string;
};

export type RegisterVetInput = {
  dni: string;
  nombre: string;
  apellidos?: string;
  correo: string;
  contrasena: string;
  especialidad: string;
  telefono?: string;
  centroId?: string;
  tituloData?: string;
  constanciaData?: string;
};

export type PendingVetDTO = VeterinarioDTO & { cuenta: CuentaDTO };

export type CentroCreateInput = {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  rangoAtencionInicio?: string;
  rangoAtencionFin?: string;
  rangoConsultaInicio?: string;
  rangoConsultaFin?: string;
  consultorios?: string[];
};

export type ProgramacionPayload = {
  centroId: string;
  consultorioId?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos?: number;
};

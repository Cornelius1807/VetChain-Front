// Domain models inspired by the provided UML diagram.
// Frontend-only interfaces used with a localStorage mock DB.

export type ID = string;

export type Rol = "dueno" | "veterinario" | "admin";

export interface Cuenta {
  idCuenta: ID;
  correo: string;
  contrasena: string; // Mock only (no hashing in frontend storage)
  rol: Rol;
  estado: boolean; // activo/inactivo o verificado
  fechaCreacion: string; // ISO
}

export interface Persona {
  idPersona: ID;
  nombre: string;
  telefono?: string;
  direccion?: string;
}

export interface DuenoMascota extends Persona {
  idDueno: ID; // alias = idPersona
  cuentaId: ID;
}

export interface Veterinario extends Persona {
  idVeterinario: ID; // alias = idPersona
  cuentaId: ID;
  especialidad?: string;
  estadoVerificacion: boolean; // aprobado por admin
  centroVeterinarioId?: ID;
  fotoURL?: string;
}

export interface Consultorio {
  idConsultorio: ID;
  nombre: string;
}

export interface RangoHoras {
  horaInicio: string; // "09:00"
  horaFinal: string; // "17:00"
}

export type TipoHora = "libre" | "bloqueada" | "consulta";

export interface HoraCalendario {
  id: ID;
  fechaHora: string; // ISO
  tipo: TipoHora;
  seleccionable: boolean;
  color?: string;
  citaId?: ID;
}

export interface Programacion {
  fechaActual: string; // ISO date representing the start of the week
  nombreVeterinario?: string;
  especialidad?: string;
}

export interface Calendario {
  horas: HoraCalendario[];
}

export interface CentroVeterinario {
  idCentroVeterinario: ID;
  nombre: string;
  direccion: string;
  correo?: string;
  telefono?: string;
  rangoHorasAtencion?: RangoHoras; // horario general
  consultorios?: Consultorio[];
  veterinariosIds: ID[]; // relación
}

export interface Mascota {
  idMascota: ID;
  duenoId: ID;
  nombre: string;
  edad?: number;
  especie?: string;
  raza?: string;
  sexo?: string;
  fotoMascotaURL?: string;
}

export type EstadoCita = "Programada" | "Confirmada" | "Atendida" | "Cancelada";

export interface Hallazgos {
  hallazgos: string[];
}

export interface Prueba {
  pruebaRealizada?: string;
  documentoPruebas?: string; // URL o base64
}

export interface Tratamiento {
  tratamientoIndicado?: string;
  recetaURL?: string;
}

export interface ResumenMedico {
  enfemedadPresuntiva?: string;
  decicionImportante?: string;
  tratamientosImportantes?: string;
}

export interface CitaMedica {
  idCita: ID;
  motivo: string;
  fecha: string; // ISO date
  hora: string; // "HH:mm"
  estado: EstadoCita;
  creadaEn: string; // ISO datetime
  programacion?: Programacion;
  centroVeterinarioId: ID;
  consultorioId?: ID;
  veterinarioId: ID;
  mascotaId: ID;
  duenoId: ID;
  hallazgos?: Hallazgos;
  prueba?: Prueba;
  tratamiento?: Tratamiento;
  resumen?: ResumenMedico;
}

export interface HistorialClinico {
  idHistorial: ID;
  mascotaId: ID;
  entradas: ID[]; // ids de CitaMedica atendidas
}

export interface Notificacion {
  id: ID;
  correoDestinoVet?: string;
  correoDestinoDueno?: string;
  asunto: string;
  mensaje: string;
  creadaEn: string; // ISO
}

// Estructura de la "base de datos" en localStorage
export interface VetChainDBSchema {
  cuentas: Cuenta[];
  duenos: DuenoMascota[];
  veterinarios: Veterinario[];
  centros: CentroVeterinario[];
  mascotas: Mascota[];
  citas: CitaMedica[];
  historiales: HistorialClinico[];
  notificaciones: Notificacion[];
}


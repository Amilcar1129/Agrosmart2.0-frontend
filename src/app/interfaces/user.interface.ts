export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'tecnico' | 'coordinador' | 'admin';
  canton_asignado?: string;
  comunidad_asignada?: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}
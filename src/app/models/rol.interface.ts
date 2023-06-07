import { PermisoInterface } from "./permiso.interface";

export interface RolInterface{
    idRol?: any | null | undefined,
    nombreRol?: string | null | undefined,
    descripcionRol?: string | null | undefined,
    permisos?: PermisoInterface[] | null | undefined; // Nueva propiedad
}
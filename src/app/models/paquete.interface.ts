import { SafeUrl } from '@angular/platform-browser';
export interface PaqueteInterface {
    idPaquete?: string | null | undefined;
    documentoUsuario?: string | null | undefined;
    documentoRemitente?: string | null | undefined;
    documentoDestinatario?: string | null | undefined;
    pesoPaquete?: string | null | undefined;
    idEstado?: string | null | undefined;
    idTamano?: string | null | undefined;
}
import { SafeUrl } from '@angular/platform-browser';
export interface PaqueteInterface {
    idPaquete?: string | null | undefined;
    codigoQrPaquete?: string | null | undefined;
    qrCodeImage?: string | null | undefined;
    qrCodeUrl?: SafeUrl | null | undefined;
    pesoPaquete?: string | null | undefined;
    unidadesPaquete?: string | null | undefined;
    contenidoPaquete?: string | null | undefined;
    documentoDestinatario?: string | null | undefined;
    nombreDestinatario?: string | null | undefined;
    correoDestinatario?: string | null | undefined;
    telefonoDestinatario?: string | null | undefined;
    fechaAproxEntrega?: string | null | undefined;
    documentoRemitente?: string | null | undefined;
    documentoUsuario?: string | null | undefined;
    idEstado?: string | null | undefined;
    idTamano?: string | null | undefined;
    idTipo?: string | null | undefined;
}
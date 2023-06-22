import { SafeUrl } from '@angular/platform-browser';
export interface PaqueteInterface {
    idPaquete?: string | null | undefined;
    codigoQrPaquete?: string | null | undefined;
    documentoUsuario?: string | null | undefined;
    documentoRemitente?: string | null | undefined;
    nombreRemitente?: string | null | undefined;
    telefonoRemitente?: string | null | undefined;
    correoRemitente?: string | null | undefined;
    documentoDestinatario?: string | null | undefined;
    nombreDestinatario?: string | null | undefined;
    direccionDestinatario?: string | null | undefined;
    telefonoDestinatario?: string | null | undefined;
    correoDestinatario?: string | null | undefined;
    idEstado?: string | null | undefined;
    idTamano?: string | null | undefined;
    qrCodeImage?: string | null | undefined;
    qrCodeUrl?: SafeUrl | null | undefined;
}
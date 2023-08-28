export interface EntregaInterface {
    idEntrega?: string | null | undefined;
    firmaDestinatario: {
        data: number[];
        type: string;
        url?: string; // Agregamos la propiedad url como opcional
      };
    fechaEntrega?: string | null | undefined;
    idRastreo?: string | null | undefined;
}
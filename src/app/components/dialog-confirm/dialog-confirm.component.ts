import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  template: `
    <h1 mat-dialog-title>{{ title }}</h1>
    <div mat-dialog-content>{{ message }}</div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Aceptar</button>
    </div>
  `,
})
export class DialogConfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  get title(): string {
    return this.data.title || 'Confirmar';
  }

  get message(): string {
    return this.data.message || '¿Estás seguro de que deseas continuar?';
  }
}

export interface ConfirmDialogData {
  title?: string;
  message?: string;
}

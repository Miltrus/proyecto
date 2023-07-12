import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  const dialog = inject(MatDialog);

  if (component.hasUnsavedChanges()) {
    const dialogRef = dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Cambios sin guardar',
        message: '¿Estás seguro que deseas salir?'
      }
    });
    return dialogRef.afterClosed();
  }
  return true;
};

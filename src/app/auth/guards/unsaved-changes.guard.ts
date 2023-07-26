import { CanDeactivateFn } from '@angular/router';
import Swal from 'sweetalert2';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {

  if (component.hasUnsavedChanges()) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cambios sin guardar',
      text: '¿Estás seguro de que deseas salir sin guardar los cambios?',
      showDenyButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  }
  return true;
};

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string, title: string) {
    const config: MatSnackBarConfig = new MatSnackBarConfig();
    config.panelClass = ['success-snackbar']; // Clase CSS personalizada para personalizar la apariencia
    config.duration = 5000; // Duración en milisegundos
    config.verticalPosition = 'bottom';
    config.horizontalPosition = 'center';

    this.snackBar.open(message, title, config);
  }

  showError(message: string, title: string) {
    const config: MatSnackBarConfig = new MatSnackBarConfig();
    config.panelClass = ['error-snackbar']; // Clase CSS personalizada para personalizar la apariencia
    config.duration = 5000; // Duración en milisegundos
    config.verticalPosition = 'bottom';
    config.horizontalPosition = 'center';

    this.snackBar.open(message, title, config);
  }
}

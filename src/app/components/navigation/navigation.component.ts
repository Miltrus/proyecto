import { Component, Inject, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../dialog-confirm/dialog-confirm.component';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  private breakpointObserver = inject(BreakpointObserver);

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    // Verificar si el modo oscuro está activo al iniciar el componente
    const isDarkModeActive = this.document.body.classList.contains('dark-mode');
    this.isDarkThemeActive = isDarkModeActive;
  }

  isDarkThemeActive = false;

  onChange(newValue: boolean): void {
    if (newValue) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  modules = [
    { name: 'Roles', route: '/list-roles' },
    { name: 'Modulos', route: '/list-modulos' },
    { name: 'Permisos', route: '/list-permisos' },
    { name: 'Clientes', route: '/list-clientes' },
    { name: 'Usuarios', route: '/list-usuarios' },
    { name: 'Paquetes', route: '/list-paquetes' }
  ]

  logout(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que deseas cerrar sesión?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['landing-page']);
        localStorage.removeItem('token');

        this.isDarkThemeActive = false;
        this.document.body.classList.remove('dark-mode');
      }
    });
  }
}
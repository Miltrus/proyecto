import { Component, Inject, ViewChild, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../dialog-confirm/dialog-confirm.component';
import { DOCUMENT } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';
import { RolService } from '../../services/api/rol/rol.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  @ViewChild('userMenuTrigger') userMenuTrigger!: MatMenuTrigger;
  private breakpointObserver = inject(BreakpointObserver);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private dialog: MatDialog,
    private rolService: RolService
  ) {}

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
    { name: 'Roles', route: '/rol' },
    { name: 'Clientes', route: '/cliente' },
    { name: 'Usuarios', route: '/usuario' },
    { name: 'Paquetes', route: '/paquete' },
    { name: 'Novedades', route: '/novedad' },
  ];

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
        localStorage.removeItem('rolId'); // Elimina el ID del rol del localStorage

        this.isDarkThemeActive = false;
        this.document.body.classList.remove('dark-mode');
      }
    });
  }

  toggleUserPanel(): void {
    if (this.userMenuTrigger) {
      this.userMenuTrigger.openMenu();
    }
  }

  goToProfile(): void {
    this.router.navigate(['usuario/profile']);
  }
}

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
import { UsuarioService } from 'src/app/services/api/usuario/usuario.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  @ViewChild('userMenuTrigger') userMenuTrigger!: MatMenuTrigger;
  private breakpointObserver = inject(BreakpointObserver);

  isDarkThemeActive = false;
  loading: boolean = true;

  modules = [
    { name: 'Roles', route: '/rol' },
    { name: 'Clientes', route: '/cliente' },
    { name: 'Usuarios', route: '/usuario' },
    { name: 'Paquetes', route: '/paquete' },
    { name: 'Novedades', route: '/novedad' },
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private dialog: MatDialog,
    private rolService: RolService,
    private userService: UsuarioService,
  ) {
    const isDarkModeActive = this.document.body.classList.contains('dark-mode');
    const storedTheme = localStorage.getItem('isDarkThemeActive');

    this.isDarkThemeActive = storedTheme ? storedTheme === 'true' : isDarkModeActive;

    if (this.isDarkThemeActive) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
    // Obtener los permisos del rol y filtrar los módulos correspondientes
    /* const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token?.split('.')[1] || ''));
    const uid = decodedToken.uid; */

    /* this.userService.getOneUsuario(uid).subscribe(data => {
      const rol = data.idRol;

      this.rolService.getRolPermisos(rol).subscribe(data => {

        const permisos = data.idPermiso?.map((rolPermiso) => rolPermiso.permiso?.nombrePermiso);
        
        this.modules = this.modules.filter((module) => permisos.includes(module.name));
      }); */
    this.loading = false
    //});
  }





  onChange(newValue: boolean): void {
    this.isDarkThemeActive = newValue;

    localStorage.setItem('isDarkThemeActive', String(newValue));
    if (newValue) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
    this.loading = false;
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );


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

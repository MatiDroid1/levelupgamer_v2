import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  readonly carrito = inject(CarritoService);

  readonly links = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo Gamer', path: '/catalogo' },
    { label: 'Mis Pedidos', path: '/pedidos' },
  ];

  // Mañana con Azure: esto sale de MsalService.instance.getActiveAccount()
  readonly usuario: string | null = null;

  login(): void {
    // MsalService.loginRedirect()
    alert('Login con Microsoft Entra ID: se conecta mañana con MSAL.');
  }
}

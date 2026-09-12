import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AccountInfo } from '@azure/msal-browser';

import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header implements OnInit, OnDestroy {
  readonly carrito = inject(CarritoService);

  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly destroying$ = new Subject<void>();

  readonly links = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo Gamer', path: '/catalogo' },
    { label: 'Mis Pedidos', path: '/pedidos' },
  ];

  usuario: string | null = null;
  botonesDeshabilitados = false;

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(takeUntil(this.destroying$))
      .subscribe((status: InteractionStatus) => {
        this.botonesDeshabilitados = status !== InteractionStatus.None;
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.actualizarUsuarioActivo();
      });

    this.actualizarUsuarioActivo();
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }

  private actualizarUsuarioActivo(): void {
    const cuentas: AccountInfo[] = this.msalService.instance.getAllAccounts();

    if (cuentas.length > 0) {
      this.msalService.instance.setActiveAccount(cuentas[0]);
      this.usuario = cuentas[0].name ?? cuentas[0].username;
    } else {
      this.usuario = null;
    }
  }

  login(): void {
    this.msalService.loginRedirect();
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }
}
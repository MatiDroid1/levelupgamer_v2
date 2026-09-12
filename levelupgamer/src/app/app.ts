import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, take } from 'rxjs/operators';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  ngOnInit(): void {
    this.msalService.instance.initialize().then(() => {
      // handleRedirectObservable() es la forma recomendada por Microsoft
      // para procesar el "code" que vuelve en la URL tras el login.
      // A diferencia de handleRedirectPromise(), este observable garantiza
      // que MsalBroadcastService actualice inProgress$ correctamente
      // (de "startup" a "none") una vez que termina.
      this.msalService.handleRedirectObservable().subscribe({
        next: () => {
          // Redirect procesado (o no había ninguno pendiente).
        },
        error: (error) => {
          console.error('Error procesando el redirect de MSAL:', error);
        },
      });

      // Red de seguridad: si por cualquier motivo inProgress$ nunca emite
      // "None" en los primeros segundos, lo forzamos a revisar el estado
      // real de las cuentas guardadas, para no dejar la UI bloqueada.
      this.msalBroadcastService.inProgress$
        .pipe(
          filter((status: InteractionStatus) => status === InteractionStatus.None),
          take(1)
        )
        .subscribe(() => {
          const cuentas = this.msalService.instance.getAllAccounts();
          if (cuentas.length > 0) {
            this.msalService.instance.setActiveAccount(cuentas[0]);
          }
        });
    });
  }
}
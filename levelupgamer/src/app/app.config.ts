import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import {
  MsalModule,
  MsalService,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuard,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import {
  PublicClientApplication,
  IPublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';

import { routes } from './app.routes';

// ---------------------------------------------------------------------------
// Datos reales del tenant Pedidos360 (Azure AD / Entra ID)
// ---------------------------------------------------------------------------
const TENANT_ID = 'bb5324af-c266-41ed-b36c-a971641c7af2';
const FRONTEND_CLIENT_ID = '4e1b80a0-e37c-466a-8492-1e6c6bb1d316';
const BACKEND_SCOPE = 'api://260c8d4a-9eae-4da8-9e2b-76c587b25b85/access_as_user';
const REDIRECT_URI = 'http://localhost:4200';

// ---------------------------------------------------------------------------
// Instancia UNICA de MSAL.
// NOTA: ya NO se usa APP_INITIALIZER manual. El manejo del redirect
// (handleRedirectObservable) queda a cargo de MsalRedirectComponent,
// agregado en app.html / app.ts, que es el mecanismo oficial recomendado
// por Microsoft para apps standalone con flujo Redirect.
// ---------------------------------------------------------------------------
function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: FRONTEND_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: REDIRECT_URI,
      postLogoutRedirectUri: REDIRECT_URI,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        loggerCallback: (_level: LogLevel, message: string) => {
          console.log(message);
        },
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Configuración del Guard
// ---------------------------------------------------------------------------
function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read', BACKEND_SCOPE],
    },
  };
}

// ---------------------------------------------------------------------------
// Configuración del Interceptor
// ---------------------------------------------------------------------------
function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();

  protectedResourceMap.set('http://localhost:8081/*', [BACKEND_SCOPE]); // mspedidos
  protectedResourceMap.set('http://localhost:8082/*', [BACKEND_SCOPE]); // msproductos

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),

    importProvidersFrom(MsalModule),

    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: msalGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: msalInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
};
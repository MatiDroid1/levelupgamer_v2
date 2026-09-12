import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Inicio · LevelUp Gamer',
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo),
    title: 'Catálogo · LevelUp Gamer',
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito),
    title: 'Carrito · LevelUp Gamer',
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos),
    title: 'Mis pedidos · LevelUp Gamer',
    // Mañana: canActivate: [MsalGuard]
  },
  { path: '**', redirectTo: '' },
];

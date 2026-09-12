import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.html',
})
export class Carrito {
  readonly carrito = inject(CarritoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  // Mañana: sale del claim preferred_username del token. Hoy lo escribe el usuario.
  readonly usuario = signal('demo@levelupgamer.cl');
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  confirmar(): void {
    if (this.carrito.items().length === 0 || !this.usuario().trim()) return;
    this.enviando.set(true);
    this.error.set(null);

    this.pedidoService.crear({
      usuario: this.usuario().trim(),
      detalles: this.carrito.items().map(i => ({
        productoId: i.producto.id,
        nombreProducto: i.producto.nombre,
        precioUnitario: i.producto.precio,
        cantidad: i.cantidad,
      })),
    }).subscribe({
      next: pedido => {
        this.carrito.vaciar();
        this.enviando.set(false);
        this.router.navigate(['/pedidos'], { queryParams: { creado: pedido.id } });
      },
      error: err => {
        this.enviando.set(false);
        this.error.set(err.status === 0
          ? 'No hay conexión con ms-pedidos (puerto 8081).'
          : `Error ${err.status} al crear el pedido.`);
      },
    });
  }
}

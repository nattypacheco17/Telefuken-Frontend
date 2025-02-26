import { Component, Input, Output, EventEmitter,ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush //Optimización de rendimiento

})
export class FileComponent {
  @Input() fichasRestantes!: number; // Número inicial de fichas por jugador
  @Input() jugador!: string; // Se mantiene 'jugador'

  @Output() fichaSeleccionada = new EventEmitter<{ jugador: string }>();
  constructor(private cdr: ChangeDetectorRef) {}

  seleccionarFicha() {
    if (this.fichasRestantes > 0) {
      this.fichaSeleccionada.emit({ jugador: this.jugador });
      this.fichasRestantes--;
      this.cdr.markForCheck();
    }
  }
}

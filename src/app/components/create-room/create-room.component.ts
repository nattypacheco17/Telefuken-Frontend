import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css'
})
export class CreateRoomComponent {
  playerName: string = '';
  numPlayers: number | null = null;

  constructor(
    private router: Router,
    private roomService: RoomService
  ) { }

  async createRoom() {
    if (!this.playerName || !this.numPlayers) return;
  
    try {
      const roomCode = await this.roomService.createRoom({ 
        roomName: 'Sala de ' + this.playerName,
        playerName: this.playerName,
        numPlayers: this.numPlayers,
        avatar: 'default'
      });
      
      // Al crear la sala, marcamos al jugador como anfitrión
      this.router.navigate(['/waiting-room', roomCode], {
        state: {
          playerName: this.playerName,
          maxPlayers: this.numPlayers,
          isHost: true  // Marcamos explícitamente como anfitrión
        }
      });
    } catch (error) {
      console.error('Error al crear la sala:', error);
    }
  }
}
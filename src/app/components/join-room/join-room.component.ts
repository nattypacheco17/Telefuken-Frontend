import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { MusicPlayerComponent } from '../music-player/music-player.component';
 import { MusicPlayerService } from '../../services/music-player.service';
import { HelpButtonComponent } from '../help-button/help-button.component';
@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule,MusicPlayerComponent,HelpButtonComponent],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css'
})
export class JoinRoomComponent {
  playerName: string = '';
  roomCode: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private roomService: RoomService,
   public musicService: MusicPlayerService
  ) { }

  async joinRoom() {
    if (!this.playerName || !this.roomCode) return;

    try {
        const response = await this.roomService.joinRoom({
            roomCode: this.roomCode.toUpperCase(),
            playerName: this.playerName,
            avatar: 'default'
        });

        if (response.success) {
            await this.router.navigate(['/waiting-room', this.roomCode], {
                state: {
                    playerName: this.playerName,
                    isHost: false
                }
            });
        } else {
            this.errorMessage = response.message || 'Error al unirse a la sala';
        }
    } catch (error) {
        console.error('Error al unirse a la sala:', error);
        this.errorMessage = 'Error de conexión. Por favor, intenta de nuevo.';
    }
}

  goBack() {
    this.router.navigate(['/']);
  }
}

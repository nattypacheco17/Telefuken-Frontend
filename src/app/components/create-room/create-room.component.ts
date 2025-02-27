import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { MusicPlayerService } from '../../services/music-player.service';
import { MusicPlayerComponent } from '../music-player/music-player.component';
import { HelpButtonComponent } from '../help-button/help-button.component';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule,MusicPlayerComponent,HelpButtonComponent],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css'
})
export class CreateRoomComponent {
  playerName: string = '';
  numPlayers: number | null = null;

  constructor(
    private router: Router,
    private roomService: RoomService,
    public musicService: MusicPlayerService
  ) { }

  async createRoom() {
    if (!this.playerName || !this.numPlayers) return;

    try {
      const roomCode = await this.roomService.createRoom({
        roomName: 'Sala de ' + this.playerName,
        playerName: this.playerName,
        numPlayers: this.numPlayers,
      });

      this.router.navigate(['/waiting-room', roomCode], {
        state: {
          playerName: this.playerName,
          maxPlayers: this.numPlayers,
          isHost: true
        }
      });
    } catch (error) {
      console.error('Error al crear la sala:', error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  playMusic() {
    this.musicService.play();
  }

  pauseMusic() {
    this.musicService.pause();
  }
}

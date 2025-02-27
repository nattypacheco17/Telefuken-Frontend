import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Subscription } from 'rxjs';
import { MusicPlayerComponent } from '../music-player/music-player.component';
import { MusicPlayerService } from '../../services/music-player.service';
import { HelpButtonComponent } from '../help-button/help-button.component';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, MusicPlayerComponent,HelpButtonComponent],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  playerName: string = '';
  roomCode: string = '';
  currentPlayers: number = 1;
  maxPlayers: number = 2;
  isHost: boolean = false;
  connectedPlayers: string[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService,
    public musicService: MusicPlayerService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.playerName = navigation.extras.state['playerName'];
      this.maxPlayers = navigation.extras.state['maxPlayers'];
      this.isHost = navigation.extras.state['isHost'] || false;
      this.connectedPlayers = [this.playerName];
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomCode = params['roomCode'];
      this.roomService.requestPlayersList(this.roomCode);
    });

    this.setupRoomListeners();

    const playersListSub = this.roomService.onPlayersListUpdate().subscribe(playersList => {
      this.connectedPlayers = playersList;
      this.currentPlayers = this.connectedPlayers.length;
    });
    this.subscriptions.push(playersListSub);

    const gameStartedSub = this.roomService.onGameStarted().subscribe(() => {
      console.log('Juego iniciado, redirigiendo a la pantalla de juego');
      this.router.navigate(['/game', this.roomCode], {
        state: {
          playerName: this.playerName,
          isHost: this.isHost,
          maxPlayers: this.maxPlayers,
          connectedPlayers: this.connectedPlayers
        }
      });
    });
    this.subscriptions.push(gameStartedSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupRoomListeners() {
    const playerJoinedSub = this.roomService.onPlayerJoined().subscribe((player) => {
      console.log('Jugador unido:', player.name);
    });
    this.subscriptions.push(playerJoinedSub);

    const playerLeftSub = this.roomService.onPlayerLeft().subscribe(() => {
    });
    this.subscriptions.push(playerLeftSub);
  }

  copyCode() {
    navigator.clipboard.writeText(this.roomCode).then(() => {
      alert('¡Código copiado!');
    }).catch(err => {
      console.error('Error al copiar el código: ', err);
    });
  }

  cancelGame() {
    this.roomService.leaveRoom(this.roomCode);
    this.router.navigate(['/']);
  }

  async startGame() {
    if (this.isHost) {
      try {
        console.log('Iniciando juego con jugadores:', this.connectedPlayers);
        const success = await this.roomService.startGame(this.roomCode);

        if (!success) {
          console.error('Error al iniciar el juego');
        }
      } catch (error) {
        console.error('Error al iniciar el juego:', error);
      }
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent implements OnInit {
  playerName: string = '';
  roomCode: string = '';
  currentPlayers: number = 1;
  maxPlayers: number = 2;
  isHost: boolean = false;
  connectedPlayers: string[] = []; // Lista de jugadores conectados

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.playerName = navigation.extras.state['playerName'];
      this.maxPlayers = navigation.extras.state['maxPlayers'];
      this.isHost = navigation.extras.state['isHost'] || false;
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomCode = params['roomCode'];
    });

    this.setupRoomListeners();

    // Modificado: Agregamos los datos de los jugadores al navegar
    this.roomService.onGameStarted().subscribe(() => {
      this.router.navigate(['/game', this.roomCode], {
        state: {
          playerName: this.playerName,
          isHost: this.isHost,
          maxPlayers: this.maxPlayers,
          connectedPlayers: this.connectedPlayers // Nuevo: Pasamos la lista de jugadores
        }
      });
    });
  }

  private setupRoomListeners() {
    // Escuchar cuando se unen nuevos jugadores
    this.roomService.onPlayerJoined().subscribe((player) => {
      this.currentPlayers++;
      // Nuevo: Agregamos el jugador a la lista de conectados
      this.connectedPlayers.push(player.name);
    });

    // Escuchar cuando los jugadores se van
    this.roomService.onPlayerLeft().subscribe(() => {
      this.currentPlayers--;
    });
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
        const success = await this.roomService.startGame(this.roomCode);
        if (success) {
          // Modificado: Usamos la misma estructura de datos al navegar
          this.router.navigate(['/game', this.roomCode], {
            state: {
              playerName: this.playerName,
              isHost: this.isHost,
              maxPlayers: this.maxPlayers,
              connectedPlayers: this.connectedPlayers // Nuevo: Pasamos la lista de jugadores
            }
          });
        }
      } catch (error) {
        console.error('Error al iniciar el juego:', error);
      }
    }
  }
}
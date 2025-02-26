import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Subscription } from 'rxjs';
import { FileComponent } from '../file/file.component';  // Se importa el componente de fichas

interface PlayerScore {
  playerName: string;
  scores: { [key: string]: number };
  total: number;
  fichasRestantes: number;  // Se agrega la propiedad para las fichas
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, FileComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  playerName: string = '';
  roomCode: string = '';
  isHost: boolean = false;
  currentRound: string = '1/3';  // Ronda inicial
  currentScore: number | null = null;
  players: PlayerScore[] = [];
  maxPlayers: number = 0;
  connectedPlayers: string[] = [];

  // Definimos las rondas del juego
  readonly rounds = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];

  // Para gestionar suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {
    // Recuperamos los datos del state de la navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.playerName = navigation.extras.state['playerName'];
      this.isHost = navigation.extras.state['isHost'] || false;
      this.maxPlayers = navigation.extras.state['maxPlayers'];
      this.connectedPlayers = navigation.extras.state['connectedPlayers'] || [];

      console.log('Datos recuperados en Game Component:');
      console.log('- Jugador actual:', this.playerName);
      console.log('- Es anfitrión:', this.isHost);
      console.log('- Jugadores conectados:', this.connectedPlayers);

      this.initializePlayers();
    } else {
      console.error('No se encontraron datos del jugador');
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomCode = params['roomCode'];
      console.log('Código de sala:', this.roomCode);

      this.roomService.requestPlayersList(this.roomCode);
    });

    const playersListSub = this.roomService.onPlayersListUpdate().subscribe(playersList => {
      console.log('Lista actualizada de jugadores recibida:', playersList);
      this.connectedPlayers = playersList;
      this.updatePlayersList();
    });
    this.subscriptions.push(playersListSub);

    const scoreUpdateSub = this.roomService.onScoreUpdate().subscribe(data => {
      console.log('Actualización de puntuación recibida:', data);

      const playerIndex = this.getPlayerIndex(data.playerName);
      if (playerIndex !== -1) {
        const roundName = this.rounds[data.round];
        this.players[playerIndex].scores[roundName] = data.score;
        this.updateTotalScore(playerIndex);
        console.log(`Puntuación actualizada para ${data.playerName} en ronda ${roundName}: ${data.score}`);
      } else {
        console.warn('Jugador no encontrado en la actualización de puntuación:', data.playerName);
      }
    });
    this.subscriptions.push(scoreUpdateSub);

    const roundChangeSub = this.roomService.onRoundChange().subscribe(roundIndex => {
      console.log('Cambio de ronda recibido:', roundIndex);

      if (roundIndex >= 0 && roundIndex < this.rounds.length) {
        this.currentRound = this.rounds[roundIndex];
        console.log(`Ronda actual cambiada a: ${this.currentRound}`);
        this.currentScore = null;
      } else {
        console.error('Índice de ronda inválido:', roundIndex);
      }
    });
    this.subscriptions.push(roundChangeSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializePlayers() {
    this.players = [];

    if (this.connectedPlayers && this.connectedPlayers.length > 0) {
      for (const name of this.connectedPlayers) {
        this.players.push({
          playerName: name,
          scores: {},
          total: 0,
          fichasRestantes: 10  // Inicializamos con 10 fichas
        });
      }
      console.log('Jugadores inicializados:', this.players);
    } else {
      this.players.push({
        playerName: this.playerName,
        scores: {},
        total: 0,
        fichasRestantes: 10  // Inicializamos con 10 fichas
      });
      console.log('Solo se ha inicializado el jugador actual:', this.players);
    }
  }

  // Actualiza la lista de jugadores manteniendo las puntuaciones y fichas existentes
  private updatePlayersList() {
    const scoresMap = new Map<string, { scores: { [key: string]: number }, total: number, fichasRestantes: number }>();

    this.players.forEach(player => {
      scoresMap.set(player.playerName, {
        scores: { ...player.scores },
        total: player.total,
        fichasRestantes: player.fichasRestantes
      });
    });

    this.players = this.connectedPlayers.map(name => {
      const existing = scoresMap.get(name);
      return {
        playerName: name,
        scores: existing ? existing.scores : {},
        total: existing ? existing.total : 0,
        fichasRestantes: existing ? existing.fichasRestantes : 10  // Valor por defecto
      };
    });

    console.log('Lista de jugadores actualizada:', this.players);
  }

  private getPlayerIndex(playerName: string): number {
    return this.players.findIndex(p => p.playerName === playerName);
  }

  // Función para manejar la selección de una ficha
  manejarFichaSeleccionada(event: { jugador: string }) {
    if (event.jugador === this.playerName) {
      const index = this.getPlayerIndex(this.playerName);
      if (index !== -1 && this.players[index].fichasRestantes > 0) {
        this.players[index].fichasRestantes--;
      }
    }
  }

  // Verifica si el jugador existe en la lista
  existeJugador(playerName: string): boolean {
    return this.players.some(p => p.playerName === playerName);
  }

  // Obtiene el número de fichas restantes para un jugador
  getFichasRestantes(playerName: string): number {
    const player = this.players.find(p => p.playerName === playerName);
    return player ? player.fichasRestantes : 0;
  }

  // Envía la puntuación del jugador actual
  submitScore() {
    if (this.currentScore !== null) {
      const roundIndex = this.rounds.indexOf(this.currentRound);
      console.log('Enviando puntuación:', {
        roomCode: this.roomCode,
        playerName: this.playerName,
        round: roundIndex,
        score: this.currentScore
      });

      this.roomService.updateScore({
        roomCode: this.roomCode,
        playerName: this.playerName,
        round: roundIndex,
        score: this.currentScore
      });

      const playerIndex = this.getPlayerIndex(this.playerName);
      if (playerIndex !== -1) {
        this.players[playerIndex].scores[this.currentRound] = this.currentScore;
        this.updateTotalScore(playerIndex);
        console.log(`Puntuación actualizada para ${this.playerName} en ronda ${this.currentRound}: ${this.currentScore}`);
      }

      // Reseteamos el input después de enviar
      this.currentScore = null;
    } else {
      console.warn('No se puede enviar puntuación nula');
    }
  }

  // Avanza a la siguiente ronda (solo para el anfitrión)
  nextRound() {
    if (this.isHost) {
      const currentIndex = this.rounds.indexOf(this.currentRound);
      const nextIndex = currentIndex + 1;

      if (nextIndex < this.rounds.length) {
        console.log(`Intentando avanzar a la ronda: ${this.rounds[nextIndex]} (índice ${nextIndex})`);

        this.roomService.advanceRound({
          roomCode: this.roomCode,
          roundIndex: nextIndex
        });
      } else {
        console.warn('Ya estamos en la última ronda');
      }
    } else {
      console.warn('Solo el anfitrión puede avanzar a la siguiente ronda');
    }
  }

  // Calcula el total de las puntuaciones de un jugador
  private updateTotalScore(playerIndex: number) {
    let total = 0;
    for (const roundName of this.rounds) {
      const score = this.players[playerIndex].scores[roundName];
      if (typeof score === 'number') {
        total += score;
      }
    }
    this.players[playerIndex].total = total;
  }

  // Sale del juego y vuelve al inicio
  leaveGame() {
    console.log('Saliendo del juego');
    this.roomService.leaveRoom(this.roomCode);
    this.router.navigate(['/']);
  }

}

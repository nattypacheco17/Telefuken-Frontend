// game.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';

interface PlayerScore {
  playerName: string;
  scores: { [key: string]: number };
  total: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  playerName: string = '';
  roomCode: string = '';
  isHost: boolean = false;
  currentRound: string = '1/3';
  currentScore: number | null = null;
  players: PlayerScore[] = [];
  
  readonly rounds = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.playerName = navigation.extras.state['playerName'];
      this.isHost = navigation.extras.state['isHost'] || false;
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomCode = params['roomCode'];
      // Obtener la lista inicial de jugadores
      this.roomService.getCurrentRoom().subscribe(room => {
        if (room) {
          // Inicializar la lista de jugadores con puntuaciones vacías
          this.players = Array.from(room.players.values()).map(player => ({
            playerName: player.name,
            scores: {},
            total: 0
          }));
        }
      });
    });

    // Escuchar actualizaciones de puntuación
    this.roomService.onScoreUpdate().subscribe(data => {
      const playerIndex = this.players.findIndex(p => p.playerName === data.playerName);
      if (playerIndex >= 0) {
        this.players[playerIndex].scores[this.currentRound] = data.score;
        this.updateTotalScore(playerIndex);
      } else {
        const newPlayer: PlayerScore = {
          playerName: data.playerName,
          scores: { [this.currentRound]: data.score },
          total: data.score
        };
        this.players.push(newPlayer);
      }
    });

    // Escuchar cambios de ronda
    this.roomService.onRoundChange().subscribe(roundIndex => {
      this.currentRound = this.rounds[roundIndex];
      this.currentScore = null;
    });
  }

  submitScore() {
    if (this.currentScore !== null) {
      this.roomService.updateScore({
        roomCode: this.roomCode,
        playerName: this.playerName,
        round: this.rounds.indexOf(this.currentRound),
        score: this.currentScore
      });
      this.currentScore = null;
    }
  }

  nextRound() {
    if (this.isHost) {
      const currentIndex = this.rounds.indexOf(this.currentRound);
      if (currentIndex < this.rounds.length - 1) {
        this.roomService.advanceRound(currentIndex + 1);
      }
    }
  }

  private updateTotalScore(playerIndex: number) {
    this.players[playerIndex].total = Object.values(this.players[playerIndex].scores)
      .reduce((sum, score) => sum + score, 0);
  }

  leaveGame() {
    this.roomService.leaveRoom(this.roomCode);
    this.router.navigate(['/']);
  }
}
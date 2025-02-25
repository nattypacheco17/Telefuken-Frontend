import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

export interface Room {
  code: string;
  name: string;
  players: Player[];
  maxPlayers: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private socket: Socket;
  private currentRoom = new BehaviorSubject<Room | null>(null);
  private readonly SERVER_URL = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.SERVER_URL);
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('roomUpdate', (room: Room) => {
      this.currentRoom.next(room);
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.IO');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Error de conexión con Socket.IO:', error);
    });
  }

  // Crear una nueva sala
  createRoom(data: {
    roomName: string;
    playerName: string;
    numPlayers: number;
  }): Promise<string> {
    return new Promise((resolve) => {
      this.socket.emit('createRoom', data, ({ code }: { code: string }) => {
        console.log('Sala creada con código:', code);
        resolve(code);
      });
    });
  }

  // Unirse a una sala existente
  joinRoom(data: {
    roomCode: string;
    playerName: string;
    avatar: string;
  }): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, message: 'Tiempo de espera agotado' });
      }, 5000);

      this.socket.emit('joinRoom', data, (response: { success: boolean; message?: string }) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  // Observables para eventos del juego
  onPlayerJoined(): Observable<Player> {
    return new Observable(observer => {
      this.socket.on('playerJoined', (player: Player) => {
        observer.next(player);
      });
    });
  }

  onPlayerLeft(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('playerLeft', (playerId: string) => {
        observer.next(playerId);
      });
    });
  }

  // Actualizar puntuaciones
  updateScore(data: {
    roomCode: string;
    playerName: string;
    round: number;
    score: number;
  }): void {
    this.socket.emit('updateScore', data);
  }

  onScoreUpdate(): Observable<{
    playerName: string;
    round: number;
    score: number;
    scores: Record<string, number[]>;
  }> {
    return new Observable(observer => {
      this.socket.on('scoreUpdate', (data) => {
        observer.next(data);
      });
    });
  }

  // Obtener sala actual
  getCurrentRoom(): Observable<Room | null> {
    return this.currentRoom.asObservable();
  }

  // Verificar si una sala existe
  checkRoom(roomCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.socket.emit('checkRoom', roomCode, (exists: boolean) => {
        resolve(exists);
      });
    });
  }

  // Salir de la sala
  leaveRoom(roomCode: string): void {
    this.socket.emit('leaveRoom', roomCode);
    this.currentRoom.next(null);
  }

  // Finalizar el juego
  endGame(roomCode: string): void {
    this.socket.emit('endGame', roomCode);
  }

  // Desconectar socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Reconectar socket
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Verificar conexión
  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  // Manejar errores de conexión
  onConnectionError(): Observable<Error> {
    return new Observable(observer => {
      this.socket.on('connect_error', (error: Error) => {
        observer.next(error);
      });
    });
  }

  advanceRound(data: { roomCode: string, roundIndex: number }): void {
    console.log('Enviando evento para avanzar a la ronda:', data);
    this.socket.emit('advanceRound', data);
  }

  onRoundChange(): Observable<number> {
    return new Observable(observer => {
      this.socket.on('roundChanged', (roundIndex: number) => {
        console.log('Evento roundChanged recibido:', roundIndex);
        observer.next(roundIndex);
      });
    });
  }

  onGameStart(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('gameStart', () => {
        observer.next();
      });
    });
  }

  startGame(roomCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.socket.emit('startGame', { roomCode }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  onGameStarted(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('gameStarted', () => {
        observer.next();
      });
    });
  }

  getCurrentPlayers(roomCode: string): Observable<any[]> {
    return new Observable(observer => {
      this.socket.emit('getPlayers', roomCode, (players: any[]) => {
        observer.next(players);
      });
    });
  }

  requestPlayersList(roomCode: string): void {
    this.socket.emit('requestPlayersList', { roomCode });
  }

  onPlayersListUpdate(): Observable<string[]> {
    return new Observable(observer => {
      this.socket.on('playersListUpdate', (playersList: string[]) => {
        console.log('Lista de jugadores actualizada recibida:', playersList);
        observer.next(playersList);
      });
    });
  }
}
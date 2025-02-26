import { TestBed } from '@angular/core/testing';
import { RoomService, Room, Player } from './room.service';
import { Socket } from 'socket.io-client';


// Mock para Socket.io
class MockSocket {
  private listeners: { [event: string]: Function[] } = {};
  public connected = true;



  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]): void {
    // El último argumento es generalmente el callback
    if (typeof args[args.length - 1] === 'function') {
      const callback = args.pop();

      // Simulamos diferentes respuestas según el evento
      switch (event) {
        case 'createRoom':
          callback({ code: 'ABC123' });
          break;
        case 'joinRoom':
          callback({ success: true });
          break;
        case 'checkRoom':
          callback(true);
          break;
        case 'startGame':
          callback({ success: true });
          break;
        case 'getPlayers':
          callback(['Jugador1', 'Jugador2']);
          break;
        default:
        // No hacer nada
      }
    }
  }

  // Método para simular eventos entrantes
  triggerEvent(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(...args);
      });
    }
  }

  disconnect(): void {
    this.connected = false;
  }

  connect(): void {
    this.connected = true;
  }
}

describe('RoomService', () => {
  let service: RoomService;
  let mockSocket: MockSocket;

  beforeEach(() => {
    mockSocket = new MockSocket();

    // Mockear el método io en window
    (window as any).io = jasmine.createSpy('io').and.returnValue(mockSocket);
    // Ignorar errores de conexión de Socket.IO en la consola
    spyOn(console, 'error').and.callFake((message) => {
      if (message.includes('Error de conexión con Socket.IO')) {
        return; // Ignorar errores de Socket.IO
      }
      console.error(message); // Mostrar otros errores
    });

    TestBed.configureTestingModule({
      providers: [RoomService],
    });
    service = TestBed.inject(RoomService);

    // Establecer el socket mock en el servicio
    (service as any).socket = mockSocket;



  });


  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });


  it('debería crear una sala correctamente', async () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const roomData = {
      roomName: 'Sala de Prueba',
      playerName: 'Jugador1',
      numPlayers: 4
    };

    const code = await service.createRoom(roomData);

    expect(emitSpy).toHaveBeenCalledWith('createRoom', roomData, jasmine.any(Function));
    expect(code).toBe('ABC123');
  });

  it('debería unirse a una sala correctamente', async () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const joinData = {
      roomCode: 'ABC123',
      playerName: 'Jugador2',
      avatar: 'avatar1'
    };

    const response = await service.joinRoom(joinData);

    expect(emitSpy).toHaveBeenCalledWith('joinRoom', joinData, jasmine.any(Function));
    expect(response.success).toBeTrue();
  });

  it('debería manejar timeout al unirse a una sala', async () => {
    // Reemplazamos la implementación de emit para no llamar al callback
    spyOn(mockSocket, 'emit').and.callFake(() => {});

    jasmine.clock().install();

    const joinPromise = service.joinRoom({
      roomCode: 'ABC123',
      playerName: 'Jugador2',
      avatar: 'avatar1'
    });

    // Avanzamos el reloj para activar el timeout
    jasmine.clock().tick(6000);

    const response = await joinPromise;

    expect(response.success).toBeFalse();
    expect(response.message).toBe('Tiempo de espera agotado');

    jasmine.clock().uninstall();
  });

  it('debería notificar cuando un jugador se une', (done) => {
    const player: Player = {
      id: '123',
      name: 'Jugador3',
      avatar: 'avatar2',
      isHost: false
    };

    service.onPlayerJoined().subscribe(newPlayer => {
      expect(newPlayer).toEqual(player);
      done();
    });

    // Simulamos el evento de jugador unido
    mockSocket.triggerEvent('playerJoined', player);
  });

  it('debería notificar cuando un jugador abandona', (done) => {
    const playerId = '123';

    service.onPlayerLeft().subscribe(id => {
      expect(id).toBe(playerId);
      done();
    });

    // Simulamos el evento de jugador abandonando
    mockSocket.triggerEvent('playerLeft', playerId);
  });

  it('debería actualizar la puntuación correctamente', () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const scoreData = {
      roomCode: 'ABC123',
      playerName: 'Jugador1',
      round: 2,
      score: 10
    };

    service.updateScore(scoreData);

    expect(emitSpy).toHaveBeenCalledWith('updateScore', scoreData);
  });

  it('debería notificar actualizaciones de puntuación', (done) => {
    const scoreData = {
      playerName: 'Jugador1',
      round: 2,
      score: 10,
      scores: { 'Jugador1': [10, 5, 8] }
    };

    service.onScoreUpdate().subscribe(data => {
      expect(data).toEqual(scoreData);
      done();
    });

    // Simulamos el evento de actualización de puntuación
    mockSocket.triggerEvent('scoreUpdate', scoreData);
  });



  it('debería verificar si una sala existe', async () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const exists = await service.checkRoom('ABC123');

    expect(emitSpy).toHaveBeenCalledWith('checkRoom', 'ABC123', jasmine.any(Function));
    expect(exists).toBeTrue();
  });

  it('debería abandonar la sala correctamente', () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();
    const nextSpy = spyOn((service as any).currentRoom, 'next');

    service.leaveRoom('ABC123');

    expect(emitSpy).toHaveBeenCalledWith('leaveRoom', 'ABC123');
    expect(nextSpy).toHaveBeenCalledWith(null);
  });

  it('debería finalizar el juego correctamente', () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    service.endGame('ABC123');

    expect(emitSpy).toHaveBeenCalledWith('endGame', 'ABC123');
  });

  it('debería desconectar el socket correctamente', () => {
    const disconnectSpy = spyOn(mockSocket, 'disconnect');

    service.disconnect();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('debería reconectar el socket correctamente', () => {
    const connectSpy = spyOn(mockSocket, 'connect');

    service.reconnect();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('debería verificar si está conectado correctamente', () => {
    mockSocket.connected = true;
    expect(service.isConnected()).toBeTrue();

    mockSocket.connected = false;
    expect(service.isConnected()).toBeFalse();
  });

  it('debería notificar errores de conexión', (done) => {
    const error = new Error('Error de conexión');

    service.onConnectionError().subscribe(err => {
      expect(err).toEqual(error);
      done();
    });

    // Simulamos un error de conexión
    mockSocket.triggerEvent('connect_error', error);
  });

  it('debería avanzar de ronda correctamente', () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const roundData = {
      roomCode: 'ABC123',
      roundIndex: 3
    };

    service.advanceRound(roundData);

    expect(emitSpy).toHaveBeenCalledWith('advanceRound', roundData);
  });

  it('debería notificar cambios de ronda', (done) => {
    const roundIndex = 3;

    service.onRoundChange().subscribe(index => {
      expect(index).toBe(roundIndex);
      done();
    });

    // Simulamos el evento de cambio de ronda
    mockSocket.triggerEvent('roundChanged', roundIndex);
  });

  it('debería notificar cuando inicia el juego', (done) => {
    service.onGameStart().subscribe(() => {
      // Solo verificamos que se llamó al observer
      done();
    });

    // Simulamos el evento de inicio de juego
    mockSocket.triggerEvent('gameStart');
  });

  it('debería iniciar el juego correctamente', async () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    const success = await service.startGame('ABC123');

    expect(emitSpy).toHaveBeenCalledWith('startGame', { roomCode: 'ABC123' }, jasmine.any(Function));
    expect(success).toBeTrue();
  });

  it('debería notificar cuando el juego ha iniciado', (done) => {
    service.onGameStarted().subscribe(() => {
      // Solo verificamos que se llamó al observer
      done();
    });

    // Simulamos el evento de juego iniciado
    mockSocket.triggerEvent('gameStarted');
  });

  it('debería obtener los jugadores actuales', (done) => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    service.getCurrentPlayers('ABC123').subscribe(players => {
      expect(players).toEqual(['Jugador1', 'Jugador2']);
      done();
    });

    // Verificamos que se emitió el evento correctamente
    expect(emitSpy).toHaveBeenCalledWith('getPlayers', 'ABC123', jasmine.any(Function));
  });

  it('debería solicitar la lista de jugadores correctamente', () => {
    const emitSpy = spyOn(mockSocket, 'emit').and.callThrough();

    service.requestPlayersList('ABC123');

    expect(emitSpy).toHaveBeenCalledWith('requestPlayersList', { roomCode: 'ABC123' });
  });

  it('debería notificar actualizaciones de la lista de jugadores', (done) => {
    const playersList = ['Jugador1', 'Jugador2', 'Jugador3'];

    service.onPlayersListUpdate().subscribe(list => {
      expect(list).toEqual(playersList);
      done();
    });

    // Simulamos el evento de actualización de lista de jugadores
    mockSocket.triggerEvent('playersListUpdate', playersList);
  });
});

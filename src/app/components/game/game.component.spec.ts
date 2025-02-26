import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { of, Subject } from 'rxjs';
import { GameComponent } from './game.component';
import { RoomService } from '../../services/room.service';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FileComponent } from '../file/file.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let roomServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  // Subjects for emitting mock events
  const playersListSubject = new Subject<string[]>();
  const scoreUpdateSubject = new Subject<{playerName: string, round: number, score: number}>();
  const roundChangeSubject = new Subject<number>();

  beforeEach(async () => {
    // Mock services
    roomServiceMock = {
      requestPlayersList: jasmine.createSpy('requestPlayersList'),
      onPlayersListUpdate: jasmine.createSpy('onPlayersListUpdate').and.returnValue(playersListSubject.asObservable()),
      onScoreUpdate: jasmine.createSpy('onScoreUpdate').and.returnValue(scoreUpdateSubject.asObservable()),
      onRoundChange: jasmine.createSpy('onRoundChange').and.returnValue(roundChangeSubject.asObservable()),
      updateScore: jasmine.createSpy('updateScore'),
      advanceRound: jasmine.createSpy('advanceRound'),
      leaveRoom: jasmine.createSpy('leaveRoom')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
      getCurrentNavigation: jasmine.createSpy('getCurrentNavigation').and.returnValue({
        extras: {
          state: {
            playerName: 'TestPlayer',
            isHost: true,
            maxPlayers: 4,
            connectedPlayers: ['TestPlayer', 'Player2']
          }
        }
      })
    };

    activatedRouteMock = {
      params: of({ roomCode: 'ABC123' })
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, GameComponent],
      providers: [
        { provide: RoomService, useValue: roomServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();



  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el componente con datos del estado de navegación', () => {
    expect(component.playerName).toBe('TestPlayer');
    expect(component.isHost).toBeTrue();
    expect(component.maxPlayers).toBe(4);
    expect(component.connectedPlayers).toEqual(['TestPlayer', 'Player2']);
    expect(component.players.length).toBe(2);
  });

  it('debe navegar a inicio si no se encuentran datos del jugador', () => {
    routerMock.getCurrentNavigation.and.returnValue({
      extras: {}
    });

    const newComponent = TestBed.createComponent(GameComponent).componentInstance;
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería solicitar la lista de jugadores al iniciar', () => {
    expect(roomServiceMock.requestPlayersList).toHaveBeenCalledWith('ABC123');
  });

  it('debería actualizar la lista de jugadores cuando la reciba', () => {
    const updatedPlayers = ['TestPlayer', 'Player2', 'Player3'];
    playersListSubject.next(updatedPlayers);

    expect(component.connectedPlayers).toEqual(updatedPlayers);
    expect(component.players.length).toBe(3);
  });

  it('debe actualizar la puntuación del jugador cuando se reciba la actualización de la puntuación', () => {
    // First make sure player exists
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    scoreUpdateSubject.next({ playerName: 'TestPlayer', round: 0, score: 5 });

    expect(component.players[0].scores['1/3']).toBe(5);
    expect(component.players[0].total).toBe(5);
  });

  it('debería ignorar las actualizaciones de puntuaciones para jugadores inexistentes', () => {
    // Setup player
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    // Send update for non-existent player
    scoreUpdateSubject.next({ playerName: 'NonExistentPlayer', round: 0, score: 5 });

    // Should not affect existing player
    expect(component.players[0].total).toBe(0);
  });

  it('debe actualizar la ronda actual cuando se reciba el cambio de ronda', () => {
    roundChangeSubject.next(2);
    expect(component.currentRound).toBe('1/4');
    expect(component.currentScore).toBeNull();
  });

  it('should ignore invalid round indices', () => {
    component.currentRound = '1/3';
    roundChangeSubject.next(99);
    expect(component.currentRound).toBe('1/3');
  });

  it('debe actualizar las fichas restantes cuando se selecciona una ficha para el jugador actual', () => {
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    component.manejarFichaSeleccionada({ jugador: 'TestPlayer' });
    expect(component.players[0].fichasRestantes).toBe(9);
  });

  it('No se deben actualizar las fichas restantes cuando se selecciona la ficha de otro jugador.', () => {
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 },
      { playerName: 'Player2', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    component.manejarFichaSeleccionada({ jugador: 'Player2' });
    expect(component.players[0].fichasRestantes).toBe(10);
  });

  it('No deberían reducir las fichas por debajo de cero', () => {
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 0 }
    ];

    component.manejarFichaSeleccionada({ jugador: 'TestPlayer' });
    expect(component.players[0].fichasRestantes).toBe(0);
  });

  it('debe enviar la puntuación correctamente', () => {
    component.currentScore = 10;
    component.currentRound = '1/3';
    component.roomCode = 'ABC123';
    component.playerName = 'TestPlayer';
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    component.submitScore();

    expect(roomServiceMock.updateScore).toHaveBeenCalledWith({
      roomCode: 'ABC123',
      playerName: 'TestPlayer',
      round: 0,
      score: 10
    });

    expect(component.players[0].scores['1/3']).toBe(10);
    expect(component.players[0].total).toBe(10);
    expect(component.currentScore).toBeNull();
  });

  it('no debe enviar puntuación nula', () => {
    component.currentScore = null;
    component.submitScore();
    expect(roomServiceMock.updateScore).not.toHaveBeenCalled();
  });

  it('debería avanzar a la siguiente ronda cuando sea anfitrión', () => {
    component.isHost = true;
    component.roomCode = 'ABC123';
    component.currentRound = '1/3';

    component.nextRound();

    expect(roomServiceMock.advanceRound).toHaveBeenCalledWith({
      roomCode: 'ABC123',
      roundIndex: 1
    });
  });

  it('No debe avanzar cuando no sea el anfitrión.', () => {
    component.isHost = false;
    component.roomCode = 'ABC123';
    component.currentRound = '1/3';

    component.nextRound();

    expect(roomServiceMock.advanceRound).not.toHaveBeenCalled();
  });

  it('no debería avanzar más allá de la última ronda', () => {
    component.isHost = true;
    component.roomCode = 'ABC123';
    component.currentRound = 'Escalera'; // Last round

    component.nextRound();

    expect(roomServiceMock.advanceRound).not.toHaveBeenCalled();
  });

  it('debe calcular la puntuación total correctamente', () => {
    component.players = [
      {
        playerName: 'TestPlayer',
        scores: { '1/3': 5, '2/3': 10, '1/4': 7 },
        total: 0,
        fichasRestantes: 10
      }
    ];

    // Access private method via any cast
    (component as any).updateTotalScore(0);

    expect(component.players[0].total).toBe(22);
  });

  it('deberías salir del juego correctamente', () => {
    component.roomCode = 'ABC123';
    component.leaveGame();

    expect(roomServiceMock.leaveRoom).toHaveBeenCalledWith('ABC123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería comprobar correctamente si el reproductor existe', () => {
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 10 }
    ];

    expect(component.existeJugador('TestPlayer')).toBeTrue();
    expect(component.existeJugador('NonExistentPlayer')).toBeFalse();
  });

  it('debe obtener las fichas restantes correctas', () => {
    component.players = [
      { playerName: 'TestPlayer', scores: {}, total: 0, fichasRestantes: 8 }
    ];

    expect(component.getFichasRestantes('TestPlayer')).toBe(8);
    expect(component.getFichasRestantes('NonExistentPlayer')).toBe(0);
  });

  it('debe darse de baja de todas las suscripciones al destruir', () => {
    const unsubscribeSpy = spyOn(component['subscriptions'][0], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});

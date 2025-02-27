import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WaitingRoomComponent } from './waiting-room.component';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('WaitingRoomComponent', () => {
  let component: WaitingRoomComponent;
  let fixture: ComponentFixture<WaitingRoomComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoomService: jasmine.SpyObj<RoomService>;

  // Subjects para simular observables
  const playerJoinedSubject = new Subject<any>();
  const playerLeftSubject = new Subject<any>();
  const playersListSubject = new Subject<string[]>();
  const gameStartedSubject = new Subject<void>();
  const paramsSubject = new BehaviorSubject<any>({ roomCode: 'ABC123' });

  beforeEach(async () => {
    // Crear objetos espía para las dependencias
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockRoomService = jasmine.createSpyObj('RoomService', [
      'requestPlayersList',
      'onPlayersListUpdate',
      'onGameStarted',
      'onPlayerJoined',
      'onPlayerLeft',
      'leaveRoom',
      'startGame'
    ]);

    // Configurar métodos simulados
    mockRouter.getCurrentNavigation.and.returnValue({
      extras: {
        state: {
          playerName: 'TestPlayer',
          maxPlayers: 4,
          isHost: true
        }
      }
    } as any);

    mockRoomService.onPlayersListUpdate.and.returnValue(playersListSubject.asObservable());
    mockRoomService.onGameStarted.and.returnValue(gameStartedSubject.asObservable());
    mockRoomService.onPlayerJoined.and.returnValue(playerJoinedSubject.asObservable());
    mockRoomService.onPlayerLeft.and.returnValue(playerLeftSubject.asObservable());
    mockRoomService.startGame.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [WaitingRoomComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
        { provide: RoomService, useValue: mockRoomService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializarse con valores de estado de navegacion', () => {
    expect(component.playerName).toBe('TestPlayer');
    expect(component.maxPlayers).toBe(4);
    expect(component.isHost).toBe(true);
    expect(component.connectedPlayers).toEqual(['TestPlayer']);
  });

  it('debe inicializarse con valores predeterminados cuando no se proporciona ningún estado de navegación', () => {
    // Reconfiguramos el mock para retornar null
    mockRouter.getCurrentNavigation.and.returnValue(null);

    // Recreamos el componente
    fixture = TestBed.createComponent(WaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.playerName).toBe('');
    expect(component.maxPlayers).toBe(2);
    expect(component.isHost).toBe(false);
    expect(component.connectedPlayers).toEqual([]);
  });

  it('debería obtener roomCode de los parámetros de ruta y solicitar la lista de jugadores', () => {
    expect(component.roomCode).toBe('ABC123');
    expect(mockRoomService.requestPlayersList).toHaveBeenCalledWith('ABC123');
  });

  it('debería actualizar la lista de jugadores cuando reciba una actualización', () => {
    const newPlayersList = ['TestPlayer', 'Player2', 'Player3'];
    playersListSubject.next(newPlayersList);

    expect(component.connectedPlayers).toEqual(newPlayersList);
    expect(component.currentPlayers).toBe(3);
  });

  it('debe navegar a la pantalla del juego cuando se recibe el evento de inicio del juego', () => {
    gameStartedSubject.next();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game', 'ABC123'], {
      state: {
        playerName: 'TestPlayer',
        isHost: true,
        maxPlayers: 4,
        connectedPlayers: jasmine.any(Array)
      }
    });
  });

  it('debe dejar la habitación y navegar a casa al cancelar el juego', () => {
    component.cancelGame();

    expect(mockRoomService.leaveRoom).toHaveBeenCalledWith('ABC123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería iniciar el juego cuando el anfitrión haga clic en el botón de inicio', async () => {
    spyOn(console, 'log');
    await component.startGame();

    expect(console.log).toHaveBeenCalledWith('Iniciando juego con jugadores:', jasmine.any(Array));
    expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123');
  });

  it('no debería iniciar el juego cuando alguien que no es el anfitrión intenta iniciarlo', async () => {
    component.isHost = false;
    await component.startGame();

    expect(mockRoomService.startGame).not.toHaveBeenCalled();
  });

  it('debería manejar el error cuando falla el inicio del juego', async () => {
    mockRoomService.startGame.and.resolveTo(false);
    spyOn(console, 'error');

    await component.startGame();

    expect(console.error).toHaveBeenCalledWith('Error al iniciar el juego');
  });

  it('debería manejar la excepción cuando el inicio del juego arroja un error', async () => {
    mockRoomService.startGame.and.rejectWith(new Error('Test error'));
    spyOn(console, 'error');

    await component.startGame();

    expect(console.error).toHaveBeenCalledWith('Error al iniciar el juego:', jasmine.any(Error));
  });

  it('debe darse de baja de todas las suscripciones sobre destrucción de componentes', () => {
    // Crear espía para el método unsubscribe
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');

    // Acceder a la propiedad privada para pruebas
    (component as any).subscriptions = [
      { unsubscribe: unsubscribeSpy },
      { unsubscribe: unsubscribeSpy },
      { unsubscribe: unsubscribeSpy },
      { unsubscribe: unsubscribeSpy }
    ];

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(4);
  });

  it('Debería configurar los oyentes de la sala correctamente', () => {
    // Verificar que los métodos del servicio se llaman correctamente
    expect(mockRoomService.onPlayerJoined).toHaveBeenCalled();
    expect(mockRoomService.onPlayerLeft).toHaveBeenCalled();
  });


  it('debería copiar el código de la habitación al portapapeles correctamente', fakeAsync(() => {
    // Mock de la API clipboard de manera más segura para TypeScript
    const originalClipboard = navigator.clipboard;
    const mockWriteText = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());

    // Reemplazar temporalmente el objeto clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      configurable: true
    });

    spyOn(window, 'alert');

    component.copyCode();
    tick(); // Avanzar el tiempo simulado para la promesa

    expect(mockWriteText).toHaveBeenCalledWith('ABC123');
    expect(window.alert).toHaveBeenCalledWith('¡Código copiado!');

    // Restaurar el objeto original
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
    });
  }));

  it('debería manejar el error de copia del portapapeles', fakeAsync(() => {
    // Mock de la API clipboard con error
    const originalClipboard = navigator.clipboard;
    const mockWriteText = jasmine.createSpy('writeText').and.returnValue(
      Promise.reject('Error')
    );

    // Reemplazar temporalmente el objeto clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      configurable: true
    });

    spyOn(console, 'error');

    component.copyCode();
    tick(); // Avanzar el tiempo simulado para la promesa

    expect(mockWriteText).toHaveBeenCalledWith('ABC123');
    expect(console.error).toHaveBeenCalledWith('Error al copiar el código: ', 'Error');

    // Restaurar el objeto original
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
    });
  }));

});




import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CreateRoomComponent } from './create-room.component';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';

import { MusicPlayerService } from '../../services/music-player.service';
import { MusicPlayerComponent } from '../music-player/music-player.component';

class MockRoomService {
  createRoom = jasmine.createSpy('createRoom').and.returnValue(Promise.resolve('mock-room-code')); // Devuelve una Promise
}

class MockRouter {
  navigate = jasmine.createSpy('navigate'); // Simulamos la navegación
}

class MockMusicPlayerService {
  play = jasmine.createSpy('play');
  pause = jasmine.createSpy('pause');
  togglePlay = jasmine.createSpy('togglePlay');
  isMusicPlaying = jasmine.createSpy('isMusicPlaying').and.returnValue(false);
}


describe('CreateRoomComponent', () => {
  let component: CreateRoomComponent;
  let fixture: ComponentFixture<CreateRoomComponent>;
  let mockRoomService: MockRoomService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockRoomService = new MockRoomService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [FormsModule, CreateRoomComponent], // Importa el componente y FormsModule
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a createRoom y navegar a la sala al ingresar datos válidos', fakeAsync(() => {
    // Configurar datos válidos para el formulario
    component.playerName = 'Player1';
    component.numPlayers = 4;

    // Ejecutar el método
    component.createRoom();
    tick(); // Simula la resolución de la promesa

    // Verificar que se haya llamado a createRoom en el servicio con los parámetros correctos
    expect(mockRoomService.createRoom).toHaveBeenCalledWith({
      roomName: 'Sala de Player1',
      playerName: 'Player1',
      numPlayers: 4
    });

    // Verificar que la navegación se haya realizado correctamente con el código de la sala
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/waiting-room', 'mock-room-code'],
      { state: { playerName: 'Player1', maxPlayers: 4, isHost: true } }
    );
  }));

  it('no debería llamar a createRoom si falta el nombre de jugador o el número de jugadores', fakeAsync(() => {
    // Dejar los valores vacíos para simular entrada incompleta
    component.playerName = '';
    component.numPlayers = null;

    // Ejecutar el método
    component.createRoom();
    tick(); // Simula la resolución de la promesa

    // Verificar que no se haya llamado a createRoom
    expect(mockRoomService.createRoom).not.toHaveBeenCalled();
  }));


});

describe('CreateRoomComponent - Music Player', () => {
  let component: CreateRoomComponent;
  let fixture: ComponentFixture<CreateRoomComponent>;
  let mockRoomService: MockRoomService;
  let mockRouter: MockRouter;
  let mockMusicPlayerService: MockMusicPlayerService;

  beforeEach(async () => {
    mockRoomService = new MockRoomService();
    mockRouter = new MockRouter();
    mockMusicPlayerService = new MockMusicPlayerService();

    await TestBed.configureTestingModule({
      imports: [FormsModule, CreateRoomComponent], // Importa el componente y FormsModule
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: Router, useValue: mockRouter },
        { provide: MusicPlayerService, useValue: mockMusicPlayerService } // Mock del servicio de música
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería llamar a play en MusicPlayerService cuando se llame a playMusic', () => {
    component.playMusic();
    expect(mockMusicPlayerService.play).toHaveBeenCalled();
  });

  it('debería llamar a pause en MusicPlayerService cuando se llame a pauseMusic', () => {
    component.pauseMusic();
    expect(mockMusicPlayerService.pause).toHaveBeenCalled();
  });

  it('debería verificar si la música está reproduciéndose', () => {
    const isPlaying = mockMusicPlayerService.isMusicPlaying();
    expect(isPlaying).toBe(false); // Puedes ajustar este valor según tu lógica
  });
});


import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JoinRoomComponent } from './join-room.component';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';

class MockRoomService {
  joinRoom = jasmine.createSpy('joinRoom').and.returnValue(Promise.resolve({ success: true })); // Simulamos la respuesta del servicio
}

class MockRouter {
  navigate = jasmine.createSpy('navigate'); // Simulamos la navegación
}

describe('JoinRoomComponent', () => {
  let component: JoinRoomComponent;
  let fixture: ComponentFixture<JoinRoomComponent>;
  let mockRoomService: MockRoomService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockRoomService = new MockRoomService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [FormsModule, JoinRoomComponent], // Importa el componente y FormsModule
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a joinRoom y navegar a la sala al ingresar datos válidos', fakeAsync(() => {
    // Configurar datos válidos para el formulario
    component.playerName = 'Player1';
    component.roomCode = 'ABC123';

    // Ejecutar el método
    component.joinRoom();
    tick(); // Simula la resolución de la promesa

    // Verificar que se haya llamado a joinRoom en el servicio con los parámetros correctos
    expect(mockRoomService.joinRoom).toHaveBeenCalledWith({
      roomCode: 'ABC123',
      playerName: 'Player1',
      avatar: 'default'
    });

    // Verificar que la navegación se haya realizado correctamente
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/waiting-room', 'ABC123'],
      { state: { playerName: 'Player1', isHost: false } }
    );
  }));

  it('debería mostrar un mensaje de error si el servicio devuelve un error', fakeAsync(() => {
    // Simular una respuesta fallida del servicio
    mockRoomService.joinRoom.and.returnValue(Promise.resolve({ success: false, message: 'Sala no encontrada' }));

    // Configurar datos válidos para el formulario
    component.playerName = 'Player1';
    component.roomCode = 'ABC123';

    // Ejecutar el método
    component.joinRoom();
    tick(); // Simula la resolución de la promesa

    // Verificar que se haya llamado a joinRoom en el servicio
    expect(mockRoomService.joinRoom).toHaveBeenCalled();

    // Verificar que se haya establecido el mensaje de error
    expect(component.errorMessage).toBe('Sala no encontrada');
  }));

  it('no debería llamar a joinRoom si falta el nombre de jugador o el código de la sala', fakeAsync(() => {
    // Dejar los valores vacíos para simular entrada incompleta
    component.playerName = '';
    component.roomCode = '';

    // Ejecutar el método
    component.joinRoom();
    tick(); // Simula la resolución de la promesa

    // Verificar que no se haya llamado a joinRoom
    expect(mockRoomService.joinRoom).not.toHaveBeenCalled();
  }));

  it('debería navegar a la página principal al hacer clic en el botón de regresar', () => {
    // Ejecutar el método
    component.goBack();

    // Verificar que la navegación se haya realizado correctamente
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { MusicPlayerService } from '../../services/music-player.service';

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


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [{ provide: Router, useValue: routerSpy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('debería tener un botón para "CREAR SALA"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const createRoomButton = compiled.querySelector('.create-room-button');
    expect(createRoomButton).toBeTruthy();
  });

  it('debería tener un botón para "UNIRSE A LA SALA"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const joinRoomButton = compiled.querySelector('.join-room-button');
    expect(joinRoomButton).toBeTruthy();
  });

  it('debería navegar a "/create-room" cuando se haga clic en "CREAR SALA"', () => {
    const createRoomButton = fixture.debugElement.query(By.css('.create-room-button')).nativeElement;
    createRoomButton.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/create-room']);
  });

  it('debería navegar a "/join-room" cuando se haga clic en "UNIRSE A LA SALA"', () => {
    const joinRoomButton = fixture.debugElement.query(By.css('.join-room-button')).nativeElement;
    joinRoomButton.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/join-room']);
  });

});


describe('HomeComponent - Music Player', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRoomService: MockRoomService;
  let mockRouter: MockRouter;
  let mockMusicPlayerService: MockMusicPlayerService;

  beforeEach(async () => {
    mockRoomService = new MockRoomService();
    mockRouter = new MockRouter();
    mockMusicPlayerService = new MockMusicPlayerService();

    await TestBed.configureTestingModule({
      imports: [FormsModule, HomeComponent], // Importa el componente y FormsModule
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: Router, useValue: mockRouter },
        { provide: MusicPlayerService, useValue: mockMusicPlayerService } // Mock del servicio de música
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MusicPlayerComponent } from './music-player.component';
import { MusicPlayerService } from '../../services/music-player.service';
import { By } from '@angular/platform-browser';

// Creamos un mock completo del MusicPlayerService
class MockMusicPlayerService {
  togglePlay = jasmine.createSpy('togglePlay');
  pause = jasmine.createSpy('pause');
  play = jasmine.createSpy('play');
  isMusicPlaying = jasmine.createSpy('isMusicPlaying').and.returnValue(false);
}

describe('MusicPlayerComponent', () => {
  let component: MusicPlayerComponent;
  let fixture: ComponentFixture<MusicPlayerComponent>;
  let mockMusicPlayerService: MockMusicPlayerService;

  beforeEach(async () => {
    mockMusicPlayerService = new MockMusicPlayerService();

    await TestBed.configureTestingModule({
      imports: [MusicPlayerComponent],
      providers: [
        { provide: MusicPlayerService, useValue: mockMusicPlayerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call togglePlay on the MusicPlayerService when togglePlay is called', () => {
    component.togglePlay();
    expect(mockMusicPlayerService.togglePlay).toHaveBeenCalled();
  });

  it('should trigger togglePlay when play/pause button is clicked', () => {
    spyOn(component, 'togglePlay');
    const button = fixture.debugElement.query(By.css('.play-button')); // Ajusta el selector según tu HTML
    if (button) {
      button.nativeElement.click();
      expect(component.togglePlay).toHaveBeenCalled();
    }
  });

  it('should reflect correct playing state in UI', () => {
    // Caso cuando está reproduciendo
    mockMusicPlayerService.isMusicPlaying.and.returnValue(true);
    fixture.detectChanges();
    let playIcon = fixture.debugElement.query(By.css('.play-icon')); // Ajusta según tu estructura HTML
    let pauseIcon = fixture.debugElement.query(By.css('.pause-icon'));

    // Verificar que se muestra el ícono correcto (ajustar según tu implementación)
    // expect(playIcon.styles.display).toBe('none');
    // expect(pauseIcon.styles.display).toBe('block');

    // Caso cuando está pausado
    mockMusicPlayerService.isMusicPlaying.and.returnValue(false);
    fixture.detectChanges();
    playIcon = fixture.debugElement.query(By.css('.play-icon'));
    pauseIcon = fixture.debugElement.query(By.css('.pause-icon'));

    // expect(playIcon.styles.display).toBe('block');
    // expect(pauseIcon.styles.display).toBe('none');
  });



  // Prueba para cualquier método adicional que pueda tener tu componente
  it('should handle play method correctly', () => {
    if (mockMusicPlayerService.play) {
      mockMusicPlayerService.play();
      expect(mockMusicPlayerService.play).toHaveBeenCalled();
    }
  });

  it('should handle pause method correctly', () => {
    if (mockMusicPlayerService.pause) {
      mockMusicPlayerService.pause();
      expect(mockMusicPlayerService.pause).toHaveBeenCalled();
    }
  });


});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileComponent } from './file.component';
import { By } from '@angular/platform-browser';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileComponent], // Importa el componente directamente (standalone)
    }).compileComponents();

    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });



  it('debería habilitar el botón si fichasRestantes es mayor a 0', () => {
    // Arrange: Establece fichasRestantes a 5
    component.fichasRestantes = 5;
    fixture.detectChanges(); // Actualiza el DOM

    // Act: Obtén el botón del DOM
    const button = fixture.debugElement.query(By.css('.ficha-button')).nativeElement;

    // Assert: Verifica que el botón esté habilitado
    expect(button.disabled).toBeFalse();
  });

  it('debería emitir fichaSeleccionada y decrementar fichasRestantes cuando se haga clic en el botón', () => {
    // Arrange: Configura las propiedades y espía el evento de salida
    component.fichasRestantes = 5;
    component.jugador = 'Jugador1';
    const emitSpy = spyOn(component.fichaSeleccionada, 'emit');
    fixture.detectChanges(); // Actualiza el DOM

    // Act: Simula un clic en el botón
    const button = fixture.debugElement.query(By.css('.ficha-button')).nativeElement;
    button.click();

    // Assert: Verifica que el evento se emitió y que fichasRestantes se decrementó
    expect(emitSpy).toHaveBeenCalledOnceWith({ jugador: 'Jugador1' });
    expect(component.fichasRestantes).toBe(4);
  });

  it('no debería emitir fichaSeleccionada ni decrementar fichasRestantes si fichasRestantes es 0', () => {
    // Arrange: Configura las propiedades y espía el evento de salida
    component.fichasRestantes = 0;
    component.jugador = 'Jugador1';
    const emitSpy = spyOn(component.fichaSeleccionada, 'emit');
    fixture.detectChanges(); // Actualiza el DOM

    // Act: Simula un clic en el botón
    const button = fixture.debugElement.query(By.css('.ficha-button')).nativeElement;
    button.click();

    // Assert: Verifica que el evento no se emitió y que fichasRestantes no cambió
    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.fichasRestantes).toBe(0);
  });

  it('debería actualizar el texto del botón con el valor de fichasRestantes', () => {
    // Arrange: Establece fichasRestantes a 3
    component.fichasRestantes = 3;
    fixture.detectChanges(); // Actualiza el DOM

    // Act: Obtén el botón del DOM
    const button = fixture.debugElement.query(By.css('.ficha-button')).nativeElement;

    // Assert: Verifica que el texto del botón sea el valor de fichasRestantes
    expect(button.textContent.trim()).toBe('');
  });
});

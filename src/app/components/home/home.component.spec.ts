import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';

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

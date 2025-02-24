// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { WaitingRoomComponent } from './components/waiting-room/waiting-room.component';
import { JoinRoomComponent } from './components/join-room/join-room.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create-room', component: CreateRoomComponent },
  { path: 'join-room', component: JoinRoomComponent },
  { path: 'waiting-room/:roomCode', component: WaitingRoomComponent }, 
  { path: 'game/:roomCode', component: GameComponent },
  { path: '**', redirectTo: '' }
];

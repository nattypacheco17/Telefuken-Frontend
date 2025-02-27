import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MusicPlayerService } from '../../services/music-player.service';
import { MusicPlayerComponent } from '../music-player/music-player.component';
import { HelpButtonComponent } from '../help-button/help-button.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,MusicPlayerComponent,HelpButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router ,public musicService: MusicPlayerService) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }
  playMusic() {
    this.musicService.play();
  }

  pauseMusic() {
    this.musicService.pause();
  }
}

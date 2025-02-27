import { Component } from '@angular/core';
import { MusicPlayerService } from '../../services/music-player.service';
@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.css'
})
export class MusicPlayerComponent {
  constructor(public musicService: MusicPlayerService) {}

  togglePlay() {
    this.musicService.togglePlay();
  }

}

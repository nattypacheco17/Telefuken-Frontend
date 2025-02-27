import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private audio = new Audio();
  private isPlaying = false;

  constructor() {
    this.audio.src = '/assets/music/CancionFondo.mp3'; // Cambia la ruta a tu archivo de audio
    this.audio.load();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  pause(): void {
    this.audio.pause();
    this.isPlaying = false;
  }

  play(): void {
    this.audio.play();
    this.isPlaying = true;
  }

  isMusicPlaying(): boolean {
    return this.isPlaying;
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-help-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-button.component.html',
  styleUrl: './help-button.component.css'
})
export class HelpButtonComponent {
  isModalOpen = false;

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


  // Añade esto en tu archivo main.ts o en el constructor de AppComponent
window.addEventListener('unhandledrejection', event => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('message channel closed before a response was received')) {
    // Evita que el error aparezca en la consola
    event.preventDefault();
    console.debug('Promesa no manejada relacionada con Socket.IO (no crítica)');
  }
});
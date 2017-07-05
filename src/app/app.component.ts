/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import { AppState } from './app.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mcs-app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./app.component.scss')],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public appState: AppState) { }
}

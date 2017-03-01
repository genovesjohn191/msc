/*
 * Angular 2 decorators and services
 */
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AppState } from './app.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mfp-app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./app.component.scss')],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public name = 'Fusion Portal';

  constructor(public appState: AppState) { }

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }
}

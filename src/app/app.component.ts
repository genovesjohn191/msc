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
  styles: [ require('./app.component.scss') ],
  template: `
    <nav>
      <a [routerLink]=" ['./'] " routerLinkActive="active">
        Index
      </a>
      <a [routerLink]=" ['./home'] " routerLinkActive="active">
        Home
      </a>
      <a [routerLink]=" ['./detail'] " routerLinkActive="active">
        Detail
      </a>
      <a [routerLink]=" ['./barrel'] " routerLinkActive="active">
        Barrel
      </a>
      <a [routerLink]=" ['./about'] " routerLinkActive="active">
        About
      </a>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>

    <pre class="app-state">this.appState.state = {{ appState.state | json }}</pre>

    <footer>
      <span>Temprary Footer</span>
    </footer>
  `
})
export class AppComponent implements OnInit {
  public name = 'Fusion Portal';

  constructor(
    public appState: AppState
  ) {}

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

}

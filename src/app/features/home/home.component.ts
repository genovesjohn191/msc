import {
  Component,
  OnInit
} from '@angular/core';
import { Response } from '@angular/http';
import { AppState } from '../../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';
import { HomeService } from './home.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'mcs-home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    Title
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
  // Set our default values
  public localState = { value: '' };
  // public dataFromService;

  // TypeScript public modifiers
  constructor(
    // private homeService: HomeService,
    public appState: AppState,
    public title: Title
  ) {}

  public ngOnInit() {
    console.log('hello `Home` component');
    // this.dataFromService = this.homeService.sayHello().subscribe(r => r as Response );
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }
}

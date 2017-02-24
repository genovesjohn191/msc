import { Component } from '@angular/core';

@Component({
  selector: 'mfp-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [ require('./main-navigation.component.scss')]
})

export class MainNavigationComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Main navigation component';
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'mfp-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [ require('./main-navigation.component.scss')]
})

export class MainNavigationComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Main navigation component';
  }
}

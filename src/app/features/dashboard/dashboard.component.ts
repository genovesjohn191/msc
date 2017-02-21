import { Component } from '@angular/core';

@Component({
  selector: 'mfp-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [ require('./dashboard.component.scss')]
})

export class DashboardComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Dashboard component';
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'mcs-footer',
  templateUrl: './footer.component.html',
  styles: [require('./footer.component.scss')]
})

export class FooterComponent {
  public angularclassLogo: string;
  public name: string;
  public url: string;

  public constructor() {
    this.angularclassLogo = 'assets/img/cloud-services-footer-logo.png';
    this.name = 'Angular 2 Webpack Starter';
    this.url = 'https://twitter.com/AngularClass';
  }
}

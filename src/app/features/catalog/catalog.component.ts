import { Component } from '@angular/core';

@Component({
  selector: 'mfp-catalog',
  templateUrl: './catalog.component.html',
  styles: [ require('./catalog.component.scss')]
})

export class CatalogComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Catalog component';
  }
}

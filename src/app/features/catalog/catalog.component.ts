import { Component } from '@angular/core';

@Component({
  selector: 'mfp-catalog',
  templateUrl: './catalog.component.html',
  styles: [ require('./catalog.component.scss')]
})

export class CatalogComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Catalog component';
  }
}

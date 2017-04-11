import { Component } from '@angular/core';

@Component({
  selector: 'mcs-catalog',
  templateUrl: './catalog.component.html',
  styles: [require('./catalog.component.scss')]
})

export class CatalogComponent {
  public title: string;

  public constructor() {
    this.title = 'Catalog component';
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class HomeService {

  public title: string;
  constructor() {
    this.title = 'Home Component';
  }
}

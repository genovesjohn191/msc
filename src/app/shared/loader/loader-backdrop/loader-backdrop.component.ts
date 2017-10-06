import { Component } from '@angular/core';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'mcs-loader-backdrop',
  templateUrl: './loader-backdrop.component.html',
  styles: [require('./loader-backdrop.component.scss')]
})

export class LoaderBackdropComponent {

  public constructor(private _loaderService: LoaderService) {
  }

  public get fadeOut() {
    return this._loaderService.fadeOut;
  }
}

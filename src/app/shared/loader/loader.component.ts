import { Component } from '@angular/core';
import { CoreDefinition } from '../../core';
import { animateFactory } from '../../utilities';
import { LoaderService } from './loader.service';

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styles: [require('./loader.component.scss')],
  animations: [
    animateFactory({ duration: '300ms', easing: 'ease-in-out' })
  ]
})

export class LoaderComponent {

  public constructor(private _loaderService: LoaderService) {
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public getAnimation() {
    return this._loaderService.animate;
  }
}

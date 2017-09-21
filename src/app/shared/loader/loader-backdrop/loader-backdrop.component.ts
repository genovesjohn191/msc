import { Component } from '@angular/core';
import { LoaderService } from '../loader.service';
import { animateFactory } from '../../../utilities';

@Component({
  selector: 'mcs-loader-backdrop',
  templateUrl: './loader-backdrop.component.html',
  styles: [require('./loader-backdrop.component.scss')],
  animations: [
    animateFactory({ duration: '300ms', easing: 'ease-in-out' })
  ]
})

export class LoaderBackdropComponent {

  public constructor(private _loaderService: LoaderService) {
  }

  public getAnimation() {
    return this._loaderService.animate;
  }
}

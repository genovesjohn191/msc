import { Component } from '@angular/core';
import { CoreDefinition } from '../../core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})

export class LoaderComponent {

  public constructor(private _loaderService: LoaderService) {
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get fadeOut() {
    return this._loaderService.fadeOut;
  }
}

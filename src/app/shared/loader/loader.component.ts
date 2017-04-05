import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { AssetsProvider } from '../../core';

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styles: [require('./loader.component.scss')]
})

export class LoaderComponent implements OnInit {
  public key: string;
  public loaderImage: string;

  public constructor(private _assetsProvider: AssetsProvider) {
    this.key = 'loader';
  }

  public ngOnInit() {
    this.loaderImage = this._assetsProvider.getImagePath(this.key);
  }
}

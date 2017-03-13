import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { AssetsProvider } from '../providers/assets.provider';

@Component({
  selector: 'mcs-header',
  templateUrl: './header.component.html',
  styles: [require('./header.component.scss')]
})

export class HeaderComponent implements OnInit {
  public mcsLogo: string;

  public constructor(private _assetsProvider: AssetsProvider) {
  }

  public ngOnInit() {
    this.mcsLogo = this._assetsProvider.getImagePath('header-logo');
  }
}

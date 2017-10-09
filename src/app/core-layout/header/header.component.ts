import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { McsAssetsProvider } from '../../core';

@Component({
  selector: 'mcs-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  public mcsLogo: string;

  public constructor(private _assetsProvider: McsAssetsProvider) {
  }

  public ngOnInit() {
    this.mcsLogo = this._assetsProvider.getImagePath('header-logo');
  }
}

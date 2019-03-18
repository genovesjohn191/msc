import {
  Component,
  OnInit
} from '@angular/core';
import {
  McsAssetsProvider
} from '@app/core';

@Component({
  selector: 'mcs-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
  public mcsLogo: string;
  public currentDate: Date;

  public constructor(
    private _assetsProvider: McsAssetsProvider
  ) {
    this.mcsLogo = '';
    this.currentDate = new Date();
  }

  public ngOnInit() {
    this.mcsLogo = this._assetsProvider.getImagePath('footer-logo');
  }
}

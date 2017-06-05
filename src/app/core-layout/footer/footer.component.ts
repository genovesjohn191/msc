import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import {
  McsTextContentProvider,
  McsAssetsProvider
} from '../../core';

@Component({
  selector: 'mcs-footer',
  templateUrl: './footer.component.html',
  styles: [require('./footer.component.scss')]
})

export class FooterComponent implements OnInit {
  public mcsLogo: string;
  public copyright: string;
  public links: string;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.mcsLogo = '';
    this.copyright = '';
    this.links = '';
  }

  public ngOnInit() {
    this.mcsLogo = this._assetsProvider.getImagePath('footer-logo');
    this.copyright = this._textContentProvider.content.footer.copyright;
    this.links = this._textContentProvider.content.footer.links;
  }
}

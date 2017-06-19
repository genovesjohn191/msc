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
  public links: any;
  public footerTextContent: any;
  public currentDate: Date;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.mcsLogo = '';
    this.footerTextContent = '';
    this.links = '';
    this.currentDate = new Date();
  }

  public ngOnInit() {
    this.mcsLogo = this._assetsProvider.getImagePath('footer-logo');
    this.footerTextContent = this._textContentProvider.content.footer;
    this.links = this._textContentProvider.content.footer.links;
  }
}

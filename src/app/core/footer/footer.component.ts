import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { AssetsProvider } from '../providers/assets.provider';
import { TextContentProvider } from '../providers/text-content.provider';

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
    private _assetsProvider: AssetsProvider,
    private _textContentProvider: TextContentProvider
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

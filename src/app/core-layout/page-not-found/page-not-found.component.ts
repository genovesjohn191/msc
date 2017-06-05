import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { McsTextContentProvider } from '../../core';

@Component({
  selector: 'mcs-page-not-found',
  templateUrl: './page-not-found.component.html',
  styles: [require('./page-not-found.component.scss')]
})

export class PageNotFoundComponent implements OnInit {
  public heading: string;
  public linkText: string;

  public constructor(private _textProvider: McsTextContentProvider) {
  }

  public ngOnInit() {
    this.heading = this._textProvider.content.pageNotFound.heading;
    this.linkText = this._textProvider.content.pageNotFound.linkText;
  }
}

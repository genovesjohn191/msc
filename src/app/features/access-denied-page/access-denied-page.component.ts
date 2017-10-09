import {
  Component,
  OnInit
} from '@angular/core';

/** Providers */
import { McsTextContentProvider } from '../../core';

@Component({
  selector: 'mcs-permission-required-page',
  templateUrl: './access-denied-page.component.html',
  styleUrls: ['./access-denied-page.component.scss']
})

export class AccessDeniedPageComponent implements OnInit {
  public heading: string;
  public linkText: string;

  public constructor(private _textProvider: McsTextContentProvider) {
  }

  public ngOnInit() {
    this.heading = this._textProvider.content.accessDeniedPage.heading;
    this.linkText = this._textProvider.content.accessDeniedPage.linkText;
  }
}

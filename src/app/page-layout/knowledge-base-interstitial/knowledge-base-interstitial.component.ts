import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { CoreConfig } from '@app/core/core.config';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-interstitial-page',
  templateUrl: 'knowledge-base-interstitial.component.html',
  styleUrls: ['knowledge-base-interstitial.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'interstitial-page-wrapper'
  }
})
export class KnowledgeBaseInterstitialComponent implements OnInit {

  constructor(
    private _coreConfig: CoreConfig
  ) { }

  public get hourglassBlueIconKey(): string {
    return CommonDefinition.ASSETS_SVG_HOURGLASS_BLUE;
  }

  public ngOnInit() {
    let path = (location.pathname + location.search).substr(3);

    setTimeout(() => {
      window.location.href = (this._coreConfig.knowledgeBaseUrl + path);
    }, 2000);
  }
}

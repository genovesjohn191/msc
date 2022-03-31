import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-interstitial-header',
  templateUrl: './interstitial-header.component.html',
  styleUrls: ['./interstitial-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'interstitial-wrapper'
  }
})

export class InterstitialHeaderComponent {

  public get lightLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
  }
}

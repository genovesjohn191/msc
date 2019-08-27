import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'header-wrapper'
  }
})

export class HeaderComponent {

  public get lightLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
  }
}

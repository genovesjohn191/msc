import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-system-message-header',
  templateUrl: './message-header.component.html',
  styleUrls: ['./message-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'system-message-wrapper'
  }
})

export class SystemMessageHeaderComponent {

  public get lightLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
  }
}

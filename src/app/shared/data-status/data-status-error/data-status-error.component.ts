import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-data-status-error',
  templateUrl: './data-status-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-error-wrapper'
  }
})

export class DataStatusErrorComponent {

  // Returns the error icon key
  public get errorIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ERROR;
  }
}

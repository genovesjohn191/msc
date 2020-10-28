import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-contact-us-widget',
  templateUrl: './contact-us-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ContactUsWidgetComponent {
  public get contactPersonIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_PERSON_FAV_BLACK;
  }
}


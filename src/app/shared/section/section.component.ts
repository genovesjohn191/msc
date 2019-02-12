import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import {
  McsOrientationType,
  McsSizeType
} from '@app/utilities';

@Component({
  selector: 'mcs-section, section',
  template: '<ng-content></ng-content>',
  styleUrls: ['./section.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'section-wrapper',
    '[class]': 'hostClasses'
  }
})

export class SectionComponent {
  @Input()
  public orientation: McsOrientationType = 'vertical';

  @Input()
  public spacing: McsSizeType = 'medium';

  /**
   * Returns all the classes of the element with space separated
   */
  public get hostClasses(): string {
    return `section-wrapper`
      + ` section-${this.orientation}`
      + ` ${this.spacing}`;
  }
}

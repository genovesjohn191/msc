import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-select-group',
  templateUrl: './select-group.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'select-group-wrapper'
  }
})

export class SelectGroupComponent {
  @Input()
  public header: string;
}

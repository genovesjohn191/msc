import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { animateFactory } from '@app/utilities';

export type NoteType = 'default' | 'outlined';

@Component({
  selector: 'mcs-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'note-wrapper',
    '[class.outlined]': 'isOutlined ? true : null',
    '[@fadeIn]': '"show"'
  }
})

export class NoteComponent {
  @Input()
  public type: NoteType = 'default';

  public get isOutlined(): boolean {
    return this.type === 'outlined';
  }
}

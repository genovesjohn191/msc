import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { animateFactory } from '@app/utilities';

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
    '[@fadeIn]': '"show"'
  }
})

export class NoteComponent { }

import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
/** Models */
import {
  StatusBoxAttribute,
  StatusBoxType
} from './status-box.model';

@Component({
  selector: 'mcs-status-box',
  templateUrl: './status-box.component.html',
  styles: [require('./status-box.component.scss')],
  animations: [
    trigger('enterLeave', [
      // Enter from right
      state('show', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('* => show', [
        style({ opacity: 0, transform: 'translateX(5%)' }),
        animate('400ms ease-in-out')
      ]),
      state('hide', style({ opacity: 0, transform: 'translateX(-5%)' })),
      transition('show => hide', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})

export class StatusBoxComponent implements OnInit {
  public imageUrl: string;
  public status: string;
  public time: string;
  private _attribute: StatusBoxAttribute;

  public constructor() {
    this.imageUrl = '';
    this.status = '';
  }

  public get attribute(): StatusBoxAttribute {
    return this._attribute;
  }

  @Input()
  public set attribute(value: StatusBoxAttribute) {
    this._attribute = value;
  }

  public ngOnInit() {
    this.imageUrl = '../../../assets/icon/checked.png';
    this.time = '4:00';
    this.status = 'VM deploy complete.';
  }

  public OnClickCloseBtn(): void {
    this.attribute.dialogState = 'hide';
  }
}

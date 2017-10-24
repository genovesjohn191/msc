import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { McsTextContentProvider } from '../../../core';
import { isNullOrEmpty } from '../../../utilities';

@Component({
  selector: 'mcs-account-panel',
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AccountPanelComponent implements OnInit {

  public textContent: any;

  @Output()
  public selectionChanged: EventEmitter<any>;

  constructor(private _textContent: McsTextContentProvider) {
    this.selectionChanged = new EventEmitter();
  }

  public ngOnInit(): void {
    this.textContent = this._textContent.content.accountPanel;
  }

  /**
   * Notify the subscriber for selection changed event
   * @param value Value to notify
   */
  public notifySelectionChange(value: string): void {
    if (isNullOrEmpty(this.selectionChanged)) { return;}
    this.selectionChanged.emit(value);
  }
}

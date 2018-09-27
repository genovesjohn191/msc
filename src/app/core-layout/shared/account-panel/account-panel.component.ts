import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  McsTextContentProvider,
  CoreConfig
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { RouteKey } from '@app/models';

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

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  constructor(
    private _coreConfig: CoreConfig,
    private _textContent: McsTextContentProvider
  ) {
    this.selectionChanged = new EventEmitter();
  }

  public ngOnInit(): void {
    this.textContent = this._textContent.content.accountPanel;
  }

  /**
   * Returns the macview order url
   */
  public get macviewOrdersUrl(): string {
    return this._coreConfig.macviewOrdersUrl;
  }

  /**
   * Returns the macview change password url
   */
  public get macviewChangePasswordUrl(): string {
    return this._coreConfig.macviewChangePasswordUrl;
  }

  /**
   * Notify the subscriber for selection changed event
   * @param value Value to notify
   */
  public notifySelectionChange(value: string): void {
    if (isNullOrEmpty(this.selectionChanged)) { return; }
    this.selectionChanged.emit(value);
  }
}

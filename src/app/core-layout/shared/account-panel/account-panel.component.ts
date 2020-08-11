import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CoreConfig } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsCompany,
  McsIdentity
} from '@app/models';
import { Observable, Subject } from 'rxjs';
import { SwitchAccountService } from '../switch-account/switch-account.service';
import { takeUntil } from 'rxjs/operators';
import { EventBusPropertyListenOn } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-account-panel',
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AccountPanelComponent implements OnInit {
  @EventBusPropertyListenOn(McsEvent.accountChange)
  public activeAccount$: Observable<McsCompany>;
  private _destroySubject = new Subject<void>();

  @Output()
  public selectionChanged: EventEmitter<any>;

  @EventBusPropertyListenOn(McsEvent.userChange)
  public activeUser$: Observable<McsIdentity>;

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  constructor(
    private _coreConfig: CoreConfig,
    private _switchAccountService: SwitchAccountService,
    private _changeDetectorRef: ChangeDetectorRef) {
      this.selectionChanged = new EventEmitter();
  }

  public ngOnInit(): void {
    this._subscribeToSwitchAccount();
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

  private _subscribeToSwitchAccount(): void {
    this._switchAccountService.activeAccountStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}

import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { McsTextContentProvider } from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { OptionsApiService } from '../../../../services';
import { ServerDisasterRecovery } from './server-disaster-recovery';

@Component({
  selector: 'mcs-disaster-recovery-addon',
  templateUrl: './disaster-recovery.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'disaster-recovery-wrapper'
  }
})

export class DisasterRecoveryAddOnComponent implements OnInit, OnDestroy {
  public textContent: any;
  public protectionGroups: string[];
  public disasterRecovery: ServerDisasterRecovery;

  @Output()
  public change: EventEmitter<ServerDisasterRecovery> = new EventEmitter();

  private _protectionGroup: string;
  public get protectionGroup(): string {
    return this._protectionGroup;
  }
  public set protectionGroup(value: string) {
    if (this._protectionGroup !== value) {
      this._protectionGroup = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _protectionGroupSubscription: Subscription;

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _optionsApiService: OptionsApiService
  ) {
    this.protectionGroups = new Array();
    this.disasterRecovery = new ServerDisasterRecovery();
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.shared.disasterRecoveryAddOn;
    this._getDisasterRecoveryGroups();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._protectionGroupSubscription);
  }

  /**
   * This will set the disaster recovery group value
   * and notify change parameter
   */
  public onGroupChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * Get disaster recovery options from the API
   */
  private _getDisasterRecoveryGroups(): void {
    this._protectionGroupSubscription = this._optionsApiService.getDisasterRecoveryOptions()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.protectionGroups = response.content;

        if (!isNullOrEmpty(this.protectionGroups)) {
          this.protectionGroup = this.protectionGroups[0];
        }
      });
  }

  /**
   * Event that emits whenever there are changes in the model
   */
  private _notifyChangeParameter(): void {
    this.disasterRecovery.groupName = this.protectionGroup;
    this.change.emit(this.disasterRecovery);
  }
}

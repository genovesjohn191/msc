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
import { Subscription } from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsOption
} from '../../../../../core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '../../../../../utilities';
import { OptionsApiService } from '../../../../services';
import { ServerDisasterRecovery } from '../../../models';

@Component({
  selector: 'mcs-disaster-recovery',
  templateUrl: './disaster-recovery.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'disaster-recovery-wrapper'
  }
})

export class DisasterRecoveryAddOnComponent implements OnInit, OnDestroy {
  public textContent: any;
  public groups: McsOption[];
  public subscription: Subscription;

  @Output()
  public change: EventEmitter<ServerDisasterRecovery> = new EventEmitter();

  private _disasterRecoveryGroup: string;
  public get disasterRecoveryGroup(): string {
    return this._disasterRecoveryGroup;
  }
  public set disasterRecoveryGroup(value: string) {
    if (this._disasterRecoveryGroup !== value) {
      this._disasterRecoveryGroup = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _optionsApiService: OptionsApiService
  ) {
    this.groups = new Array<McsOption>();
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.shared.disasterRecoveryAddOn;
    this._getDisasterRecoveryGroups();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.subscription);
  }

  /**
   * This will set the disaster recovery group value
   * and notify change parameter
   * @param value Server disaster recovery group
   */
  public onGroupChanged(value: string): void {
    this.disasterRecoveryGroup = value;
    this._notifyChangeParameter();
  }

  /**
   * Get disaster recovery options from the API
   */
  private _getDisasterRecoveryGroups(): void {
    this.subscription = this._optionsApiService.getDisasterRecoveryOptions()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }

        this._setDisasterRecoveryGroups(response.content);
        this._setGroupInitialValue();
      });
  }

  /** Set disaster recovery groups */
  private _setDisasterRecoveryGroups(options: string[]): void {
    if (isNullOrEmpty(options)) { return; }

    options.forEach((option) => {
      this.groups.push(new McsOption(option, option));
    });
  }

  /** Set disaster recovery group initial value */
  private _setGroupInitialValue(): void {
    if (isNullOrEmpty(this.groups)) { return; }

    this.disasterRecoveryGroup = this.groups[0].value;
  }

  /**
   * Event that emits whenever there are changes in the model
   */
  private _notifyChangeParameter(): void {
    let serverDisasterRecovery = new ServerDisasterRecovery();
    serverDisasterRecovery.groupName = this.disasterRecoveryGroup;
    this.change.emit(serverDisasterRecovery);
  }
}

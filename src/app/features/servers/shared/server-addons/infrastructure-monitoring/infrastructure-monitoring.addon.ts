import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { McsTextContentProvider } from '../../../../../core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '../../../../../utilities';
import { OptionsApiService } from '../../../../services';
import { ServerInfrastructure } from '../../../models';

@Component({
  selector: 'mcs-infrastructure-monitoring-addon',
  templateUrl: './infrastructure-monitoring.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'infrastructure-monitoring-wrapper'
  }
})

export class InfrastructureMonitoringAddOnComponent implements OnInit, OnDestroy {
  public textContent: any;
  public serviceLevels: string[];
  public infrastructure: ServerInfrastructure;
  public selectedServiceLevel: string;

  @Output()
  public change: EventEmitter<ServerInfrastructure> = new EventEmitter();

  private _serviceLevelsSubscription: Subscription;

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _optionsApiService: OptionsApiService
  ) {
    this.serviceLevels = new Array();
    this.infrastructure = new ServerInfrastructure();
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.shared.infrastructureMonitoringAddOn;
    this._getInfrastructureServiceLevels();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._serviceLevelsSubscription);
  }

  /**
   * This will set the infrastructure
   * service level value and notify change parameter
   */
  public onServiceLevelChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * Get infrastructure service levels options from the API
   */
  private _getInfrastructureServiceLevels(): void {
    this._serviceLevelsSubscription = this._optionsApiService
      .getInfrastructureServiceLevelOptions()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.serviceLevels = response.content;

        if (!isNullOrEmpty(this.serviceLevels)) {
          this.selectedServiceLevel = this.serviceLevels[0];
        }
      });
  }

  /**
   * Event that emits whenever there are changes in the model
   */
  private _notifyChangeParameter(): void {
    this.infrastructure.serviceLevel = this.selectedServiceLevel;
    this.change.emit(this.infrastructure);
  }
}

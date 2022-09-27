import {
  takeUntil,
  map,
  switchMap,
  catchError
} from 'rxjs/operators';
import {
  Observable,
  Subscription,
  Subject,
  throwError
} from 'rxjs';

import {
  Component,
  forwardRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { McsApiService } from '@app/services';
import {
  HardwareType,
  McsServer,
  McsServersQueryParams
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputServerPanelField } from './input-server-panel';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';

interface ServerProperties {
  name: string;
  managementIpAddress: string;
}

@Component({
  selector: 'mcs-dff-input-server-panel-field',
  templateUrl: './input-server-panel.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputServerPanelComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputServerPanelComponent extends DynamicFieldComponentBase {
  public config: DynamicInputServerPanelField;

  public selectedServer: ServerProperties = {
    name: '',
    managementIpAddress: ''
  };

  public hasMultipleBlades: boolean = false;
  public noBladesFound: boolean = false;

  private _destroySubject: Subject<void> = new Subject<void>();
  private currentServiceCall: Subscription;
  
  private _companyId: string = '';
  private _serviceId: string = '';

  public constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        break;
      case 'service-id-change':
        this._serviceId = params.value;
        this.mapServiceId();
        break;
    }
  }

  public mapServiceId(): void {
    if (this.currentServiceCall) {
      this.currentServiceCall.unsubscribe();
    }

    this.config.value = '';

    this.currentServiceCall = this.callService()
      .pipe(
        takeUntil(this._destroySubject),
        switchMap(() => this.callService()),
        catchError(() => {
          return throwError(`${this.config.key} data retrieval failed.`);
        }))
      .subscribe((response: McsServer[]) => {
        let services = response;
        let serverWithTypeBlade = services?.filter((service) => service.hardware.type === HardwareType.BL);
        let invalidToDeprovisionBlade = isNullOrEmpty(serverWithTypeBlade) ||
        serverWithTypeBlade?.length > 1;

        if (invalidToDeprovisionBlade) {
          this._setErrorMessageToDisplay(serverWithTypeBlade);
          return;
        }

        this.config.value = serverWithTypeBlade[0].id;
        this.selectedServer.name = serverWithTypeBlade[0].name || 'Unknown';
        this.selectedServer.managementIpAddress = serverWithTypeBlade[0].ipAddress || 'Unknown';
        this.valueChange(this.config.value);
      });
  }

  private _setErrorMessageToDisplay(servers: McsServer[]): void {
    if (servers.length === 0) {
      this.noBladesFound = true; 
    } else { 
      this.hasMultipleBlades = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  protected callService(): Observable<McsServer[]> {

    let param = new McsServersQueryParams();
    param.serviceId = this._serviceId;
    param.hardwareType = 'BL';

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getServers(param, optionalHeaders).pipe(
      takeUntil(this._destroySubject),
      map((response) => response && response.collection));
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit
} from '@angular/core';
import {
  forkJoin,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsOption,
  McsOptionGroup,
  McsOrderItemType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  pluck
} from '@app/utilities';
import { ColocationServiceConfig } from '@app/features/orders/colocation-device-restart/colocation-device-restart.component';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectColocationService } from './select-colocation-service';

interface IRackService {
  serviceId: string
  name: string;
  description: string;
  colocationGroup: string;
}

@Component({
  selector: 'mcs-select-colocation-service',
  templateUrl: './select-colocation-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectColocationDeviceComponent extends FormFieldBaseComponent2<IRackService>
  implements IFieldSelectColocationService, OnInit {

  @Input()
  public orderItemType: McsOrderItemType;

  @Input()
  public description: string;

  @Input()
  public config: ColocationServiceConfig;

  @Input()
  public eventLabel: string;

  public colocationGroups: McsOptionGroup[] = [];
  public hasServiceToDisplay: boolean;
  public loadingInProgress: boolean;

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef,
  ) {
    super(_injector);
  }

  public ngOnInit(): void {
    this.loadingInProgress = true;
    this._getColocationServices();
  }

  /**
   * Subscribe to Colocation Racks
   */
  private _getColocationServices(): void {
    forkJoin(
      [this._apiService.getColocationRacks(),
      this._apiService.getColocationAntennas(),
      this._apiService.getColocationCustomDevices(),
      this._apiService.getColocationRooms(),
      this._apiService.getColocationStandardSqms()]
    ).pipe(
      catchError((error) => {
        this.loadingInProgress = false;
        this._changeDetector.markForCheck();
        return throwError(error);
      })
    )
    .subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this._createColocationGroupOptions(response);
      this.hasServiceToDisplay = this.colocationGroups.length > 0;
      this.loadingInProgress = false;
      this._changeDetector.markForCheck();
    });
  }

  private _createColocationGroupOptions(services): void {
    services.forEach((colocationResponseCollection) => {
      let colocationArray : Array<IRackService> = getSafeProperty(colocationResponseCollection, (obj) => obj.collection);
      if (isNullOrEmpty(colocationArray)) { return; }
      let colocationGroupName = pluck(colocationArray, 'colocationGroup').find(_colocation => (!isNullOrUndefined(_colocation)));
      let optionsArray = new Array<McsOption>();
      if (isNullOrEmpty(colocationArray)) { return; }
      colocationArray.forEach((colocationObj) => {
        optionsArray.push(createObject(McsOption, {
          text: colocationObj.serviceId,
          value: colocationObj
        }));
      });
      this.colocationGroups.push(createObject(McsOptionGroup, {
        groupName: colocationGroupName,
        options: optionsArray
      }));
    });
  }
}
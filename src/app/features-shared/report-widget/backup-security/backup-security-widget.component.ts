import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import {
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  takeUntil
} from 'rxjs/operators';

import {
  McsApiCollection,
  McsOrderItemType,
  McsServer,
  OrderIdType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-backup-security-widget',
  templateUrl: './backup-security-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class BackupSecurityWidgetComponent implements OnInit {
  @Input()
    public orderItemTypes: McsOrderItemType[];

  public hasManagedServers: boolean;

  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this._getManagedServers();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get orderIdTypeEnum(): any {
    return OrderIdType;
  }

  public get hostSecurityIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_SECURITY_BLACK;
  }

  public get addAvIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CORONAVIRUS_BLACK;
  }

  public get addHidsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_GPP_MAYBE_BLACK;
  }

  public get backupIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CLOUD_UPLOAD_BLACK;
  }

  public get serverBackupIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_STORAGE_BLACK;
  }

  public get vmBackupIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_PHOTO_LIBRARY_BLACK;
  }

  public getOrderTypeProductId(orderName: string): string {
    if (isNullOrEmpty(this.orderItemTypes)) { return; }
    let orderTypeFound: McsOrderItemType;
    orderTypeFound = this.orderItemTypes.find((order) => order.productOrderType === orderName);
    return orderTypeFound.productId;
  }

  private _getManagedServers(): void {
    this._apiService.getServers().pipe(
      takeUntil(this._destroySubject),
      catchError((error) => {
        return throwError(error);
      }),
      map((response: McsApiCollection<McsServer>) => getSafeProperty(response, (obj) => obj.collection))
    ).subscribe((servers: McsServer[]) => {
      if (servers?.length === 0) { this.hasManagedServers = false }
      let managedServerFound = servers.find((server) => !server.isSelfManaged)
      this.hasManagedServers = !isNullOrEmpty(managedServerFound) ? true : false;
      this._changeDetector.markForCheck();
    })
  }
}

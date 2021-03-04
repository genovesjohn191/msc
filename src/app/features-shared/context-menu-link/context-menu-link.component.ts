import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import {
  McsFeatureFlag,
  RouteKey
} from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-context-menu-link',
  templateUrl: './context-menu-link.component.html',
  styleUrls: ['./context-menu-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContextMenuLinkComponent {
  @Input()
  public get serviceId(): string {
    return this._serviceId;
  }

  public set serviceId(value: string) {
    this._serviceId = value;
  }

  @Input()
  public get serviceChangeAvailable(): boolean {
    return this._serviceChangeAvailable;
  }

  public set serviceChangeAvailable(value: boolean) {
    this._serviceChangeAvailable = value;
  }

  @Input()
  public eventLabel: string;

  @Input()
  public eventCategory: string;

  @Input()
  public hasMenuButton: boolean;

  public _serviceId: string;
  public _serviceChangeAvailable: boolean;

  constructor(
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) {}

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public canRequestCustomChange() {
    const serviceCustomChangeFeatureFlag = this._accessControlService.hasAccessToFeature([McsFeatureFlag.OrderingServiceCustomChange]);

    return this._serviceChangeAvailable &&
          serviceCustomChangeFeatureFlag &&
          this._accessControlService.hasPermission(['OrderEdit']);
  }

  public hasActionsEnabled() {
    let hasRequestChangeAccess = this.canRequestCustomChange();
    let hasTicketCreatePermission = this._accessControlService.hasPermission([
      'TicketCreate'
    ]);
    return hasRequestChangeAccess || hasTicketCreatePermission;
  }

  public onRequestCustomChange(): void {
    return this._navigationService.navigateTo(
        RouteKey.OrderServiceCustomChange, [], { queryParams: { serviceId: this._serviceId}});
  }

  public onRaiseTicket(): void {
    return this._navigationService.navigateTo(
      RouteKey.TicketCreate, [], { queryParams: { serviceId: this._serviceId}});
  }
}
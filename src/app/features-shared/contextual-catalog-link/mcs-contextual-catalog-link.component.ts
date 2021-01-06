import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';

@Component({
  selector: 'mcs-contextual-catalog-link',
  templateUrl: './mcs-contextual-catalog-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ContextualCatalogLinkComponent {
  @Input()
  public eventLabel: string;

  @Input()
  public get orderProductId(): string {
    return this._orderProductId;
  }

  public set orderProductId(value: string) {
    if (value === this.invalidOrderProductId) { return; }
    this._orderProductId = value;
  }

  private readonly invalidOrderProductId: string = '00000000-0000-0000-0000-000000000000';
  public _orderProductId: string;

  constructor() {}

  public get productCatalogLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.CatalogProduct) + `/${this._orderProductId}`;
  }
}
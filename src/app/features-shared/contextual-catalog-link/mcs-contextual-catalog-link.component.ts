import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-contextual-catalog-link',
  templateUrl: './mcs-contextual-catalog-link.component.html',
  styleUrls: ['./mcs-contextual-catalog-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContextualCatalogLinkComponent {
  @Input()
  public isIcon: boolean;

  @Input()
  public get orderProductId(): string {
    return this._orderProductId;
  }

  public set orderProductId(value: string) {
    if (value === this.invalidOrderProductId) { return; }
    this._orderProductId = value;
  }

  @Input()
  public get eventLabel(): string {
    return this._eventLabel;
  }

  public set eventLabel(value: string) {
    if (isNullOrEmpty(value)) { return; }
    let eventLabelReplacedSpace = value.split(' ').join('-');
    this._eventLabel = eventLabelReplacedSpace.toLowerCase();
  }

  private readonly invalidOrderProductId: string = '00000000-0000-0000-0000-000000000000';
  public _orderProductId: string;
  public _eventLabel: string;

  constructor() {}

  public get productCatalogLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.CatalogProduct) + `/${this._orderProductId}`;
  }
}
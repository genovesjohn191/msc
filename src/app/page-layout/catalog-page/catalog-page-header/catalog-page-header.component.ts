import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-catalog-page-header',
  templateUrl: './catalog-page-header.component.html',
  styleUrls: ['./catalog-page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'catalog-page-header-wrapper'
  }
})
export class CatalogPageHeaderComponent {

  constructor(
    private _eventDispatcher: EventBusDispatcherService
  ) {
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV_BLUE;
  }

  public get lightLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
  }

  public toggleNav(): void {
    this._eventDispatcher.dispatch(McsEvent.navToggle);
  }
}

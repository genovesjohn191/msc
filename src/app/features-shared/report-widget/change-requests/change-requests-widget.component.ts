import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-change-requests-widget',
  templateUrl: './change-requests-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ChangeRequestWidgetComponent {
  public get azureServiceRequestIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_CONFIG_BLACK ;
  }

  public get changeLicenseCountIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_NEW_BLACK  ;
  }

  public get changeDnsZoneIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_BLACK  ;
  }

  public get azureServiceRequestLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }

  public get changeLicenseCountLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsLicenseCountChange);
  }

  public get changeManagedDnsLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderHostedDnsChange);
  }
}

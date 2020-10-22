import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';

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

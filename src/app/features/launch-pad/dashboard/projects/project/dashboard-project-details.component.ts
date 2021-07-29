import {
  ChangeDetectionStrategy,
  Component,
  Injector
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import { McsObjectProject } from '@app/models';
import {
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { DashboardProjectService } from './dashboard-project.service';

@Component({
  selector: 'mcs-dashboard-project-details',
  templateUrl: './dashboard-project-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProjectDetailsComponent {
  public dashboardProject$: Observable<McsObjectProject>;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _dashboardProjectService: DashboardProjectService,
  ) {
    this._subscribeToDashboardProjectResolve();
  }

  private _subscribeToDashboardProjectResolve(): void {
    this.dashboardProject$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.dashboardProject)),
      tap((dashboardProject) => {
        if (isNullOrEmpty(dashboardProject)) { return; }

        this._dashboardProjectService.setDashboardProjectDetails(dashboardProject);
      }),
      shareReplay(1)
    );
  }
}

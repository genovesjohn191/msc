import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { McsTerraformDeployment } from '@app/models';
import { getSafeProperty, isNullOrEmpty } from '@app/utilities';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'mcs-azure-deployment',
  templateUrl: './azure-deployment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentComponent implements OnInit {
  public deployment$: Observable<McsTerraformDeployment>;

  public constructor(private _activatedRoute: ActivatedRoute) {}

  public ngOnInit(): void {
    this._subscribeToResolve();
  }

  private _subscribeToResolve(): void {
    this.deployment$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        return getSafeProperty(resolver, (obj) => obj.deployment);
      }));
  }
}
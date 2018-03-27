import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subscription,
  Observable
} from 'rxjs';
import {  } from 'rxjs/operators/catch';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  McsApiJob,
  CoreDefinition,
  McsJobType,
  McsHttpStatusCode,
  McsDataStatusFactory
} from '../../../../core';
import { FeaturesService } from '../../../features.service';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';

@Component({
  selector: 'mcs-create-server-details',
  templateUrl: 'create-server-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateServerDetailsComponent implements OnInit, OnDestroy {

  public textContent: any;
  public contextualTextContent: any;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives;

  // Job variables
  public job: McsApiJob;
  public jobSubscription: Subscription;
  public dataStatusFactory: McsDataStatusFactory<McsApiJob>;

  private _notificationsSubscription: Subscription;

  public get statusIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _textContentProvider: McsTextContentProvider,
    private _featuresService: FeaturesService,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers
      .createServer.createServerDetails;
    this.contextualTextContent = this.textContent;
    this._getJobById();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.jobSubscription);
    unsubscribeSafely(this._notificationsSubscription);
  }

  /**
   * Get Job based on the given ID in the provided parameter
   */
  private _getJobById(): void {
    this.dataStatusFactory.setInProgress();
    this.jobSubscription = this._activatedRoute.paramMap
      .switchMap((params: ParamMap) => {
        let jobId = params.get('id');
        return this._featuresService.getJob(jobId);
      })
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.job = response.content;
        this._validateJobType(this.job);
        this.dataStatusFactory.setSuccesfull(response);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Validate job type and return the error page in case
   * the job type is non-create server
   */
  private _validateJobType(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let createServerType = job.type === McsJobType.CreateServer
      || job.type === McsJobType.CloneServer;
    if (!createServerType) {
      this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.NotFound);
    }
  }
}

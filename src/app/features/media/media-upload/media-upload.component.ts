import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  CoreDefinition,
  McsWizardBase,
  IMcsNavigateAwayGuard
} from '@app/core';
import {
  unsubscribeSubject,
  getSafeProperty
} from '@app/utilities';
import { MediaUploadDetailsComponent } from './details/media-upload-details.component';
import { MediaUploadService } from './media-upload.service';

@Component({
  selector: 'mcs-media-upload',
  templateUrl: 'media-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaUploadComponent extends McsWizardBase
  implements OnDestroy, IMcsNavigateAwayGuard {

  private _destroySubject = new Subject<void>();

  @ViewChild(MediaUploadDetailsComponent)
  private _detailsStep: MediaUploadDetailsComponent;

  constructor(_mediaUploadService: MediaUploadService) {
    super(_mediaUploadService);
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Event that emits when navigating away from media upload page to other route
   */
  public canNavigateAway(): boolean {
    return this.getActiveWizardStep().isLastStep ||
      getSafeProperty(this._detailsStep, (obj) => obj.canNavigateAway(), true);
  }
}

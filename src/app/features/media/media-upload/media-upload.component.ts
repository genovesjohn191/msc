import { Subject } from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  IMcsNavigateAwayGuard,
  McsWizardBase
} from '@app/core';
import {
  getSafeProperty,
  unsubscribeSafely,
  CommonDefinition
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
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public canNavigateAway(): boolean {
    return this.getActiveWizardStep().isLastStep ||
      getSafeProperty(this._detailsStep, (obj) => obj.canNavigateAway(), true);
  }
}

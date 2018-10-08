import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  CoreDefinition,
  McsTextContentProvider,
  CoreRoutes
} from '@app/core';
import { unsubscribeSubject } from '@app/utilities';
import { RouteKey } from '@app/models';

@Component({
  selector: 'mcs-media-upload',
  templateUrl: 'media-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaUploadComponent implements OnInit, OnDestroy {
  public textContent: any;
  private _destroySubject = new Subject<void>();

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload;
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Navigates to media listing
   */
  public navigateToMedia(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Media)]);
  }
}

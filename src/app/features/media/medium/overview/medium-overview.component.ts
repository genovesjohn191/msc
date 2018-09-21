import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { McsTextContentProvider } from '@app/core';
import { MediumService } from '../medium.service';
import { MediumDetailsBase } from '../medium-details.base';

@Component({
  selector: 'mcs-medium-overview',
  templateUrl: './medium-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumOverviewComponent extends MediumDetailsBase implements OnInit, OnDestroy {
  public textContent: any;

  constructor(
    _mediumService: MediumService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
  ) {
    super(_mediumService);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.media.medium.overview;
    super.initializeBase();
  }

  public ngOnDestroy() {
    super.destroyBase();
  }

  /**
   * Event that will automatically invoked when the medium selection has been changed
   */
  protected mediumSelectionChange(): void {
    this._changeDetectorRef.markForCheck();
  }
}

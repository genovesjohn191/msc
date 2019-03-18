import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { MediumService } from '../medium.service';
import { MediumDetailsBase } from '../medium-details.base';

@Component({
  selector: 'mcs-medium-overview',
  templateUrl: './medium-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumOverviewComponent extends MediumDetailsBase implements OnInit, OnDestroy {

  constructor(
    _mediumService: MediumService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_mediumService);
  }

  public ngOnInit() {
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

import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsPageBase } from '@app/core';
import {
  MCS_SIDESHEET_DATA,
  SideSheetAction,
  SideSheetRef,
  SideSheetResult
} from '@app/shared/side-sheet';

import { FeedbackSheetConfig } from './feedback-sheet.config';
import { FeedbackSheetViewModel } from './feedback-sheet.viewmodel';

@Component({
  selector: 'mcs-feedback-sheet',
  templateUrl: './feedback-sheet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackSheetComponent extends McsPageBase implements OnInit, OnDestroy {

  public readonly viewModel: FeedbackSheetViewModel;

  constructor(
    injector: Injector,
    private _sidesheetRef: SideSheetRef<FeedbackSheetComponent>,
    @Inject(MCS_SIDESHEET_DATA) private _config: FeedbackSheetConfig
  ) {
    super(injector);
    this.viewModel = new FeedbackSheetViewModel(injector);
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public onCancelFeedback(): void {
    this._sidesheetRef?.close();
  }

  public onSubmitFeedback(): void {
    let sideSheetResult = new SideSheetResult();
    sideSheetResult.data = true;
    sideSheetResult.action = SideSheetAction.Confirm;

    this._sidesheetRef.close(sideSheetResult);
  }
}

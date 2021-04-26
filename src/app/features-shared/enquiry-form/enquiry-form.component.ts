import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { McsFormGroupDirective } from '@app/shared';

import { EnquiryformViewModel } from './enquiry-form.viewmodel';

@Component({
  selector: 'mcs-enquiry-form',
  templateUrl: './enquiry-form.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-enquiry-form'
  }
})
export class EnquiryFormComponent implements OnInit {
  public viewModel = new EnquiryformViewModel();

  @Output()
  public submitted = new EventEmitter<EnquiryformViewModel>();

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  constructor() { }

  public ngOnInit(): void { }

  public onClickSubmit(): void {
    this._formGroup.validateFormControls(true);
    if (!this._formGroup.isValid()) { return; }

    this.submitted.next(this.viewModel);
  }
}

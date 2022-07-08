import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';

export class EnquiryformViewModel {
  public readonly fgEnquiry: FormGroup<any>;
  public readonly fcNote: FormControl<any>;
  public readonly fcContact: FormControl<any>;

  constructor() {
    this.fcNote = new FormControl<any>('');
    this.fcContact = new FormControl<any>('', [CoreValidators.required]);

    this.fgEnquiry = new FormGroup<any>({
      note: this.fcNote,
      contact: this.fcContact
    });
  }
}

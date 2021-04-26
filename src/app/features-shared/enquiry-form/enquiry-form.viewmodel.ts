import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';

export class EnquiryformViewModel {
  public readonly fgEnquiry: FormGroup;
  public readonly fcNote: FormControl;
  public readonly fcContact: FormControl;

  constructor() {
    this.fcNote = new FormControl('');
    this.fcContact = new FormControl('', [CoreValidators.required]);

    this.fgEnquiry = new FormGroup({
      note: this.fcNote,
      contact: this.fcContact
    });
  }
}

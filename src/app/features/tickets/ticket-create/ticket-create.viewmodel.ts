import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';

export class TicketCreateViewModel {
  public fgCreateTicket: FormGroup;
  public fcType: FormControl;
  public fcReference: FormControl;
  public fcSummary: FormControl;
  public fcDetails: FormControl;
  public fcService: FormControl;
  public fcAzureResource: FormControl;

  constructor() {
    this.fcType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcReference = new FormControl('', []);

    this.fcSummary = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcDetails = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcService = new FormControl([], []);
    this.fcAzureResource = new FormControl([], []);

    // Register Form Groups using binding
    this.fgCreateTicket = new FormGroup({
      fcType: this.fcType,
      fcReference: this.fcReference,
      fcSummary: this.fcSummary,
      fcDetails: this.fcDetails,
      fcService: this.fcService,
      fcAzureResource: this.fcAzureResource
    });
  }


}

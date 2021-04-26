import {
  of,
  Observable
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  Contact,
  McsOption
} from '@app/models';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectContact } from './field-select-contact';

@Component({
  selector: 'mcs-field-select-contact',
  templateUrl: './field-select-contact.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-select-contact'
  }
})
export class FieldSelectContactComponent
  extends FormFieldBaseComponent2<Contact>
  implements IFieldSelectContact, OnInit, OnDestroy {

  public optionItems$: Observable<McsOption[]>;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
    this._subscribeToContacts();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _subscribeToContacts(): void {
    let optionItems = new Array<McsOption>();
    if (this.includeNone) {
      optionItems.push(new McsOption(Contact.None, this.translate.instant('label.none')));
    }

    optionItems.push(new McsOption(Contact.Phone, this.translate.instant('label.phone')));
    optionItems.push(new McsOption(Contact.Email, this.translate.instant('label.email')));
    this.optionItems$ = of(optionItems);
  }
}
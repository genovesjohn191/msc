import { Directive } from '@angular/core';

@Directive({
  selector: 'button[mcsButton], a[mcsButton]',
  host: {
    'class': 'button-wrapper'
  }
})
export class ButtonDirective { }

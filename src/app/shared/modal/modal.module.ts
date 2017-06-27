import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Components/Directives */
import { ModalComponent } from './modal.component';
import { ModalBackdropComponent } from './modal-backdrop/modal-backdrop.component';
import { ModalDirective } from './modal.directive';

@NgModule({
  declarations: [
    ModalComponent,
    ModalBackdropComponent,
    ModalDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModalDirective
  ],
  entryComponents: [
    ModalComponent,
    ModalBackdropComponent
  ]
})

export class ModalModule { }

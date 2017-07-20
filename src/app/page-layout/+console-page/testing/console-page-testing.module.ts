import { NgModule } from '@angular/core';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';
/** Services */
import { ConsolePageService } from '../console-page.service';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    ConsolePageService
  ],
})

export class ConsolePageTestingModule { }

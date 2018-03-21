import { NgModule } from '@angular/core';
/** Providers */
import { ConsolePageService } from '../console-page.service';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    ConsolePageService
  ],
})

export class ConsolePageTestingModule { }

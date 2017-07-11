import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Components */
import { NetworkingComponent } from './networking.component';
/** Services */
import { NetworkingService } from './networking.service';

@NgModule({
  declarations: [
    NetworkingComponent,
  ],
  imports: [
    CommonModule
  ],
  providers: [
    NetworkingService
  ]
})

export class NetworkingModule { }

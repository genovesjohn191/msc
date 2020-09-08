import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { demoRoutes } from './demo.constants';
import { DemoComponent } from './demo.component';
import { DemoService } from './demo.service';
import { DynamicFormModule } from '@app/features-shared/dynamic-form';

@NgModule({
  declarations: [
    DemoComponent
  ],
  imports: [
    SharedModule,
    DynamicFormModule,
    RouterModule.forChild(demoRoutes)
  ],
  providers: [
    DynamicFormModule,
    DemoService
  ]
})

export class DemoModule { }

import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';

import { DirectivesModule } from '../directives/directives.module';
import { SideSheetComponent } from './sidesheet.component';
import { SideSheetDirective } from './sidesheet.directive';
import { SideSheetService } from './sidesheet.service';

const exportedComponents = [
  SideSheetComponent,
  SideSheetDirective
];

@NgModule({
  declarations: exportedComponents,
  imports: [
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    OverlayModule,

    DirectivesModule
  ],
  exports: exportedComponents,
  providers: [
    SideSheetService
  ]
})
export class SideSheetModule { }

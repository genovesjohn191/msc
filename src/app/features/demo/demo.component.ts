import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import { DemoService } from './demo.service';
import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form/dynamic-form-field-data.base';

@Component({
  selector: 'mcs-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DemoComponent {
  data$: Observable<DynamicFormFieldDataBase[]>;

  constructor(service: DemoService) {
    this.data$ = service.getData();
  }
}

import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-default-page',
  templateUrl: './default-page.component.html',
  styleUrls: ['./default-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DefaultPageComponent { }

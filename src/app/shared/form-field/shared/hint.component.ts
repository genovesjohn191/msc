import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2
} from '@angular/core';
import { McsUniqueId } from '@app/core';

@Component({
  selector: 'mcs-hint',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'hint-wrapper',
    '[attr.id]': 'id'
  }
})

export class HintComponent implements OnInit {
  @Input()
  public id: string = McsUniqueId.NewId('hint-item');

  @Input()
  public align: 'start' | 'end';

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this.align = 'start';
  }

  public ngOnInit(): void {
    this._renderer.addClass(this._elementRef.nativeElement, this.align);
  }
}

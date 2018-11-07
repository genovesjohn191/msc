import {
  Component,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
  selector: `a[mcsButtonIcon], a[mcsButtonRaised], a[mcsButton]`,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'button-wrapper',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '[class.primary]': 'color === "primary"',
    '[class.raised]': 'type === "raised"',
    '[class.basic]': 'type === "basic"',
    '[class.label-placement-left]': 'labelPlacement === "left"',
    '[class.label-placement-center]': 'labelPlacement === "center"',
    '[class.label-placement-right]': 'labelPlacement === "right"',
    '[class.button-disabled]': 'disabled'
  }
})

export class ButtonLinkComponent extends ButtonComponent {

  constructor(
    _renderer: Renderer2,
    _elementRef: ElementRef,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_renderer, _elementRef, _changeDetectorRef);
  }
}

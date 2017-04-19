import {
  Directive,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[mcsFlat]'
})

export class FlatDirective implements OnInit {
  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef) {
  }

  public ngOnInit() {
    this._renderer.setStyle(this._element.nativeElement, 'border-radius', '0');
    this._renderer.setStyle(this._element.nativeElement, 'color', 'red');
  }
}

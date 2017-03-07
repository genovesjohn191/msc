import {
  Directive,
  Renderer,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[mcsFlat]'
})

export class FlatDirective implements OnInit {
  constructor(
    private _renderer: Renderer,
    private _element: ElementRef) {
  }

  public ngOnInit() {
    this._renderer.setElementStyle(this._element.nativeElement, 'border-radius', '0');
    this._renderer.setElementStyle(this._element.nativeElement, 'color', 'red');
  }
}

import {
  Directive,
  Renderer,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[mcsRed]'
})

export class RedDirective implements OnInit {
  constructor(
    private _renderer: Renderer,
    private _element: ElementRef) {
  }

  public ngOnInit() {
    this._renderer.setElementStyle(this._element.nativeElement, 'backgroundColor', 'red');
    this._renderer.setElementStyle(this._element.nativeElement, 'color', 'white');
  }
}

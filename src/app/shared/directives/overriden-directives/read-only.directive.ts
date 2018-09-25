import {
  Directive,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[read-only]'
})

export class ReadOnlyDirective implements OnInit {

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) { }

  public ngOnInit() {
    // Set the read-only class to the host element
    this._renderer.addClass(this._elementRef.nativeElement, `read-only`);
  }
}

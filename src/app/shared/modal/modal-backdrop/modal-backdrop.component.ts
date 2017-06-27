import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  HostBinding
} from '@angular/core';

@Component({
  selector: 'mcs-modal-backdrop',
  template: ''
})

export class ModalBackdropComponent implements OnInit, AfterViewInit {
  @HostBinding('class')
  public classes: string;

  private _bodyElement: HTMLBodyElement;

  public constructor(private _elementRef: ElementRef) { }

  public ngOnInit() {
    this._setHostBinding();
    this._setBodyElement();
  }

  public ngAfterViewInit() {
    // This is needed to append the backdrop outside the impementation modal
    // and append inside the body element
    if (this._bodyElement) {
      this._bodyElement.appendChild(this._elementRef.nativeElement);
    }
  }

  public removeComponent(): void {
    if (!this._elementRef || !this._bodyElement) { return; }
    this._bodyElement.removeChild(this._elementRef.nativeElement);
  }

  private _setHostBinding(): void {
    this.classes = 'modal-backdrop fade show';
  }

  private _setBodyElement(): void {
    this._bodyElement = window.document.querySelector('body');
  }
}

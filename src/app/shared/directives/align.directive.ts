import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsBrowserService,
  McsUniqueId
} from '@app/core';
import {
  McsAlignmentType,
  isNullOrEmpty
} from '@app/utilities';

@Directive({
  selector: '[mcsAlign]',
})

export class AlignDirective implements AfterViewInit {
  @Input('mcsAlign')
  public alignment: McsAlignmentType = 'start';

  private _startSpacerElement: HTMLElement;
  private _endSpacerElement: HTMLElement;
  private _destroySubject = new Subject<void>();
  private _alignmentTable = new Map<McsAlignmentType, () => void>();

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService
  ) { }

  public ngAfterViewInit() {
    this._createAlignmentTable();
    this._subscribeToBreakpointChanges();
  }

  /**
   * Returns the host element
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Creates the spacer element
   */
  private _createSpacerElements(): void {
    if (!isNullOrEmpty(this._startSpacerElement)) { return; }
    let spacerElement = document.createElement('div');
    this._renderer.setStyle(spacerElement, 'flex-grow', '1');
    this._renderer.setStyle(spacerElement, 'visibility', 'hidden');

    this._startSpacerElement = spacerElement.cloneNode() as HTMLElement;
    this._renderer.setAttribute(this._startSpacerElement, 'id', McsUniqueId.NewId('spacer'));

    this._endSpacerElement = spacerElement.cloneNode() as HTMLElement;
    this._renderer.setAttribute(this._endSpacerElement, 'id', McsUniqueId.NewId('spacer'));
  }

  /**
   * Attach the spacer element into position
   */
  private _attachSpacerElementIntoPosition(): void {
    // Invoke alignment
    let attachSpacer = this._alignmentTable.get(this.alignment);
    if (!isNullOrEmpty(attachSpacer)) {
      attachSpacer();
    }
  }

  /**
   * Aligns the element into start position
   */
  private _alignStart(): void {
    if (isNullOrEmpty(this._startSpacerElement)) { return; }
    this._renderer.insertBefore(
      this.hostElement.parentElement, this._startSpacerElement, this.hostElement.nextSibling
    );
  }

  /**
   * Aligns the element into center position
   */
  private _alignCenter(): void {
    if (isNullOrEmpty(this._startSpacerElement)) { return; }
    this._renderer.insertBefore(
      this.hostElement.parentElement, this._startSpacerElement, this.hostElement.nextSibling
    );
    this._renderer.insertBefore(
      this.hostElement.parentElement, this._endSpacerElement, this.hostElement
    );
  }

  /**
   * Aligns the element into end position
   */
  private _alignEnd(): void {
    if (isNullOrEmpty(this._endSpacerElement)) { return; }
    this._renderer.insertBefore(
      this.hostElement.parentElement, this._startSpacerElement, this.hostElement
    );
  }

  /**
   * Creates the alignment table
   */
  private _createAlignmentTable(): void {
    this._alignmentTable.set('start', this._alignStart.bind(this));
    this._alignmentTable.set('center', this._alignCenter.bind(this));
    this._alignmentTable.set('end', this._alignEnd.bind(this));
  }

  /**
   * Subscribes to breakpoint changes to update the layout of the host element accordingly
   */
  private _subscribeToBreakpointChanges(): void {
    this._browserService.breakpointChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      Promise.resolve().then(() => {
        this._createSpacerElements();
        this._attachSpacerElementIntoPosition();
      });
    });
  }
}

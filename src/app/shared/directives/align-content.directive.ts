import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';

import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { McsBrowserService } from '@app/core';
import {
  getElementStyle,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

enum Direction {
  Others = 0,
  Horizontal = 1,
  Vertical = 2
}

enum Alignment {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleCenter = 'middle-center',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right'
}

type AlignmentDetails = {
  alignItems,
  justifyContent
};

@Directive({
  selector: '[mcsAlignContent]',
})

export class AlignContentDirective implements OnChanges, AfterContentInit, OnDestroy {
  @Input('mcsAlignContent')
  public alignment: string;

  private _layoutRequestChange = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _horizontalAlignmentTable = new Map<Alignment, AlignmentDetails>();
  private _verticalAlignmentTable = new Map<Alignment, AlignmentDetails>();

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService
  ) {
    this._createHorizontalAlignTable();
    this._createVerticalAlignTable();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let alignmentChange = changes['alignment'];
    if (!isNullOrEmpty(alignmentChange)) {
      this._validateAlignment();
      this._updateContainerLayout();
    }
  }

  public ngAfterContentInit(): void {
    Promise.resolve().then(() => {
      this._subscribeToLayoutRequest();
      this._subscribeToBreakpointChanges();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._layoutRequestChange);
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the host element instance
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Returns the flex axis direction based on the property
   */
  public get containerDirection(): Direction {
    return getElementStyle(this.hostElement, 'flexDirection') === 'column' ?
      Direction.Vertical : Direction.Horizontal;
  }

  /**
   * Returns the actual container alignment
   */
  public get containerAlignment(): Alignment {
    return this.alignment as Alignment || Alignment.TopLeft;
  }

  /**
   * Validates the host alignment and throw error if the host element is not a flex
   */
  private _validateAlignment(): void {
    if (isNullOrEmpty(this.alignment as Alignment)) {
      throw new Error('The alignment type was not registered.');
    }
  }

  /**
   * Updates the container layout based on the direction and alignment settings
   */
  private _updateContainerLayout(): void {
    Promise.resolve().then(() => {
      let alignDetails = this.containerDirection === Direction.Horizontal ?
        this._horizontalAlignmentTable.get(this.containerAlignment) :
        this._verticalAlignmentTable.get(this.containerAlignment);

      if (isNullOrEmpty(alignDetails)) { return; }
      this._renderer.setStyle(this.hostElement, 'alignItems', alignDetails.alignItems);
      this._renderer.setStyle(this.hostElement, 'justifyContent', alignDetails.justifyContent);
    });
  }

  /**
   * Creates the horizontal alignment table
   */
  private _createHorizontalAlignTable(): void {
    this._horizontalAlignmentTable.set(Alignment.TopLeft,
      { alignItems: 'flex-start', justifyContent: 'flex-start' });
    this._horizontalAlignmentTable.set(Alignment.TopCenter,
      { alignItems: 'flex-start', justifyContent: 'center' });
    this._horizontalAlignmentTable.set(Alignment.TopRight,
      { alignItems: 'flex-start', justifyContent: 'flex-end' });

    this._horizontalAlignmentTable.set(Alignment.MiddleLeft,
      { alignItems: 'center', justifyContent: 'flex-start' });
    this._horizontalAlignmentTable.set(Alignment.MiddleCenter,
      { alignItems: 'center', justifyContent: 'center' });
    this._horizontalAlignmentTable.set(Alignment.MiddleRight,
      { alignItems: 'center', justifyContent: 'flex-end' });

    this._horizontalAlignmentTable.set(Alignment.BottomLeft,
      { alignItems: 'flex-end', justifyContent: 'flex-start' });
    this._horizontalAlignmentTable.set(Alignment.BottomCenter,
      { alignItems: 'flex-end', justifyContent: 'center' });
    this._horizontalAlignmentTable.set(Alignment.BottomRight,
      { alignItems: 'flex-end', justifyContent: 'flex-end' });
  }

  /**
   * Creates the vertical alingment table
   */
  private _createVerticalAlignTable(): void {
    this._verticalAlignmentTable.set(Alignment.TopLeft,
      { alignItems: 'flex-start', justifyContent: 'flex-start' });
    this._verticalAlignmentTable.set(Alignment.TopCenter,
      { alignItems: 'center', justifyContent: 'flex-start' });
    this._verticalAlignmentTable.set(Alignment.TopRight,
      { alignItems: 'flex-end', justifyContent: 'flex-start' });

    this._verticalAlignmentTable.set(Alignment.MiddleLeft,
      { alignItems: 'flex-start', justifyContent: 'center' });
    this._verticalAlignmentTable.set(Alignment.MiddleCenter,
      { alignItems: 'center', justifyContent: 'center' });
    this._verticalAlignmentTable.set(Alignment.MiddleRight,
      { alignItems: 'flex-end', justifyContent: 'center' });

    this._verticalAlignmentTable.set(Alignment.BottomLeft,
      { alignItems: 'flex-start', justifyContent: 'flex-end' });
    this._verticalAlignmentTable.set(Alignment.BottomCenter,
      { alignItems: 'center', justifyContent: 'flex-end' });
    this._verticalAlignmentTable.set(Alignment.BottomRight,
      { alignItems: 'flex-end', justifyContent: 'flex-end' });
  }

  /**
   * Subscribes to breakpoint changes to update the layout of the host element accordingly
   */
  private _subscribeToBreakpointChanges(): void {
    this._browserService.breakpointChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._layoutRequestChange.next());
  }

  /**
   * Subscribes to layout request changes to repeat all the process that includes the validation
   */
  private _subscribeToLayoutRequest(): void {
    this._layoutRequestChange.pipe(
      startWith(null as void),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      this._validateAlignment();
      this._updateContainerLayout();
    });
  }
}

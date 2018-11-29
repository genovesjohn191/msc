import {
  Directive,
  ElementRef,
  OnDestroy,
  OnChanges,
  AfterViewInit,
  Input,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import { McsBrowserService } from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getElementStyle
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

export class AlignContentDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Input('mcsAlignContent')
  public alignment: string;

  private _layoutRequestChange = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _horizontalAlignmentTable = new Map<Alignment, AlignmentDetails>();
  private _verticalAlignmentTable = new Map<Alignment, AlignmentDetails>();

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _browserService: McsBrowserService
  ) {
    this._createHorizontalAlignTable();
    this._createVerticalAlignTable();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let alignmentChange = changes['alignment'];
    if (!isNullOrEmpty(alignmentChange)) {
      this._layoutRequestChange.next();
    }
  }

  public ngAfterViewInit(): void {
    this._subscribeToBreakpointChanges();
    this._subscribeToLayoutRequest();
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
    return getElementStyle(this.hostElement, 'flexDirection') === 'row' ?
      Direction.Horizontal : Direction.Vertical;
  }

  /**
   * Returns the actual container alignment
   */
  public get containerAlignment(): Alignment {
    return this.alignment as Alignment || Alignment.TopLeft;
  }

  /**
   * Validates the host display type based on the display property
   */
  private _validateHostDisplayType(): void {
    let hostDisplayType = getElementStyle(this.hostElement, 'display');
    if (hostDisplayType !== 'flex') {
      throw new Error('The element display type is not a flex.');
    }
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
    let alignDetails = this.containerDirection === Direction.Horizontal ?
      this._horizontalAlignmentTable.get(this.containerAlignment) :
      this._verticalAlignmentTable.get(this.containerAlignment);

    if (isNullOrEmpty(alignDetails)) { return; }
    this.hostElement.style.alignItems = alignDetails.alignItems;
    this.hostElement.style.justifyContent = alignDetails.justifyContent;
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
      startWith(null),
      takeUntil(this._destroySubject)
    ).subscribe(() => this._layoutRequestChange.next());
  }

  /**
   * Subscribes to layout request changes to repeat all the process that includes the validation
   */
  private _subscribeToLayoutRequest(): void {
    this._layoutRequestChange.pipe(
      startWith(null),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      Promise.resolve().then(() => {
        this._validateHostDisplayType();
        this._validateAlignment();
        this._updateContainerLayout();
      });
    });
  }
}

import {
  Component,
  Input,
  QueryList,
  ElementRef,
  ContentChild,
  ContentChildren,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  AfterContentInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import {
  Subject,
  Observable,
  merge,
  defer
} from 'rxjs';
import {
  takeUntil,
  startWith,
  take,
  switchMap
} from 'rxjs/operators';
import { CoreDefinition } from '@app/core';
import {
  animateFactory,
  isNullOrEmpty,
  coerceBoolean,
  unsubscribeSubject
} from '@app/utilities';
import { OptionComponent } from './option/option.component';
import { OptionGroupLabelDirective } from './option-group-label.directive';
import { OptionGroupHeaderDirective } from './option-group-header.directive';

@Component({
  selector: 'mcs-option-group',
  templateUrl: './option-group.component.html',
  styleUrls: ['./option-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.rotate45,
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'option-group-wrapper',
    '[class.option-group-selected]': 'selected',
    '[class.option-group-expanded]': 'panelOpen',
    'role': 'group'
  }
})

export class OptionGroupComponent implements AfterContentInit, OnDestroy {
  @Input()
  public label: string;

  @ContentChild(OptionGroupLabelDirective)
  public labelTemplate: OptionGroupLabelDirective;

  @ContentChild(OptionGroupHeaderDirective)
  public headerTemplate: OptionGroupHeaderDirective;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;

  @Input()
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) { this._selected = coerceBoolean(value); }
  private _selected: boolean = false;

  private _destroySubject = new Subject<void>();

  /**
   * Combine streams of all the selected item on options
   */
  private readonly _optionsSelectionChanges: Observable<OptionComponent> = defer(() => {
    if (!isNullOrEmpty(this._options)) {
      return merge(...this._options.map((option) => option.selectionChange));
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._optionsSelectionChanges)
    );
  });

  /**
   * Combine streams of all the activated item on options
   */
  private readonly _optionsActiveChanges: Observable<OptionComponent> = defer(() => {
    if (!isNullOrEmpty(this._options)) {
      return merge(...this._options.map((option) => option.activeChange));
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._optionsActiveChanges)
    );
  });

  /**
   * Returns the caret icon key
   */
  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  /**
   * Returns true when panel is opened
   */
  public get panelOpen(): boolean { return this._panelOpen; }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _panelOpen: boolean;

  constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  public ngAfterContentInit(): void {
    this._options.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._listenToSelectionChange());

    if (!isNullOrEmpty(this.headerTemplate)) {
      this.openPanel();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the associated host element of the component
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Closes the currently opened panel
   */
  public closePanel(): void {
    if (!isNullOrEmpty(this.headerTemplate)) { return; }
    this.panelOpen = false;
  }

  /**
   * Opens the currently closed panel
   */
  public openPanel(): void {
    this.panelOpen = true;
  }

  /**
   * Toggles the panel
   */
  public toggle(): void {
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  /**
   * Event that emits when this component is clicked
   * @param event Mouse event instance
   */
  public onClick(event: MouseEvent) {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    this.toggle();
  }

  /**
   * Returns true if the associated option is part of the group
   */
  public hasOption(activeOption: OptionComponent): boolean {
    let existingOption = this._options.find((_option: OptionComponent) =>
      _option.id === activeOption.id);
    return !isNullOrEmpty(existingOption);
  }

  /**
   * Listen to every selection changed event
   */
  private _listenToSelectionChange(): void {
    let resetSubject = merge(this._options.changes, this._destroySubject);
    let mergeChanges = merge(this._optionsSelectionChanges, this._optionsActiveChanges);

    mergeChanges.pipe(
      startWith(null),
      takeUntil(resetSubject)
    ).subscribe(() => {
      let selectedOptions = this._options.filter((option) => option.selected || option.active);
      isNullOrEmpty(selectedOptions) ? this.closePanel() : this.openPanel();
    });
  }
}

import {
  Component,
  Input,
  QueryList,
  ElementRef,
  ContentChild,
  ContentChildren,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectorRef,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  Subject,
  Observable
} from 'rxjs/Rx';
import { CoreDefinition } from '../../core';
import {
  animateFactory,
  isNullOrEmpty,
  coerceBoolean
} from '../../utilities';
import { OptionComponent } from './option/option.component';
import { OptionGroupLabelDirective } from './option-group-label.directive';

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
    'role': 'group',
    '(click)': 'onClick($event)'
  }
})

export class OptionGroupComponent implements AfterContentInit, OnDestroy {
  /**
   * Event emitted when the option group is selected or deselected
   */
  public selectionChange = new EventEmitter<OptionGroupComponent>();

  @Input()
  public label: string;

  @ContentChild(OptionGroupLabelDirective)
  public labelTemplate: OptionGroupLabelDirective;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;

  @Input()
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) { this._selected = coerceBoolean(value); }
  private _selected: boolean = false;

  private _destroySubject = new Subject<void>();

  /**
   * Combine streams of all the selected item child's change event
   */
  private readonly _optionsSelectionChanges: Observable<OptionComponent> = Observable.defer(() => {
    return Observable.merge(...this._options.map((option) => option.selectionChange));
  });

  /**
   * Returns the caret icon key
   */
  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  /**
   * Returns true when panel is currently opened
   */
  private _panelOpen: boolean = false;
  public get panelOpen(): boolean { return this._panelOpen; }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  public ngAfterContentInit(): void {
    this._options.changes.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
    this._listenToSelectionChange();
  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
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
    this._panelOpen = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Opens the currently closed panel
   */
  public openPanel(): void {
    this._panelOpen = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggles the panel
   */
  public toggle(): void {
    this._panelOpen ? this.closePanel() : this.openPanel();
  }

  /**
   * Event that emits when this component is clicked
   * @param event Mouse event instance
   */
  public onClick(event: MouseEvent) {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    this.toggle();
    this.selectionChange.emit(this);
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
    // Drops the current subscriptions and resets from scratch
    let resetSubject = Observable.merge(this._options.changes, this._destroySubject);

    this._optionsSelectionChanges.pipe(startWith(null), takeUntil(resetSubject))
      .subscribe(() => {
        let selectedOptions = this._options.filter((option) => option.selected);
        isNullOrEmpty(selectedOptions) ? this.closePanel() : this.openPanel();
        this.selectionChange.emit(this);
      });
  }
}
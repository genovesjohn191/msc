import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsGlobalElementOption } from '../factory/global-element/mcs-global-element-option';
import { McsGlobalElementRef } from '../factory/global-element/mcs-global-element-ref';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';
import { McsUniqueId } from '../factory/unique-generators/mcs-unique-id';

@Injectable()
export class McsGlobalElementService {

  private _globalElementWrapper: HTMLElement;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _injector: Injector
  ) { }

  public create(option?: McsGlobalElementOption): McsGlobalElementRef {
    // Create the global container if its not yet created
    this._createGlobalElementWrapper();

    // Create the global Element Item Wrapper
    let globalElementItem = this._createGlobalElementItem();

    // Return the Global Element Reference
    return new McsGlobalElementRef(
      globalElementItem,
      option,
      this._scrollDispatcher,
      this._componentFactoryResolver,
      this._applicationRef,
      this._injector
    );
  }

  /**
   * Creates the wrapper of the global element that holds all the global element items
   */
  private _createGlobalElementWrapper(): HTMLElement {
    if (!isNullOrEmpty(this._globalElementWrapper)) { return; }
    let container = document.createElement('div');

    container.classList.add('mcs-global-element-wrapper');
    document.body.appendChild(container);
    this._globalElementWrapper = container;
    return container;
  }

  /**
   * Creates the globale element item holder for each component attached
   */
  private _createGlobalElementItem(): HTMLElement {
    let itemPane = document.createElement('div');

    itemPane.id = McsUniqueId.NewId('global-element-item');
    itemPane.classList.add('mcs-global-element-item');
    this._globalElementWrapper.appendChild(itemPane);
    return itemPane;
  }
}

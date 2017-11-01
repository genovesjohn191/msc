import {
  Component,
  Input,
  AfterViewInit,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChild
} from '@angular/core';
import { McsPortalTemplate } from '../../../core';
import { TabLabelDirective } from './tab-label.directive';

/** Next overlay unique ID. */
let nextUniqueId = 0;

@Component({
  selector: 'mcs-tab',
  templateUrl: './tab.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-wrapper',
    '[id]': 'id'
  }
})

export class TabComponent implements AfterViewInit {

  public portalTemplate: McsPortalTemplate<any>;
  public id = `mcs-tab-${nextUniqueId++}`;

  @Input()
  public label: string;

  @Input()
  public supportSelection: boolean;

  @ContentChild(TabLabelDirective)
  public labelTemplate: TabLabelDirective;

  @ViewChild(TemplateRef)
  private _content: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {
    this.supportSelection = true;
  }

  public ngAfterViewInit(): void {
    this.portalTemplate = new McsPortalTemplate(this._content, this._viewContainerRef);
  }
}

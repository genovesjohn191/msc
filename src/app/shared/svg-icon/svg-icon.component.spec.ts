import {
  async,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { SvgIconComponent } from './svg-icon.component';
import {
  CoreDefinition,
  CoreConfig
} from '../../core';

describe('SvgIconComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: SvgIconComponent;
  let coreConfig = {
    apiHost: 'http://localhost:5000',
    imageRoot: 'assets/img',
    iconRoot: 'assets/icon',
    notification: {
      host: 'ws://localhost:15674/ws',
      routePrefix: 'mcs.portal.notification',
      user: 'guest',
      password: 'guest'
    }
  } as CoreConfig;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SvgIconComponent
      ],
      providers: [
        { provide: CoreConfig, useValue: coreConfig },
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SvgIconComponent, {
      set: {
        template: `
        <img #svgIconElement [src]="getSvgIconPath()">
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(SvgIconComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set small size to the width and height', () => {
      component.size = 'small';
      component.ngOnInit();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}`);
    });

    it('should set medium size to the width and height', () => {
      component.size = 'medium';
      component.ngOnInit();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}`);
    });

    it('should set large size to the width and height', () => {
      component.size = 'large';
      component.ngOnInit();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}`);
    });
  });

  describe('getSvgIconPath()', () => {
    it('should get the SVG icon full path', () => {
      component.name = 'close';
      component.color = 'black';

      let svgFullPath = component.getSvgIconPath();
      expect(svgFullPath)
        .toBe(`${coreConfig.iconRoot}/${component.color}/svg/${component.name}.svg`);
    });
  });
});

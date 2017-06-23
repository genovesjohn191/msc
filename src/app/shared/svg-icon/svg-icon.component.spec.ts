import {
  async,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { SvgIconComponent } from './svg-icon.component';
import {
  CoreDefinition,
  CoreConfig,
  McsAssetsProvider
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
  let mockAssetsProvider = {
    getSvgIconPath(key: string): string {
      let icons = {
        'no-icon-available': 'no-icon-available.svg',
        'close': 'close.svg',
        'radio-button-checked': 'radio-button-checked.svg',
        'radio-button-unchecked': 'radio-button-unchecked.svg'
      };

      let iconPath = icons[key];
      if (!iconPath) {
        iconPath = icons['no-icon-available'];
      }
      return iconPath;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SvgIconComponent
      ],
      providers: [
        { provide: CoreConfig, useValue: coreConfig },
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
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
  describe('ngOnChanges()', () => {
    it('should set xtra small size to the width and height', () => {
      component.size = 'xsmall';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL}`);
    });

    it('should set small size to the width and height', () => {
      component.size = 'small';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}`);
    });

    it('should set medium size to the width and height', () => {
      component.size = 'medium';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}`);
    });

    it('should set large size to the width and height', () => {
      component.size = 'large';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}`);
    });

    it('should set xlarge size to the width and height', () => {
      component.size = 'xlarge';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE}`);
      expect(component.svgIconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE}`);
    });

    it('should set the svg icon file as background-image', () => {
      component.key = 'close';
      component.ngOnChanges();

      expect(component.svgIconElement.nativeElement.style.backgroundImage)
        .toBeDefined();
    });
  });

  describe('getSvgIconPath()', () => {
    it('should get the full path of SVG icon', () => {
      component.key = 'close';

      let svgFullPath = component.getSvgIconPath();
      expect(svgFullPath).toBeDefined();
      expect(svgFullPath).toContain('close.svg');
    });

    it('should get the full path of no available icon of SVG', () => {
      component.key = 'open';

      let svgFullPath = component.getSvgIconPath();
      expect(svgFullPath).toBeDefined();
      expect(svgFullPath).toContain('no-icon-available.svg');
    });
  });
});

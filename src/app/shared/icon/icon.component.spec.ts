import {
  async,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { IconComponent } from './icon.component';
import {
  IconType,
  IconService
} from './icon.service';
import {
  CoreDefinition,
  McsAssetsProvider
} from '../../core';

describe('IconComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: IconComponent;
  let mockAssetsProvider = {
    getFontAwesomeIconClass(key: string): string {
      let icons = {
        exclamation: 'fa fa-warning'
      };
      return icons[key];
    },

    getSvgIconPath(key: string): string {
      let icons = {
        'no-icon-available': 'no-icon-available.svg',
        'close': 'close.svg'
      };
      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        IconComponent
      ],
      providers: [
        IconService,
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(IconComponent, {
      set: {
        template: `
        <i #iconElement class="icon-container"></i>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(IconComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.icon = {} as any;
    });
  }));

  /** Test Implementation */
  describe('ngOnChanges() when icon type is SVG', () => {
    beforeEach(async(() => {
      component.icon.type = IconType.Svg;
      component.key = 'close';
    }));

    it('should set xtra small size to the width and height', () => {
      component.size = 'xsmall';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL}px`);
      expect(component.iconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL}px`);
    });

    it('should set small size to the width and height', () => {
      component.size = 'small';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}px`);
      expect(component.iconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}px`);
    });

    it('should set medium size to the width and height', () => {
      component.size = 'medium';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}px`);
      expect(component.iconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}px`);
    });

    it('should set large size to the width and height', () => {
      component.size = 'large';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}px`);
      expect(component.iconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}px`);
    });

    it('should set xlarge size to the width and height', () => {
      component.size = 'xlarge';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.width)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE}px`);
      expect(component.iconElement.nativeElement.style.height)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE}px`);
    });

    it('should set the white class as color', () => {
      component.color = 'white';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the black class as color', () => {
      component.color = 'black';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the green class as color', () => {
      component.color = 'green';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the red class as color', () => {
      component.color = 'red';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the svg icon file as background-image', () => {
      component.key = 'close';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.backgroundImage)
        .toBeDefined();
    });
  });

  describe('ngOnChanges() when icon type is FONT', () => {
    beforeEach(async(() => {
      component.icon.type = IconType.FontAwesome;
      component.key = 'exclamation';
    }));

    it('should set xtra small size to the font-size and line-height', () => {
      component.size = 'xsmall';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.fontSize)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL}px`);
      expect(component.iconElement.nativeElement.style.lineHeight)
        .toBe(`${CoreDefinition.ICON_SIZE_XSMALL * 1.5}px`);
    });

    it('should set small size to the font-size and line-height', () => {
      component.size = 'small';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.fontSize)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL}px`);
      expect(component.iconElement.nativeElement.style.lineHeight)
        .toBe(`${CoreDefinition.ICON_SIZE_SMALL * 1.5}px`);
    });

    it('should set medium size to the font-size and line-height', () => {
      component.size = 'medium';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.fontSize)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM}px`);
      expect(component.iconElement.nativeElement.style.lineHeight)
        .toBe(`${CoreDefinition.ICON_SIZE_MEDIUM * 1.5}px`);
    });

    it('should set large size to the font-size and line-height', () => {
      component.size = 'large';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.fontSize)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE}px`);
      expect(component.iconElement.nativeElement.style.lineHeight)
        .toBe(`${CoreDefinition.ICON_SIZE_LARGE * 1.5}px`);
    });

    it('should set xlarge size to the font-size and line-height', () => {
      component.size = 'xlarge';
      component.ngOnChanges();

      expect(component.iconElement.nativeElement.style.fontSize)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE}px`);
      expect(component.iconElement.nativeElement.style.lineHeight)
        .toBe(`${CoreDefinition.ICON_SIZE_XLARGE * 1.5}px`);
    });

    it('should set the white class as color', () => {
      component.color = 'white';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the black class as color', () => {
      component.color = 'black';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the green class as color', () => {
      component.color = 'green';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the red class as color', () => {
      component.color = 'red';
      component.ngOnChanges();

      let colorClassExist = component.iconElement.nativeElement
        .classList.contains(component.color);
      expect(colorClassExist).toBeTruthy();
    });

    it('should set the font icon class in the icon element', () => {
      component.key = 'exclamation';
      component.ngOnChanges();

      let fontClassExist = component.iconElement.nativeElement
        .classList.contains('fa-warning');
      expect(fontClassExist).toBeTruthy();
    });
  });
});

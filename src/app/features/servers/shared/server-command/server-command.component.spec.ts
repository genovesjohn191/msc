import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ServerCommandComponent } from './server-command.component';
import { CoreDefinition } from '../../../../core';
import { ServersService } from '../../servers.service';
import { ServerCommand } from '../../models';

describe('ServerCommandComponent', () => {
  /** Stub Services/Components */
  let component: ServerCommandComponent;
  let assetsProviderMock = {
    getIcon(iconClass: string) {
      return iconClass;
    }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerCommandComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerCommandComponent, {
      set: {
        template: `
          <div>ServerCommandComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerCommandComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('IconKey() | Property', () => {
    it('should get the gear icon key definition', () => {
      expect(component.gearIconKey).toBe(CoreDefinition.ASSETS_FONT_GEAR);
    });
  });

  describe('getStartStatus()', () => {
    it('should return true when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.getStartStatus()).toBeTruthy();
    });

    it('should return true when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.getStartStatus()).toBeTruthy();
    });

    it('should return undefined when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.getStartStatus()).toBeUndefined();
    });
  });

  describe('getStopStatus()', () => {
    it('should return undefined when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.getStopStatus()).toBeUndefined();
    });

    it('should return undefined when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.getStopStatus()).toBeUndefined();
    });

    it('should return true when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.getStopStatus()).toBeTruthy();
    });
  });

  describe('getRestartStatus()', () => {
    it('should return undefined when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.getRestartStatus()).toBeUndefined();
    });

    it('should return true when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.getRestartStatus()).toBeTruthy();
    });

    it('should return undefined when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.getRestartStatus()).toBeTruthy();
    });
  });
});

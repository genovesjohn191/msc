import {
  async,
  TestBed
} from '@angular/core/testing';
import { ServerCommandComponent } from './server-command.component';
import { CoreDefinition } from '../../../../core';
import { ServerCommand } from '../../models';

describe('ServerCommandComponent', () => {
  /** Stub Services/Components */
  let component: ServerCommandComponent;

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
      expect(component.gearIconKey).toBe(CoreDefinition.ASSETS_SVG_COG);
    });
  });

  describe('getStartStatus()', () => {
    it('should return true when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.startStatus).toBeTruthy();
    });

    it('should return true when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.startStatus).toBeTruthy();
    });

    it('should return undefined when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.startStatus).toBeUndefined();
    });
  });

  describe('getStopStatus()', () => {
    it('should return undefined when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.stopStatus).toBeUndefined();
    });

    it('should return undefined when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.stopStatus).toBeUndefined();
    });

    it('should return true when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.stopStatus).toBeTruthy();
    });
  });

  describe('getRestartStatus()', () => {
    it('should return undefined when the command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.restartStatus).toBeUndefined();
    });

    it('should return true when the command is Restart', () => {
      component.command = ServerCommand.Restart;
      expect(component.restartStatus).toBeTruthy();
    });

    it('should return undefined when the command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.restartStatus).toBeTruthy();
    });
  });
});

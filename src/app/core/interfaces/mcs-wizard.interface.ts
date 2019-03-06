import { IMcsFallible } from './mcs-fallible.interface';
import { IMcsJobManager } from './mcs-job-manager.interface';
import { IMcsStateChangeable } from './mcs-state-changeable.interface';

export interface IMcsWizard extends IMcsFallible, IMcsJobManager, IMcsStateChangeable { }

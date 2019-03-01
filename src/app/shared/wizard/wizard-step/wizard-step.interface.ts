export interface IWizardStep {
  id: string;
  stepTitle: string;
  customClass: string;
  isActive: boolean;
  isLastStep: boolean;
  enabled: boolean;
  completed: boolean;
}

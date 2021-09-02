export interface IFormFieldCustomizable {
  updateValidators(): void;
  subscribeToFormValueChange(): void;
  propagateFormValueChange(): void;
}

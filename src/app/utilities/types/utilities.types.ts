// TODO: Create each type another file to be consistent with the other design

// Size Type
export type McsSizeType = 'auto' | 'xxsmall' | 'xsmall' | 'small' |
  'medium' | 'large' | 'xlarge' | 'xxlarge';

// Color Type
export type McsColorType = 'primary' | 'primary-01' | 'primary-02' | 'secondary'
  | 'grey' | 'grey-01' | 'grey-02' | 'grey-03' | 'grey-04' | 'grey-05' | 'grey-06' | 'grey-07'
  | 'grey-08' | 'black' | 'white' | 'red' | 'green';

// Theme Type
export type McsThemeType = 'none' | 'dark' | 'light' | 'black';

// Status Type
export type McsStatusType = 'success' | 'error' | 'warning' | 'info';

// Action Type
export type McsActionType = 'dismiss' | 'proceed';

// Status Color Type
export type McsStatusColorType = 'default' | 'primary' | 'success'
  | 'error' | 'warning' | 'info';

// Placement Type
export type McsPlacementType = 'left' | 'right' | 'top' | 'bottom' | 'center';

// Alignment Type
export type McsAlignmentType = 'start' | 'center' | 'end';

// Orientation Type
export type McsOrientationType = 'horizontal' | 'vertical';

// Data Size Type
export type McsDataSizeType = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

// Priority Type
export type McsPriorityType = 'low' | 'medium' | 'high';

// Form field error type
export type McsFieldErrorType = 'required' | 'email' | 'url' | 'min' | 'max';

// Form field hint type
export type McsFieldHintType = 'maxChar' | 'minChar';

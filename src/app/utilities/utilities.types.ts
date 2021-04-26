// Size Type
export type McsSizeType = 'auto' | 'full' | 'xxsmall' | 'xsmall' | 'small' |
  'medium' | 'large' | 'xlarge' | 'xxlarge';

// Color Type
export type McsColorType = 'primary' | 'secondary' | 'tertiary'
  | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' | 'black';

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

// Bit Data Size Type
export type McsBitDataSizeType = 'Mb' | 'Gb';

// Priority Type
export type McsPriorityType = 'low' | 'medium' | 'high';

// Form field error type
export type McsFieldErrorType = 'required' | 'email' | 'url' | 'min' | 'max';

// Form field hint type
export type McsFieldHintType = 'maxChar' | 'minChar';

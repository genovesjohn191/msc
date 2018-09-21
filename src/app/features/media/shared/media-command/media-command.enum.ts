export enum MediaCommand {
  None = 0,
  Attach = 1,
  Delete = 2,
  Rename = 3
}

export const mediaCommandText = {
  [MediaCommand.Attach]: 'Attach',
  [MediaCommand.Delete]: 'Delete',
  [MediaCommand.Rename]: 'Rename'
};

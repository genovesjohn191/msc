# LaunchPad Workflow Builder Guide

### 1. Create Workflow Group
Create new workflow group under `/core/workflows/workflow-group`
- `id` --- create and specify a `workflowType`
- `productType` --- this should match the productType of the target CRISP object, the productType of child workflows should match the associated CRISP object. This will allow the LaunchPad to match and populate CRISP object data with the form.
- `title` --- title of the workflow
- `form` --- create and specify a `LaunchPadForm`

### 2. Create Workflow Form
Create new `LaunchPadForm` under `/core/workflows/forms`
- `config` --- array of `DynamicFormFieldConfigBase`. list of fields that will be in the form
- `mapContext` --- (optional) callback function for mapping LaunchPad context to a form. This is necessary if the form requires access to `WorkflowGroupSaveState`
- `mapCrispElementAttributes` --- (optional) callback function for mapping CRISP object payload to the form. This is necessary if the form is expecting to receive CRISP elements payload info.

### 3. Build Workflow Relationships
- `/core/workflows/workflow-group.map.ts` --- create and assign a `WorkflowGroupId` to the newly created `WorkflowGroup`.
- `/core/workflows/product-workflow-group.map.ts` --- assign `WorkflowGroupId` to all `ProductType` that we want to workflow to be attached.
- `/core/layout/workflow-options.map.ts` --- provide desciption for the new workflow group. This will appear on the workflow selection option
- `/workflows/core/workflow-permission.map.ts` --- assign `permission` to all `WorkflowGroupId`. This will control user access for each workflow.

### 4. Test
- Global Search Results --- ensure all `productType` that is supported by the new workflow should show the option in the workflow selector
- CRISP payload --- ensure fields that are expected to map from CRISP data is correctly set when loading a new workflow
- Dynamic Fields --- if any `dependent` fields are set in the form field configuration ensure they work as expected.
- Save State --- ensure loading from save state works as expected
- Provisioning --- E2E workflow successfully

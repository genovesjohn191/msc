## Feature Components - Developer Guide

Features are components in the portal that have major functionalities and/or data listing. We usually add new feature when there's a component that has major functionalities. 

Portal features are module based and consists of modules, services, constants, models, repositories and components. Testing module in each feature must be created.
<br>

#### Adding a new component to an existing module

##### 1. Creating new portal feature component
Navigate to the target parent folder of the component you want to create in in the src/app/features directory. 

Naming convention is based on the application hierarchy and is kebab-cased e.g.
    
    feature-component-name.component.html
    feature-component-name.component.ts

Add your created files to the *module.ts* file of the feature it belongs to.

##### 2. Create Route Configuration
1. Add a new enum value to RouteKey under *src/app/models/enumerations/route-key.enum.ts* 
<br>

1. Add a new route configuration in *src/app/config/routes.config.json* using the enum value created as a key.
    - **enumKey** = enum value from RouteKey
    - **enumCategory** =  enum value from RouteCategory
    - **navigationPath** = url to be navigated to when changing the path (use for navigation)
    - **documentTitle** = title shown when this page is navigated to
    - **requiredPermissions** = string array of permissions required for accessing this path
    - **requiredFeatureFlag** = string array of flags required to show this feature
    - **requireAllFeatures** = boolean value, when set as true, all requiredFeatureFlags must be on to display feature
<br>


1. Add your component route configuration in the module's *constants.ts* file.

Sample constant file:

    import { Routes } from '@angular/router';
    import { McsNavigateAwayGuard } from '@app/core';
    import { RouteKey } from '@app/models';
    
    /** Components */
    import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
    import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
    import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';

    /**
    * List of routes for the main module
    */
    export const launchPadRoutes: Routes = [
        {
            path: 'azure-deployments',
            component: AzureDeploymentsComponent,
            data: { routeId: RouteKey.LaunchPadAzureDeployments },
            canActivate: [ LaunchPadGuard ]
        },
        {
            path: 'azure-deployments/:id',
            component: AzureDeploymentComponent,
            data: { routeId: RouteKey.LaunchPadAzureDeploymentDetails },
            canActivate: [ LaunchPadGuard ],
            resolve: {
            deployment: AzureDeploymentResolver
            },
            children: [
                {
                    path: '',
                    redirectTo: 'overview',
                    pathMatch: 'full',
                    data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
                },
                {
                    path: 'overview',
                    component: AzureDeploymentOverviewComponent,
                    data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
                }]
        }]
Note: order of paths do have an effect so put all valid paths like '/create', '/edit', before '/:id'
<br>

##### 3. Creating services and models

###### Service
Create an interface and a service for your component. This will contain your api calls to be referenced by the McsApiService

    src/app/api-client/interfaces/mcs-api-component.interface.ts
    src/app/api-client/services/mcs-api-component.service.ts

McsApiService 
src/app/service/mcs-api.service.ts

###### Model

The app's models are grouped into the following:
- common
- enumerations
- job-references
- request
- response
- serialization

##### 4. i18n

Add strings like error messages, labels, page headers, etc. to the *en.json* file in src/assets/i18n/


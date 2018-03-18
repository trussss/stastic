import { ModuleWithProviders } from '@angular/core';
import {
	Routes,
	RouterModule,
	PreloadAllModules
} from '@angular/router';

import { HomeComponent } from './home/home.component'


const routes: Routes = [{
  path: '',
  component: HomeComponent
}];

export const AppRouting: ModuleWithProviders =
	RouterModule.forRoot(routes, {
		useHash: false,
		preloadingStrategy: PreloadAllModules
	});

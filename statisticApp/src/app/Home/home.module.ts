import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HomeComponent } from './home.component';

const IMPORTS = [
  BrowserModule
];

const COMPONENTS = [
  HomeComponent
];

const PROVIDERS = [
];



@NgModule({
  imports: [
    ...IMPORTS
  ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    ...PROVIDERS
  ]
})
export class HomeModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import {HttpClientModule, HttpClient} from '@angular/common/http';


import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { Config } from './servicesGlobal/config.service';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    HttpModule,
    HomeModule,
    AppRoutingModule
  ],
  providers: [
    Config
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

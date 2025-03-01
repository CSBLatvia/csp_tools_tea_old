import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from './app-routing.module';

import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ModelService} from './model/model.service';
import {HttpClientModule} from '@angular/common/http';
import {MetaUpdateService} from "./model/services/meta-update/meta-update.service";
import {SharedUiModule} from "./mod-shared-ui/shared-ui.module";
import {StatsService} from "./model/services/stats/stats.service";
import {LoggerService} from "./model/log/logger.service";
import {RouteService} from "./model/services/route/route.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SharedUiModule,
    AppRoutingModule
  ],
  providers: [ModelService,StatsService, MetaUpdateService, LoggerService, RouteService],
  bootstrap: [AppComponent]
})
export class AppModule { }

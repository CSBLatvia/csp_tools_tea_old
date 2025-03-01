import { NgModule } from '@angular/core';
import {SettingsViewComponent} from '../view-settings/settings-view.component';
import {SettingsRoutingModule} from './settings-routing.module';
import {ClarityModule, ClrIconModule} from '@clr/angular';
import {CommonModule} from '@angular/common';


@NgModule({
  /*entryComponents: [ SettingsViewComponent ],*/
  declarations: [SettingsViewComponent],
  imports: [
    CommonModule,
    ClrIconModule,
    ClarityModule,
    SettingsRoutingModule
  ],
  providers:[],
  exports:[SettingsViewComponent]
})
export class SettingsModule { }

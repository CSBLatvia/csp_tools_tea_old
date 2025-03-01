import {NgModule} from '@angular/core';
import {LandingViewComponent} from '../view-landing/landing-view.component';
import {LandingRoutingModule} from './landing-routing.module';
import {SharedUiModule} from '../mod-shared-ui/shared-ui.module';
import {LandingService} from './services/landing.service';


@NgModule({
  declarations: [
    LandingViewComponent
  ],
  imports: [
    SharedUiModule,
    LandingRoutingModule
  ],
  providers:[LandingService],
  exports:[LandingViewComponent]
})
export class LandingModule { }

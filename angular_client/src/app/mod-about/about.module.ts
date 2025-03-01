import {NgModule} from '@angular/core';
import {AboutRoutingModule} from './about-routing.module';
import {AboutViewComponent} from '../view-about/about-view.component';
import {SharedUiModule} from '../mod-shared-ui/shared-ui.module';
import {SharedComponentsModule} from "../mod-shared-all/shared-components.module";
import {LoggerService} from "../model/log/logger.service";

@NgModule({
  declarations: [AboutViewComponent],
    imports: [
        SharedUiModule,
        AboutRoutingModule,
        SharedComponentsModule
    ],
  providers:[LoggerService],
  exports:[AboutViewComponent]
})
export class AboutModule { }

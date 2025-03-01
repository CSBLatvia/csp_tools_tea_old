import { NgModule } from '@angular/core';
import { AboutApiRoutingModule } from './about-api-routing.module';
import {AboutApiViewComponent} from "../view-about-api/about-api-view.component";
import {SharedUiModule} from "../mod-shared-ui/shared-ui.module";
import {SharedComponentsModule} from "../mod-shared-all/shared-components.module";
import {LoggerService} from "../model/log/logger.service";


@NgModule({
  declarations: [AboutApiViewComponent],
    imports: [
        SharedUiModule,
        AboutApiRoutingModule,
        SharedComponentsModule
    ],
  providers:[LoggerService],
  exports:[AboutApiViewComponent]
})
export class AboutApiModule { }

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ClarityModule, ClrIconModule} from '@clr/angular';
import {CommonModule} from '@angular/common';
import {SettingsModule} from '../mod-settings/settings.module';

import {TopMenuComponent} from '../components-shared-ui/top-menu/top-menu.component';

import {FooterComponent} from '../components-shared-ui/footer/footer.component';
import {ScriptService} from './services/script.service';
import {ScrollTopComponent} from '../components-shared-ui/scroll-top/scroll-top.component';
import {AriaEnabledDirective} from "../directives/aria-enabled.directive";
import {TrapFocusDirective} from "../directives/trap-focus.directive";
import {TopMenuDesktopComponent} from "../components-shared-ui/top-menu/components/top-menu-desktop/top-menu-desktop.component";
import {TopMenuMobileComponent} from "../components-shared-ui/top-menu/components/top-menu-mobile/top-menu-mobile.component";
import {TopMenuDesktopFullComponent} from "../components-shared-ui/top-menu/components/top-menu-desktop-full/top-menu-desktop-full.component";
import {FooterLargeComponent} from "../components-shared-ui/footer/footer-large/footer-large.component";
import {FooterTinyComponent} from "../components-shared-ui/footer/footer-tiny/footer-tiny.component";
import {NgScrollbarModule} from 'ngx-scrollbar';
import {DomChangeDirective} from "../directives/dom-change.directive";




@NgModule({
    declarations: [
      TopMenuComponent,
      TopMenuDesktopComponent,TopMenuDesktopFullComponent, TopMenuMobileComponent,
      FooterComponent,FooterLargeComponent,FooterTinyComponent,
      ScrollTopComponent,
      AriaEnabledDirective,
      TrapFocusDirective,
      DomChangeDirective
    ],
  imports: [
    CommonModule,
    ClrIconModule,
    ClarityModule,
    NgScrollbarModule,
    RouterModule,
    SettingsModule
  ],
  exports: [
    CommonModule,
    ClrIconModule,
    ClarityModule,
    TopMenuComponent,
    TopMenuDesktopComponent,TopMenuDesktopFullComponent, TopMenuMobileComponent,
    FooterComponent,FooterLargeComponent,FooterTinyComponent,
    ScrollTopComponent,
    AriaEnabledDirective,
    TrapFocusDirective,
    DomChangeDirective
  ],
  providers:[ScriptService]
})
export class SharedUiModule { }

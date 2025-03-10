import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AboutViewComponent} from '../view-about/about-view.component';

const routes: Routes = [
  {
    path: '',
    component: AboutViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutRoutingModule { }

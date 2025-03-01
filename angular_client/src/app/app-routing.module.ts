import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';

const routes: Routes = [
  // landing
  { path: '',
    redirectTo: 'lv/landing',
    pathMatch:'full'
  },
  { path: 'lv',
    redirectTo: 'lv/landing',
    pathMatch:'full'
  },
  { path: 'en',
    redirectTo: 'en/landing',
    pathMatch:'full'
  },

  // landing
  { path: ':lang/landing', pathMatch: 'full', loadChildren: () => import('./mod-landing/landing.module').then(m => m.LandingModule)},



/*  // map
  { path: ':lang/map/:direction/:level/:yearFrom/:yearTo/:vizView',
  pathMatch: 'full', loadChildren: () => import('./mod-map/map.module').then(m => m.MapModule)},
  */

  // from landing ->  lang/2017/M1/M2/T1/T2/none/none
  // main         ->  lang/2017/M1/M2/T1/T2/M3/M4
  {
    path: ':lang/map/:year/:M1/:M2/:T1/:T2/:M3/:M4',
    pathMatch: 'full',
    loadChildren: () => import('./mod-map/map.module').then(m => m.MapModule)
  },

  // about-project
  { path: ':lang/about', pathMatch: 'full', loadChildren: () => import('./mod-about/about.module').then(m => m.AboutModule)},

  // about-api
  { path: ':lang/api', pathMatch: 'full', loadChildren: () => import('./mod-about-api/about-api.module').then(m => m.AboutApiModule)},

  // text_editor
  {
    path: 'text_editor',
    pathMatch: 'full',
    loadChildren: () => import('./mod-translations-admin/translations-admin.module').then(m => m.TranslationsAdminModule)
  },

  // none existing route
  {path: '**', redirectTo: 'lv/landing'}

];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      enableTracing: false,
      preloadingStrategy: PreloadAllModules
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }

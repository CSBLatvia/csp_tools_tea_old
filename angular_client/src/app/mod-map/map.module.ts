import { NgModule } from '@angular/core';
import { MapRoutingModule } from './map-routing.module';
import {SharedUiModule} from "../mod-shared-ui/shared-ui.module";
import {MapViewComponent} from "../view-map/map-view.component";

import {SharedComponentsModule} from "../mod-shared-all/shared-components.module";

import {NgScrollbarModule} from "ngx-scrollbar";
import {UiControlsModule} from "../ui-controls/modules/ui-controls.module";
import {FormsModule} from "@angular/forms";
import { MapComponent } from './components/map/map.component';
import {MapSettingsComponent} from "./components/map-settings/map-settings.component";
import {SettingsService} from "./services/settings/settings.service";
import {SettingsDataComponent} from "./components/map-settings/components/settings-data/settings-data.component";
import {SettingsDataTableComponent} from "./components/map-settings/components/settings-data/components/settings-data-table/settings-data-table.component";
import {SettingsInfoBlockComponent} from "./components/map-settings/components/settings-data/components/settings-info-block/settings-info-block.component";
import {SettingsDataTableItemComponent} from "./components/map-settings/components/settings-data/components/settings-data-table/components/settings-data-table-item/settings-data-table-item.component";
import {DataTableHeaderComponent} from "./components/map-settings/components/settings-data/components/settings-data-table/components/data-table-header/data-table-header.component";
import {MapMapBoxComponent} from "./components/map-mapbox/map-mapbox.component";
import {MapLayersPopComponent} from "./components/map-layers-pop/map-layers-pop.component";
import {CommonModule} from "@angular/common";
import {MapLegendPopComponent} from "./components/map-legend-pop/map-legend-pop.component";
import {LegendSizesComponent} from "./components/map-legend-pop/components/legend-sizes/legend-sizes.component";
import {LegendListComponent} from "./components/map-legend-pop/components/legend-list/legend-list.component";
import {LegendClustersVerticalComponent} from "./components/map-legend-pop/components/legend-clusters-vertical/legend-clusters-vertical.component";
import {LegendCirclesComponent} from "./components/map-legend-pop/components/legend-circles/legend-circles.component";
import {MapNoDataInfoComponent} from "./components/map-no-data-info/map-no-data-info.component";
import {AllPopsComponent} from "./components/all-pops/all-pops.component";
import {PopMapComponent} from "./components/pop-ups/pop-map/pop-map.component";
import {PopCirclesComponent} from "./components/pop-ups/pop-circles/pop-circles.component";
import {VizMapComponent} from "./components/viz-map/viz-map.component";
import {VizCirclesUglyComponent} from "./components/viz/ugly/viz-circles-ugly/viz-circles-ugly.component";
import {VizCirclesSectorsUglyComponent} from "./components/viz/ugly/viz-circles-sectors-ugly/viz-circles-sectors-ugly.component";
import {VizCirclesSectorsRegionUglyComponent} from "./components/viz/ugly/viz-circles-sectors-region-ugly/viz-circles-sectors-region-ugly.component";
import {VizCirclesRegionUglyComponent} from "./components/viz/ugly/viz-circles-region-ugly/viz-circles-region-ugly.component";
import {VizPickingComponent} from "./components/viz-picking/viz-picking.component";
import {MapLegendService} from "./services/map-legend/map-legend.service";
import {MapCentroidsService} from "./services/map-centroids/map-centroids.service";
import {VizCirclesService} from "./services/viz-services/viz-circles.service";
import {VizCirclesRegionService} from "./services/viz-services/viz-circles-region.service";
import {VizCirclesSectorsRegionService} from "./services/viz-services/viz-circles-sectors-region.service";
import {VizCirclesSectorsService} from "./services/viz-services/viz-circles-sectors.service";
import {MapTitleComponent} from "./components/map-title/map-title.component";
import {LoggerService} from "../model/log/logger.service";

@NgModule({
  declarations: [
    MapViewComponent,
    MapComponent,MapSettingsComponent,
    // here come all other components
    SettingsDataComponent,
    SettingsDataTableComponent,
    SettingsDataTableItemComponent,
    SettingsInfoBlockComponent,
    DataTableHeaderComponent,

    MapMapBoxComponent,MapTitleComponent,
    VizMapComponent,
    VizCirclesUglyComponent,
    VizCirclesSectorsUglyComponent,
    VizCirclesSectorsRegionUglyComponent,
    VizCirclesRegionUglyComponent,
    VizPickingComponent,

    MapLayersPopComponent,
    MapLegendPopComponent,
    LegendSizesComponent,
    LegendListComponent,
    LegendClustersVerticalComponent,
    LegendCirclesComponent,
    MapNoDataInfoComponent,
    AllPopsComponent,PopMapComponent,PopCirclesComponent
  ],
    imports: [
        CommonModule,
        SharedUiModule,
        MapRoutingModule,
        SharedComponentsModule,
        NgScrollbarModule,
        UiControlsModule,
        FormsModule
    ],
  providers:[
    SettingsService,

    MapLegendService,
    MapCentroidsService,

    VizCirclesService,
    VizCirclesRegionService,
    VizCirclesSectorsService,
    VizCirclesSectorsRegionService,
    LoggerService
  ],
  exports:[MapViewComponent]
})
export class MapModule { }

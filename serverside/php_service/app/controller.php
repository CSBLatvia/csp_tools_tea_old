<?php
include("app/helpers.php");
include("app/request.php");


class Controller{
	function __construct(){

		if(!isset($_GET['db'])){
			errorResponse(StatusCodes::ERROR_WRONG_GET_PARAMS);
		}

		$db = validateString($_GET['db']);


			switch($db){
				case "data-table-list":
					$this->dataTableList();
					break;
				case "menu-profs":
					$this->menuProfs();
					break;
				case "menu-naces":
					$this->menuNaces();
					break;
				case "menu-sectors":
					$this->menuSectors();
					break;
				case "menu-territory-name":
					$this->menuTerritoryName();
					break;
				case "menu-territories":
					$this->menuTerritories();
					break;
                case "menu-years":
                    $this->menuYears();
                    break;
				case "map-centroids":
                	$this->mapCentroids();
                	break;
				case "viz-circles":
                	$this->vizCircles();
                	break;
				case "viz-circles-region":
                	$this->vizCirclesRegion();
                	break;
				case "viz-circles-sectors":
                	$this->vizCirclesSectors();
                	break;
				case "viz-circles-sectors-region":
                	$this->vizCirclesSectorsRegion();
                	break;
                case "pop":
                    $this->popTexts();
                    break;
                case "title":
                    $this->titleTexts();
                    break;
                case "meta-client":
                    $this->metaClient();
                    break;
				case "translations":
                	$this->translations();
                	break;
                case "route":
                	$this->route();
                	break;
                /////////////////////////////
				default:
					errorResponse(StatusCodes::ERROR_WRONG_GET_PARAMS);
			}
	}


	//data list & data download
	function dataTableList(){
		include("app/models/data/data_table_list.php");
		$obj = new DataTableList();
		$get = $obj->getList();
	}

	// menu lists
	function menuProfs(){
		include("app/models/menu/menu_profs.php");
		$obj = new MenuProfs();
		$get = $obj->getList();
	}
	function menuNaces(){
		include("app/models/menu/menu_naces.php");
		$obj = new MenuNaces();
		$get = $obj->getList();
	}
	function menuSectors(){
		include("app/models/menu/menu_sectors.php");
		$obj = new MenuSectors();
		$get = $obj->getList();
	}
	function menuTerritoryName(){
		include("app/models/menu/menu_territory_name.php");
		$obj = new MenuTerritoryName();
		$get = $obj->getList();
	}
	function menuTerritories(){
		include("app/models/menu/menu_territories.php");
		$obj = new MenuTerritories();
		$get = $obj->getList();
	}
    function menuYears(){
      	include("app/models/menu/menu_years.php");
       	$obj = new MenuYears();
       	$get = $obj->getList();
    }
	function mapCentroids(){
    	include("app/models/map/map_centroids.php");
        $obj = new MapCentroids();
        $get = $obj->getList();
    }
	function vizCircles(){
    	include("app/models/viz/viz_circles.php");
        $obj = new VizCircles();
        $get = $obj->getList();
    }
	function vizCirclesRegion(){
    	include("app/models/viz/viz_circles_region.php");
        $obj = new VizCirclesRegion();
        $get = $obj->getList();
    }
	function vizCirclesSectors(){
    	include("app/models/viz/viz_circles_sectors.php");
        $obj = new VizCirclesSectors();
        $get = $obj->getList();
    }
	function vizCirclesSectorsRegion(){
    	include("app/models/viz/viz_circles_sectors_region.php");
        $obj = new VizCirclesSectorsRegion();
        $get = $obj->getList();
    }
    function popTexts(){
        include("app/models/pop/pop.php");
        $obj = new Pop();
        $get = $obj->getList();
    }
    function titleTexts(){
        include("app/models/title/title.php");
        $obj = new Title();
        $get = $obj->getList();
    }
    function metaClient(){
        include("app/models/meta/meta-client.php");
        $obj = new MetaClient();
        $get = $obj->getList();
    }
    function translations(){
       include("app/models/translations/translations.php");
       $obj = new Translations();
       $get = $obj->getList();
    }
    function route(){
       include("app/models/route/route.php");
       $obj = new Route();
       $get = $obj->getList();
    }
    function sitemap(){
       include("app/models/sitemap/sitemap.php");
       $obj = new SiteMap();
       $get = $obj->getList();
    }

}//class end
?>

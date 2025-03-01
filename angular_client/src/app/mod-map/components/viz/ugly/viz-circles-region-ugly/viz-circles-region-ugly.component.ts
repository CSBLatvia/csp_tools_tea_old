import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {VizPickingComponent} from "../../../viz-picking/viz-picking.component";
import {RouteVO} from "../../../../../model/vo/RouteVO";
import {CentroidVO} from "../../../../vos/CentroidVO";
import {VizCircleVO} from "../../../../vos/VizCircleVO";
import {LoggerService} from "../../../../../model/log/logger.service";
import {ConfigVizUgly} from "../../../../../model/configs/ConfigVizUgly";
import {VizCirclesRegionService} from "../../../../services/viz-services/viz-circles-region.service";
import {ModelService} from "../../../../../model/model.service";
import {MapPopService} from "../../../../services/map-pop/map-pop.service";
import {Utils} from "../../../../../model/inc/Utils";


@Component({
  selector: 'viz-circles-region-ugly',
  templateUrl: './viz-circles-region-ugly.component.html',
  styleUrls: ['../../../viz-styles/viz-component.scss']
})
export class VizCirclesRegionUglyComponent implements OnInit,OnChanges,OnDestroy {


  @Input() mobile:boolean=false;
  private container:HTMLElement;
  private canvas:HTMLCanvasElement;
  private canvasCTX:CanvasRenderingContext2D;

  @ViewChild('canvasRef', { read: ViewContainerRef, static: true }) canvasRef:ViewContainerRef;
  @ViewChild('vizPickingRef', { read: VizPickingComponent, static: false }) vizPicking: VizPickingComponent;

  @Input() ww:number=5000;
  @Input() hh:number=5000;
  public wwR:number=-1;
  public hhR:number=-1;


  @Input() route:RouteVO;
  @Input() centroids:Array<CentroidVO>=[];
  @Input() initialized:boolean = false;
  @Input() moving:boolean = false;
  @Input() dpi:number=1;
  @Input() resizeEvent:string;

  private ready:boolean = false;
  private data:Array<VizCircleVO>=[];
  private ids:Array<string>=[];
  ////////////////////////////
  private dataOnScreen:Array<VizCircleVO> = [];
  ////////////////////////////

  private onServiceDataUpdateListener:any;
  //////////////////////////////////////
  private strokeColor:string;
  private strokeColorInvert:string;
  private strokeWidth:number;
  ///////////////////////
  private PI:number = Math.PI;
  ////////////////////////////
  ////////// parent //////////
  private parentCode:string;
  private parentRealCode:string;
  private parentData:VizCircleVO;
  ///////////////////////
  private config:ConfigVizUgly;


  constructor(private service:VizCirclesRegionService,private model:ModelService,private popService:MapPopService, private logger:LoggerService) {
    this.logger.enabled = false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['centroids']){
      this.render();
    }
    if(changes['route']){
      if(this.ready===true){
        this.updateData();
      }
    }
    if(changes['initialized']){
      if(this.initialized===true){
        this.initialize();
      }
    }
    if(changes['resizeEvent']){
      this.wwR = this.ww*this.dpi;
      this.hhR = this.hh*this.dpi;
      this.render();
    }
  }
  ngOnInit() {
    this.container = document.getElementById('viz-map') as HTMLElement;
    this.canvas = this.canvasRef.element.nativeElement as HTMLCanvasElement;
    this.canvasCTX  = this.canvas.getContext('2d',{willReadFrequently: true}) as CanvasRenderingContext2D;
    this.canvasCTX.imageSmoothingEnabled = false;
    /////////////////////////////////////
    this.model.vizService = this.service;
  }
  private initialize():void{
    if(this.ready===true){ return; }
    this.config = this.model.config.configViz;
    this.service.initialize();
    this.onServiceDataUpdateListener = this.service.onDataUpdated.subscribe(this.onServiceDataUpdate);
    this.ready = true;
    this.updateData();
  }
  ngOnDestroy(): void {
    this.model.vizService = null;
    if(this.ready===true) {
      this.onServiceDataUpdateListener.unsubscribe();
    }
  }
  private initializeConfigValues():void{
    this.strokeColor = this.config.strokeColor(this.route.M1);
    this.strokeColorInvert = this.config.strokeColorInvert(this.route.M1);
    this.strokeWidth = this.config.strokeWidth*this.dpi;
  }
  private updateData():void{
    this.initializeConfigValues();
    this.service.loadData(this.route);
  }
  ////////// rendering ////////////////
  private render():void{
    if(this.centroids.length===0 || this.data.length===0 || this.ready===false){
      return;
    }
    this.renderCanvas();
  }
  private renderCanvas():void{
    /////// legend sizes /////////
    let valueTooSmallStartsFrom:number = -1;
    let valueMaxOnScreen:number = -1;
    let areaMaxOnScreen:number = -1;
    this.model.updateLegendSizes();
    //////////////////////////////

    let j:number=0;
    const K:number = this.centroids.length;
    let item:CentroidVO;
    let index:number;

    const hh:number = this.container.offsetHeight*this.dpi;
    const ww:number = this.container.offsetWidth*this.dpi;
    let valid:boolean;

    const minRadius:number = this.config.minCircleRadius*this.dpi;
    const maxRadius:number = Math.min(ww,hh)*this.config.maxCircleDiameterPercentage*0.5;
    const maxArea:number = this.PI*maxRadius*maxRadius;
    let maxPRC:number=-1;

    ///////////////////////////
    // 1: items on screen
    ///////////////////////////
    this.dataOnScreen=[];

    while(j<K){
      item = this.centroids[j];
      index = this.ids.indexOf(item.code);
      if(index!==-1){
        // optimized values for speed..
        this.data[index].x = (0.5+item.pixelCoords[0]*this.dpi) << 0;
        this.data[index].y = (0.5+item.pixelCoords[1]*this.dpi) << 0;
        valid = this.data[index].x>0 && this.data[index].y>0 && this.data[index].x<ww && this.data[index].y<hh;
        if(valid===true){
          this.dataOnScreen.push(this.data[index]);
          maxPRC = Math.max(maxPRC,this.data[index].percentageFromData);
        }
      }
      if(this.parentCode==='parent-'+item.code && valid===true){
        index = this.ids.indexOf(this.parentCode);
        this.data[index].x = (0.5+item.pixelCoords[0]*this.dpi) << 0;
        this.data[index].y = (0.5+item.pixelCoords[1]*this.dpi) << 0;
        this.dataOnScreen.push(this.data[index]);
        maxPRC = Math.max(maxPRC,this.data[index].percentageFromData);
      }
      j++;
    }
    this.dataOnScreen = [...this.dataOnScreen.sort((a: any, b: any)=> parseInt(b.percentageFromData) - parseInt(a.percentageFromData))];


    ///////////////////////////
    ///////////////////////////
    // 2: CANVAS-DRAW
    ///////////////////////////
    ///////////////////////////
    let i:number = 0;
    const L:number = this.dataOnScreen.length;
    let vo:VizCircleVO;
    let prc:number;
    let radius:number = 0;
    let radiusTooSmall:boolean = false;

    this.canvas.width = this.canvas.width;
    this.vizPicking.canvas.width = this.vizPicking.canvas.width;

    while(i<L){
        vo = this.dataOnScreen[i];
        prc = vo.percentageFromData*100/(maxPRC);
        radius = Utils.radiusFromArea(maxArea*prc*0.01);
        /////// legend /////////
        areaMaxOnScreen = areaMaxOnScreen<(maxArea * prc * 0.01)?(maxArea * prc * 0.01):areaMaxOnScreen;
        valueMaxOnScreen = valueMaxOnScreen<vo.value_area?vo.value_area:valueMaxOnScreen;
        ////////////////////////
        radiusTooSmall = radius<minRadius;
        radius = radiusTooSmall === true ? minRadius : radius;

          ////////////////////////////
          if(radiusTooSmall && vo.value_area>valueTooSmallStartsFrom){
            valueTooSmallStartsFrom = vo.value_area;
          }
          ////////////////////////////
          // DATA-CIRCLE-stroke
          ////////////////////////////
          this.canvasCTX.beginPath();
          this.canvasCTX.lineWidth = this.strokeWidth;
          this.canvasCTX.strokeStyle = vo.isParent === true ? this.strokeColor : this.strokeColorInvert;
          this.canvasCTX.lineCap = 'round';
          this.canvasCTX.setLineDash(radiusTooSmall===true?[4*this.dpi,4*this.dpi]:[]);
          this.canvasCTX.arc(vo.x, vo.y, radius, 0, 2 * this.PI, false);
          this.canvasCTX.stroke();
          this.canvasCTX.closePath();

          //////////////////////////
          // PICKING-DRAW
          //////////////////////////
          this.vizPicking.canvasContext.beginPath();
          this.vizPicking.canvasContext.arc(vo.x, vo.y, radius + this.strokeWidth * 0.5, 0, 2 * this.PI, false);
          this.vizPicking.canvasContext.fillStyle = vo.picking_color;
          this.vizPicking.canvasContext.fill();

      i++;
    }
    //// legend /////////////////////////////
    this.model.updateLegendSizes(valueTooSmallStartsFrom,valueMaxOnScreen,areaMaxOnScreen);
    /////////////////////////////////////////
  }
  private onServiceDataUpdate=():void=>{
    this.data = [...this.service.data];
    this.ids = [...this.service.ids];

    this.data.forEach((item:VizCircleVO)=>{
      if(item.code.split('-').length===2){
        this.parentCode = item.code;
        this.parentRealCode = item.code.split('-')[1];
        this.parentData = item;
      }
    });
    this.render();
  }
  ////////// POP ////////////////
  public onPopShow=(ob:any):void=>{
    this.popService.type=2;
    const valueOB:VizCircleVO = this.service.getValueObjectByColor(ob.color);
    if(valueOB===null){ return; }

    if(this.popService.vo===null || this.popService.vo.code!==valueOB.code){
      this.popService.createPopVO(valueOB.code,'over');
    }
    this.popService.show(this.popService.vo,ob.x,ob.y);
  }
  public onPopHide=():void=>{
    this.popService.hide();
  }
  public onPopPosition=(ob:any):void=>{
    this.popService.positionUpdate({x:ob.x,y:ob.y});
  }
  private radiusSizeDebug(ww:number,hh:number,maxRadius:number):void{
    this.canvasCTX.beginPath();
    this.canvasCTX.lineWidth = 4;
    this.canvasCTX.strokeStyle='#f700ff';
    this.canvasCTX.rect((ww-maxRadius*2)*0.5, (hh-maxRadius*2)*0.5, maxRadius*2, maxRadius*2);
    this.canvasCTX.stroke();
    this.canvasCTX.closePath();
  }
}

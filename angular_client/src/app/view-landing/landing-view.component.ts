import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver, HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ModelService} from '../model/model.service';
import {TranslationVO} from '../model/vo/TranslationVO';
import {RouteVO} from "../model/vo/RouteVO";
import {Router} from "@angular/router";

@Component({
  selector: 'app-landing-view',
  templateUrl: './landing-view.component.html',
  styleUrls: ['./landing-view.component.scss']
})
export class LandingViewComponent implements OnInit,OnDestroy,AfterViewInit {


  public titleVO:TranslationVO;
  public descriptionVO:TranslationVO;

  public titleAV:TranslationVO;
  public titleE:TranslationVO;
  public titleVP:TranslationVO;
  public titleAVShort:TranslationVO;
  public titleEShort:TranslationVO;
  public titleVPShort:TranslationVO;

  public descriptionAV:TranslationVO;
  public descriptionE:TranslationVO;
  public descriptionVP:TranslationVO;

  public linkAV:TranslationVO;
  public linkE:TranslationVO;
  public linkVP:TranslationVO;
  public linkMore:TranslationVO;

  //////////////////////
  public route:RouteVO;
  //////////////////////

  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  //////////////////////////////
  public initialized:boolean = false;
  public resized:boolean = false;
  public mobile:boolean = false;
  public horizontal:boolean = false;

  ////////////////////////////////
  ////////////////////////////////
  @ViewChild("landingMapComponentRef", { read: ViewContainerRef }) landingMapComponentRef: ViewContainerRef;

  //#landingText
  @ViewChild("landingText", { read: ViewContainerRef }) landingText: ViewContainerRef;
  @ViewChild("landingMap", { read: ViewContainerRef }) landingMap: ViewContainerRef;

  constructor(private model:ModelService,private componentFactoryResolver: ComponentFactoryResolver,private router:Router ) {

  }

  async loadLandingMapComponent(){

    this.landingMapComponentRef.clear();
    const { MapRotateComponent } = await import('./components/map-rotate/map-rotate.component');
    let component = this.landingMapComponentRef.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(MapRotateComponent)
    );

  }


  ngOnDestroy(){
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
  }
  ngOnInit() {

    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    if(this.model.READY===true){
      this.initialize();
    }
  }
  ngAfterViewInit():void {
    this.onResize();
    this.loadLandingMapComponent();
  }



  initialize():void{
    if(this.initialized===true){return;}
    this.route = this.model.route.clone();


    this.updateTitleVOS();
    this.onResize();
    this.initialized = true;
  }

  private onModelReady=():void=>{
    this.initialize();
  }
  private onLanguageUpdate=():void=>{
    if(this.initialized===false){return;}
    this.route = this.model.route.clone();
    this.updateTitleVOS();
    this.onResize();
  }
  private updateTitleVOS=():void=>{
    this.titleVO = this.model.translations.item('tool-landing-title');
    this.descriptionVO = this.model.translations.item('tool-landing-desc');
    this.descriptionVO.replaceString('[year]',this.route.year+'',this.route.year+'');



    this.titleAV = this.model.translations.item('landing-title-av');
    this.titleE = this.model.translations.item('landing-title-e');
    this.titleVP = this.model.translations.item('landing-title-vp');

    this.titleAVShort = this.model.translations.item('landing-title-av-short');
    this.titleEShort = this.model.translations.item('landing-title-e-short');
    this.titleVPShort = this.model.translations.item('landing-title-vp-short');


    this.descriptionAV = this.model.translations.item('landing-description-av');
    this.descriptionE = this.model.translations.item('landing-description-e');
    this.descriptionVP = this.model.translations.item('landing-description-vp');

    let linkVO:TranslationVO = new TranslationVO('link','https://tools.csb.gov.lv/tea/lv/about','https://tools.csb.gov.lv/tea/en/about');
    this.linkAV = linkVO;
    this.linkE = linkVO;
    this.linkVP = linkVO;

    this.linkMore = this.model.translations.item('landing-link-more');

  }

  public onClick=(id:string):void=>{
    const url  = '/'+this.route.lang+'/map/'+this.route.year+'/'+this.model.M1_getRouteNameFromID('w')+'/'+this.model.M2_getRouteNameFromID(id)+'/territories-3/all/none/none';
    this.router.navigateByUrl(url);
  }
  public onReadMoreClick=(url:string):void=>{
    this.router.ngOnDestroy();
    window.location.href = url;
  }

  @HostListener('window:resize', ['$event'])
  onHostResize(event:Event){
    this.onResize();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange(event:Event){
    this.onResize();
  }
  private onResize=():void=> {
    const ww:number = window.innerWidth;
    const hh:number = document.body.offsetHeight; // window.innerHeight;
    this.mobile = ww<=this.model.MOBILE_SIZE?true:false;
    this.horizontal = ww>hh;

    const th:number = 60;
    let LH:number;
    let MH:number;

      if(!this.landingText || !this.landingMap){
        return;
      }
      this.landingText.element.nativeElement.style.height = 'auto';
      LH = this.landingText.element.nativeElement.offsetHeight;
      MH = hh - LH - th;
      MH = MH>=200?MH:200;
      this.landingMap.element.nativeElement.style.height = MH+'px';


      if(this.resized==false){
        this.landingText.element.nativeElement.animate(this.getAnimation(), this.getAnimationTiming(100));
        this.landingMap.element.nativeElement.animate(this.getAnimation(), this.getAnimationTiming(600));
      }
      this.resized = true;
  }
  getAnimation() {
    return [
      { opacity: '0' },
      { opacity: '0.2' },
      { opacity: '0.8' },
      { opacity: '1' },
    ];
  }

  getAnimationTiming(value:number) {
    return {
      duration: value,
      iterations: 1,
    };
  }

}

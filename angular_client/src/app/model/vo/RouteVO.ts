export class RouteVO{


    public M1:string;
    public M2:string;
    public M3:string;
    public M4:string;
    public T1:string;
    public T2:string;
    public VIZ:number;

    public year:number;
    public lang:string;

    public view:string='';

    constructor(view:string, lang:string, M1:string='', M2:string='', M3:string='', M4:string='', T1:string='', T2:string='', year:number=-1){
        this.view = view;
        this.lang = lang;

        this.M1 = M1;
        this.M2 = M2;
        this.M3 = M3;
        this.M4 = M4;
        this.T1 = T1;
        this.T2 = T2;
        this.VIZ = this.generateVizType();
        this.year = year;

    }
    private generateVizType():number{
      let type:number = -1;
      if(this.M3 === 'none' && this.M4 === 'none' && this.T2==='all'){
        // circles
        type = 1;
      }else if(this.M3 === 'none' && this.M4 === 'none' && this.T2!=='all'){
        // circles-region
        type = 2;
      }else if(this.M3 !== 'none' && this.T2==='all'){
        // circles-sectors
        type = 3;
      }else if(this.M3 !== 'none' && this.T2!=='all'){
        // circles-sectors-region
        type = 4;
      }
      return type;
    }
    public isEqual(route:RouteVO):boolean{
      return this.view+','+this.M1+','+this.M2+','+this.M3+','+this.M4+','+this.T1+','+this.T2+','+this.VIZ+','+this.year+','+this.lang ===
        route.view+','+route.M1+','+route.M2+','+route.M3+','+route.M4+','+route.T1+','+route.T2+','+route.VIZ+','+route.year+','+route.lang;
    }
    public isLangChangedOnly(route:RouteVO):boolean{
      const one:string = this.view+','+this.M1+','+this.M2+','+this.M3+','+this.M4+','+this.T1+','+this.T2+','+this.VIZ+','+this.year;
      const two:string = route.view+','+route.M1+','+route.M2+','+route.M3+','+route.M4+','+route.T1+','+route.T2+','+route.VIZ+','+route.year;
      return  one===two && this.lang!==route.lang;
    }
    public clone():RouteVO{
      return new RouteVO(this.view,this.lang, this.M1, this.M2, this.M3, this.M4, this.T1, this.T2, this.year);
    }
    public toString():string{
      const str:string =
            'view: '+this.view+'\n'+
            'lang: '+this.lang+'\n'+
            'M1: '+this.M1+'\n'+
            'M2: '+this.M2+'\n'+
            'M3: '+this.M3+'\n'+
            'M4: '+this.M4+'\n'+
            'T1: '+this.T1+'\n'+
            'T2: '+this.T2+'\n'+
            'VIZ: '+this.VIZ+'\n'+
            'year: '+this.year+'\n';
      return str;
    }

}

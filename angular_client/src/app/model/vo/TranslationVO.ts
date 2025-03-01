
export class TranslationVO{


    public id:string='';
    public name_lv:string;
    public name_en:string;
    public name_lv_mod:string;
    public name_en_mod:string;

    private _lang:string = 'lv';

    public used:boolean = true;
    public html:boolean = false;

    constructor(id:string, value_lv:string, value_en:string, used:boolean = true, html:boolean = false){
        this.id = id;

        this.name_lv = value_lv.replace(/—/g, '-');
        this.name_en = value_en.replace(/—/g, '-');

        this.name_lv = this.name_lv.replace(/&apos;/g, "'");
        this.name_en = this.name_en.replace(/&apos;/g, "'");

        this.name_lv = this.name_lv.replace(/ /g, " ");
        this.name_en = this.name_en.replace(/ /g, " ");

        this.name_lv_mod = this.name_lv;
        this.name_en_mod = this.name_en;

        this.used = used;
        this.html = html;
    }
    public replaceString(str:string,value_lv:string,value_en:string=''):void{
      this.name_lv_mod = this.name_lv.replace(str,value_lv);
      this.name_en_mod = this.name_en.replace(str,value_en==''?value_lv:value_en);
    }
    public clone():TranslationVO{
      const vo:TranslationVO = new TranslationVO(this.id, this.name_lv, this.name_en,this.used,this.html);
            vo.name_lv = this.name_lv;
            vo.name_en = this.name_en;
            vo.name_lv_mod = this.name_lv_mod;
            vo.name_en_mod = this.name_en_mod;
            vo.lang = this.lang;
      return vo;
    }
    public get name():string{
      return this._lang==='lv'? this.name_lv_mod:this.name_en_mod;
    }
    public get lang(): string {
      return this._lang;
    }
    public set lang(value: string) {
      this._lang = value;
    }
}

import {TranslationVO} from './TranslationVO';

export class RegionNameVO{

    public code:string;
    public name:TranslationVO;
    public name_short:TranslationVO;

    constructor(code:string,name:TranslationVO,name_short:TranslationVO){
        this.code = code;
        this.name = name;
        this.name_short = name_short;
    }

}

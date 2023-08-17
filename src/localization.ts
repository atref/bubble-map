import { httpRequest } from '@grapecity/wijmo';

let mapCountries:any = undefined;
let mapUI:any = undefined;

export function getCountryName(code:string, name:string) : string {
    let lname = mapCountries ? mapCountries[code] : name;
    return lname ? lname : name;
}

export function getName(name:string) : string {
  let lname = mapUI ? mapUI[name] : name;
  return lname ? lname : name;
}

export function getLanguages() {
  return 'AR,BN,DE,EN,ES,FA,FR,EL,HE,HI,HU,ID,IT,JA,KO,NL,PL,PT,RU,SV,TR,UK,UR,VI,ZH,ZHT'.split(',');
}

export function setLanguage(code:string, callback?:Function) {
  if(code !== 'EN') {
    const file = `cultures/country-names.${code.toLocaleLowerCase()}.json`;
    httpRequest(file, {
      success: xhr => {
        mapCountries = JSON.parse(xhr.responseText);
        if(callback) {
          callback();
        }
      },
      error: () => {
        mapCountries = undefined;
        if(callback) {
          callback();
        }
      }
    });

    const fileUI = `cultures/ui.${code.toLocaleLowerCase()}.json`;
    httpRequest(fileUI, {
      success: xhr => {
        mapUI = JSON.parse(xhr.responseText);
        if(callback) {
          callback();
        }
      },
      error: () => {
        mapUI = undefined;
        if(callback) {
          callback();
        }
      }
    });
  } else {
    mapUI = undefined;
    mapCountries = undefined;
    if(callback) {
      callback();
    }
  }
}
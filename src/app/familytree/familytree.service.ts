import { Injectable } from '@angular/core';
import { FamilyMenu, FamilyTree } from './familytree';
import { GoogleSheetResult } from '../species/species';
import { EMPTY, Observable, map, of, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class FamilyTreeService {
  _url = "https://sheets.googleapis.com/v4/spreadsheets/1HYJKxmv4lpKJsYdGJRusaM9ZlIJ9ksLPShxNDN9_tqk/values/Sheet2?alt=json&key=AIzaSyCS8VedcfE96MslUdLY34iSG0GSMdOaWu8";

  _familyTree$: Observable<FamilyTree> = EMPTY;

  constructor(private http: HttpClient){}

  getFamilyMenu(): Observable<FamilyMenu[]>{
    if(this._familyTree$ === EMPTY){
      this._familyTree$ = this.getFamiliesFromGoogle()
    }

    return this._familyTree$.pipe(
      map((clade: FamilyTree) => {
        let menus: FamilyMenu[] = []
        return this.findMainAndChildren(clade, menus)
      })
    );
  }

  findMainAndChildren(clade: FamilyTree, menus: FamilyMenu[]): FamilyMenu[]{
    if( clade.rank == 'Family' && clade.extinct == 'FALSE'){
      if(menus.length > 0){
        menus[menus.length - 1].children.push({
          main: clade.main,
          latin: clade.latin,
          english: clade.english,
          dutch: clade.dutch,
          picNum: clade.picNum
        })
      }
      return menus;
    } else if( clade.isMain == 'TRUE' ){
      menus.push({
        name: clade.name, 
        children: []
      });
    }
    if (clade.children != null){
      for(var i=0; i < clade.children.length; i++){
        menus = this.findMainAndChildren(clade.children[i], menus);
      }
    }

    return menus;
  }

  getFamilies(): Observable<FamilyTree> {
    if(this._familyTree$ === EMPTY){
      this._familyTree$ = this.getFamiliesFromGoogle()
    }

    return this._familyTree$;
  }
  
  getFamiliesFromGoogle(): Observable<FamilyTree> {
    return this.http.get<GoogleSheetResult>(this._url).pipe(
      map((data: GoogleSheetResult) => {
        var main = '';
        
        var idToFamilyMap = new Map<string, FamilyTree>(); //Keeps track of nodes using id as key, for fast lookup
        
        var root = {} as FamilyTree;

        data.values
          .slice(1, data.values.length)
          .map(function(entry: string){
            if(entry[6] == 'TRUE'){
              main = entry[1];
            }
            let latin = '';
            if(entry[5] == 'TRUE'){
              latin = '† '+ entry[1];
            } else {
              latin = entry[1];
            }
            return {
              main: main,
              parent: entry[0],
              name: entry[1],
              rank: entry[2],
              english: entry[3],
              dutch: entry[4],
              extinct: entry[5],
              isMain: entry[6],
              seen: entry[7],
              picNum: entry[8],
              children: [],
              latin: latin
            };
          })
          .forEach(function(entry:FamilyTree) {
        
           //add an entry for this node to the map so that any future children can lookup the parent
          idToFamilyMap.set(entry.name, entry);

          if(entry.parent == ''){
            root = entry;
          } else {
            //This node has a parent, so let's look it up using the id
            let parentNode = idToFamilyMap.get(entry.parent);

            //Let's add the current node as a child of the parent node.
            if(parentNode){
              if(!parentNode.children){parentNode.children = []}
              parentNode.children.push(entry);    
            }
          }
        });
        return root;
      }),
      shareReplay(1)
    )
  }
}

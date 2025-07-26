import { Injectable } from '@angular/core';
import { Observable, EMPTY, of, map, switchMap, shareReplay } from 'rxjs';
import { GoogleSheetResult, Species } from './species';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class SpeciesService {
  _url = "https://sheets.googleapis.com/v4/spreadsheets/1CTyaVZ-_c5zwPpF35fOniYguCvF4R06IkAk7SR4qfYs/values/Main?alt=json&key=AIzaSyCS8VedcfE96MslUdLY34iSG0GSMdOaWu8";

  _species$: Observable<Species> = EMPTY;

  constructor(private http: HttpClient) { }

  getSpeciesFromGoogle(): Observable<Species> {
    return this.http.get<GoogleSheetResult>(this._url).pipe(
      map((data: GoogleSheetResult) => {
        var idToSpeciesMap = new Map<string, Species>(); //Keeps track of nodes using id as key, for fast lookup

        var root = {
          name: "Aves",
          rank: "Class",
        } as Species;

        idToSpeciesMap.set(root.name, root);

        data.values
          .slice(1, data.values.length)
          .map(function (entry: string) {

            const range = entry[19];
            let rangeShort = '';
            let rangeDescr = '';
            if (range) {
              rangeShort = range.slice(0, range.indexOf(':'));
              rangeDescr = range.slice(range.indexOf(':') + 1)
            }

            return {
              rank: entry[0],
              parent: entry[2],
              name: entry[3],
              genus: entry[10],
              species: entry[12],
              englishName: entry[14],
              nederlands: entry[15],
              category: entry[16],
              authority: entry[17],
              notes: entry[18],
              rangeShort: rangeShort,
              rangeDescription: rangeDescr,
              picture: entry[21],
              asset: entry[22],
              ebirdCode: entry[23],
              children: [],
              countExtant: 0,
              countExtinct: 0,
              countFossil: 0
            };
          })
          .filter((el: Species) => el.category !== 'FO' /*&& el.rank !== 'ssp' && el.rank !== 'group (monotypic)' && el.rank !== 'group (polytypic)'*/)
          .forEach(function (entry: Species) {

            //add an entry for this node to the map so that any future children can lookup the parent
            idToSpeciesMap.set(entry.name, entry);

            //This node has a parent, so let's look it up using the id
            var parentNode = idToSpeciesMap.get(entry.parent);

            // If this is a subspecies, add its rangeDescription to the nearest species-level ancestor
            if (entry.rank === 'ssp' || entry.rank == 'group (monotypic)') {
              let current = parentNode;
              while (current && current.rank !== 'species') {
                current = idToSpeciesMap.get(current.parent || '');
              }
              if (current) {
                const sspRange = entry.rangeDescription || '';
                if (sspRange.trim()) {
                  if (!current.rangeDescription) {
                    current.rangeDescription = sspRange;
                  } else {
                    current.rangeDescription += `; ${entry.name} : ${sspRange}`;
                  }
                }
              }
            }

            if (parentNode) {
              //Let's add the current node as a child of the parent node.
              if (!parentNode.children) { parentNode.children = [] }
              parentNode.children.push(entry);
            }
          });
        this.countChildren(root);
        return root;
      }),
      shareReplay(1)
    )
  }

  getSpeciesByMain(id: string): Observable<Species> {
    if (this._species$ === EMPTY) {
      this._species$ = this.getSpeciesFromGoogle()
    }

    return this._species$.pipe(
      switchMap((result: Species) => {
        return of(this.searchTreeForClade(result, id)!)
      }));
  }

  searchTreeForClade(species: Species | null, match: string): Species | null {
    if (!species) {
      return null;
    }
    if (species.name == match) {
      return species;
    } else if (species.children != null) {
      var i;
      var result = null;
      for (i = 0; result == null && i < species.children.length; i++) {
        result = this.searchTreeForClade(species.children[i], match);
      }
      return result;
    }
    return null;
  }

  countChildren(species: Species) {
    if (species.rank == 'species') {
      if (species.category == 'FO') {
        species.countFossil = 1
      } else if (species.category == 'EX') {
        species.countExtinct = 1
      } else {
        species.countExtant = 1
      }
    } else {
      for (let i = 0; i < species.children.length; i++) {
        this.countChildren(species.children[i]);
        species.countFossil += species.children[i].countFossil;
        species.countExtinct += species.children[i].countExtinct;
        species.countExtant += species.children[i].countExtant;
      }
    }
  }
}
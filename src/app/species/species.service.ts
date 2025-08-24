import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { GoogleSheetResult, Species } from './species';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SpeciesService {
  _url = "https://sheets.googleapis.com/v4/spreadsheets/1CTyaVZ-_c5zwPpF35fOniYguCvF4R06IkAk7SR4qfYs/values/Main?alt=json&key=AIzaSyCS8VedcfE96MslUdLY34iSG0GSMdOaWu8";

  private _species$: Observable<Species> | null = null;

  constructor(private http: HttpClient) { }

  getSpeciesFromGoogle(): Observable<Species> {
    const COL = {
      RANK: 0,
      PARENT: 2,
      NAME: 3,
      GENUS: 10,
      SPECIES: 12,
      ENGLISH_NAME: 14,
      DUTCH_NAME: 15,
      CATEGORY: 16,
      CRETACEOUS: 17,
      PALEOCENE: 18,
      EOCENE: 19,
      OLIGOCENE: 20,
      MIOCENE: 21,
      PLIOCENE: 22,
      PLEISTOCENE: 23,
      HOLOCENE: 24,
      NOTES: 25,
      RANGE_SHORT: 26,
      RANGE_DESCRIPTION: 27,
      PICTURE: 28,
      ASSET: 29,
      EBIRD: 30,
      AUTHORITY: 31,
      PROTONYM: 32,
    };

    // Helper to find nearest species ancestor
    function findSpeciesAncestor(node: Species | undefined, map: Map<string, Species>): Species | undefined {
      while (node && node.rank !== 'species') {
        node = map.get(node.parent || '');
      }
      return node;
    }

    return this.http.get<GoogleSheetResult>(this._url).pipe(
      map((data: GoogleSheetResult) => {
        const idToSpeciesMap = new Map<string, Species>(); //Keeps track of nodes using id as key, for fast lookup

        const root = {
          name: "Aves",
          rank: "Class",
        } as Species;

        idToSpeciesMap.set(root.name, root);

        data.values
          .slice(1) // skip header row
          .map(function (entry: string) {
            return {
              rank: entry[COL.RANK],
              parent: entry[COL.PARENT],
              name: entry[COL.NAME],
              genus: entry[COL.GENUS],
              species: entry[COL.SPECIES],
              englishName: entry[COL.ENGLISH_NAME],
              nederlands: entry[COL.DUTCH_NAME],
              category: entry[COL.CATEGORY],
              authority: entry[COL.AUTHORITY],
              notes: entry[COL.NOTES],
              rangeShort: entry[COL.RANGE_SHORT],
              rangeDescription: entry[COL.RANGE_DESCRIPTION],
              picture: entry[COL.PICTURE],
              asset: entry[COL.ASSET],
              ebirdCode: entry[COL.EBIRD],
              children: [],
              countExtant: 0,
              countExtinct: 0,
              countFossil: 0
            } as Species;
          })
          .filter((el: Species) => el.category !== 'FO')
          .forEach((entry: Species) => {
            idToSpeciesMap.set(entry.name, entry);

            const parentNode = idToSpeciesMap.get(entry.parent);

            // Cumulate range info to species ancestor if this is ssp or group (monotypic)
            if (entry.rank === 'ssp' || entry.rank === 'group (monotypic)') {
              const speciesNode = findSpeciesAncestor(parentNode, idToSpeciesMap);
              const sspRange = entry.rangeDescription?.trim();
              if (speciesNode && sspRange) {
                const line = `<i>${entry.name}</i> : ${sspRange}`;
                speciesNode.rangeDescription = speciesNode.rangeDescription
                  ? speciesNode.rangeDescription + `<br> ` + line
                  : line;
              }
            }

            // Build tree
            if (parentNode) {
              parentNode.children ??= [];
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
    if (!this._species$) {
      this._species$ = this.getSpeciesFromGoogle();
    }

    return this._species$.pipe(
      map(root => {
        const match = this.searchTreeForClade(root, id);
        if (!match) {
          throw new Error(`Clade with id "${id}" not found`);
        }
        return match;
      })
    );
  }

  private searchTreeForClade(species: Species | null, match: string): Species | null {
    if (!species) {
      return null;
    }
    if (species.name === match) {
      return species;
    }
    if (species.children) {
      for (const child of species.children) {
        const found = this.searchTreeForClade(child, match);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private countChildren(species: Species) {
    species.countFossil = 0;
    species.countExtinct = 0;
    species.countExtant = 0;

    if (species.rank == 'species') {
      if (species.category === 'FO') {
        species.countFossil = 1
      } else if (species.category === 'EX') {
        species.countExtinct = 1
      } else {
        species.countExtant = 1
      }
    } else {
      for (const child of species.children) {
        this.countChildren(child);
        species.countFossil += child.countFossil;
        species.countExtinct += child.countExtinct;
        species.countExtant += child.countExtant;
      }
    }
  }
}
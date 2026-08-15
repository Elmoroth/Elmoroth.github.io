import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { GoogleSheetResult, Species } from './species';

const COL = {
  RANK: 0,
  PARENT: 2,
  NAME: 3,
  GENUS: 10,
  SPECIES: 12,
  ENGLISH_NAME: 14,
  DUTCH_NAME: 15,
  CATEGORY: 16,
  NOTES: 25,
  RANGE_SHORT: 26,
  RANGE_DESCRIPTION: 27,
  PICTURE: 28,
  ASSET: 29,
  EBIRD: 30,
  AUTHORITY: 31,
  PROTONYM: 32,
} as const;

@Injectable({
  providedIn: 'root',
})
export class SpeciesService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.speciesApiUrl;

  private species$?: Observable<Species>;

  getSpeciesFromGoogle(): Observable<Species> {
    return this.http.get<GoogleSheetResult>(this.url).pipe(
      map((data: GoogleSheetResult) => this.buildSpeciesTree(data.values ?? [])),
      shareReplay(1)
    );
  }

  getSpeciesByMain(id: string): Observable<Species> {
    if (!this.species$) {
      this.species$ = this.getSpeciesFromGoogle();
    }

    return this.species$.pipe(
      map((root) => {
        const match = this.searchTreeForClade(root, id);
        if (!match) {
          throw new Error(`Clade with id "${id}" not found`);
        }
        return match;
      })
    );
  }

  private buildSpeciesTree(rows: any[][]): Species {
    const idToSpeciesMap = new Map<string, Species>();

    const root: Species = {
      name: 'Aves',
      rank: 'Class',
      children: [],
      countExtant: 0,
      countExtinct: 0,
      countFossil: 0,
    };

    idToSpeciesMap.set(root.name, root);

    rows
      .slice(1)
      .map((entry: any[]) => ({
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
        countFossil: 0,
      } as Species))
      .filter((el) => el.category !== 'FO')
      .forEach((entry) => {
        idToSpeciesMap.set(entry.name, entry);

        const parentNode = entry.parent ? idToSpeciesMap.get(entry.parent) : undefined;

        if (entry.rank === 'ssp' || entry.rank === 'group (monotypic)') {
          const speciesNode = this.findSpeciesAncestor(parentNode, idToSpeciesMap);
          const sspRange = entry.rangeDescription?.trim();
          if (speciesNode && sspRange) {
            const line = `<i>${entry.name}</i> : ${sspRange}`;
            speciesNode.rangeDescription = speciesNode.rangeDescription
              ? `${speciesNode.rangeDescription}<br>${line}`
              : line;
          }
        }

        if (parentNode) {
          parentNode.children ??= [];
          parentNode.children.push(entry);
        }
      });

    this.countChildren(root);
    return root;
  }

  private findSpeciesAncestor(
    node: Species | undefined,
    map: Map<string, Species>
  ): Species | undefined {
    while (node && node.rank !== 'species') {
      node = node.parent ? map.get(node.parent) : undefined;
    }
    return node;
  }

  private searchTreeForClade(species: Species | null, match: string): Species | null {
    if (!species) return null;
    if (species.name === match) return species;

    if (species.children) {
      for (const child of species.children) {
        const found = this.searchTreeForClade(child, match);
        if (found) return found;
      }
    }
    return null;
  }

  private countChildren(species: Species): void {
    species.countFossil = 0;
    species.countExtinct = 0;
    species.countExtant = 0;

    if (species.rank === 'species') {
      if (species.category === 'FO') {
        species.countFossil = 1;
      } else if (species.category === 'EX') {
        species.countExtinct = 1;
      } else {
        species.countExtant = 1;
      }
    } else if (species.children) {
      for (const child of species.children) {
        this.countChildren(child);
        species.countFossil += child.countFossil ?? 0;
        species.countExtinct += child.countExtinct ?? 0;
        species.countExtant += child.countExtant ?? 0;
      }
    }
  }
}
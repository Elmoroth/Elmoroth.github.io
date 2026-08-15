import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { GoogleSheetResult, Species } from './species';

const COL = {
  RANK: 0, PARENT: 2, NAME: 3, GENUS: 10, SPECIES: 12,
  ENGLISH_NAME: 14, DUTCH_NAME: 15, CATEGORY: 16,
  CRETACEOUS: 17, PALEOCENE: 18, EOCENE: 19, OLIGOCENE: 20,
  MIOCENE: 21, PLIOCENE: 22, PLEISTOCENE: 23, HOLOCENE: 24,
  NOTES: 25, RANGE_SHORT: 26, RANGE_DESCRIPTION: 27,
  PICTURE: 28, ASSET: 29, EBIRD: 30, AUTHORITY: 31, PROTONYM: 32,
} as const;

export interface EpochFilters {
  showFossils: boolean;
  epochs: {
    cretaceous: boolean; paleocene: boolean; eocene: boolean;
    oligocene: boolean; miocene: boolean; pliocene: boolean;
    pleistocene: boolean; holocene: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.speciesApiUrl;

  // Cache the fully constructed, unfiltered tree structure
  private cachedTree$?: Observable<Species>;

  /**
   * Fetches data ONCE and builds the complete tree.
   * Caches the resulting root object.
   */
  private getBaseTree(): Observable<Species> {
    if (!this.cachedTree$) {
      this.cachedTree$ = this.http.get<GoogleSheetResult>(this.url).pipe(
        map(data => this.buildBaseTree(data.values ?? [])),
        shareReplay(1)
      );
    }
    return this.cachedTree$;
  }

  /**
   * Returns a deeply filtered clone of the specific clade requested.
   */
  getSpeciesByMain(id: string, filters?: EpochFilters): Observable<Species> {
    return this.getBaseTree().pipe(
      map(root => {
        const match = this.searchTreeForClade(root, id);
        if (!match) throw new Error(`Clade with id "${id}" not found`);
        
        // Deep clone & filter only the requested subset
        const filteredClade = this.cloneAndFilterSubtree(match, filters);
        
        if (filteredClade) {
           this.countChildren(filteredClade);
        }
        
        return filteredClade || match; // Fallback to raw match if everything is filtered out
      })
    );
  }

  /**
   * Heavy Lifting: Runs exactly ONCE to parse raw Google data and link parents/children.
   */
  private buildBaseTree(rows: any[][]): Species {
    const idToSpeciesMap = new Map<string, Species>();

    const root: Species = {
      name: 'Aves', rank: 'Class', children: [],
      countExtant: 0, countExtinct: 0, countFossil: 0,
    };
    idToSpeciesMap.set(root.name, root);

    // 1. First Pass: Create node objects
    const allNodes = rows.slice(1).map(entry => ({
      rank: entry[COL.RANK],
      parent: entry[COL.PARENT],
      name: entry[COL.NAME],
      genus: entry[COL.GENUS],
      species: entry[COL.SPECIES],
      englishName: entry[COL.ENGLISH_NAME],
      nederlands: entry[COL.DUTCH_NAME],
      category: entry[COL.CATEGORY],
      cretaceous: this.isTrueCell(entry[COL.CRETACEOUS]),
      paleocene: this.isTrueCell(entry[COL.PALEOCENE]),
      eocene: this.isTrueCell(entry[COL.EOCENE]),
      oligocene: this.isTrueCell(entry[COL.OLIGOCENE]),
      miocene: this.isTrueCell(entry[COL.MIOCENE]),
      pliocene: this.isTrueCell(entry[COL.PLIOCENE]),
      pleistocene: this.isTrueCell(entry[COL.PLEISTOCENE]),
      holocene: this.isTrueCell(entry[COL.HOLOCENE]),
      authority: entry[COL.AUTHORITY],
      notes: entry[COL.NOTES],
      rangeShort: entry[COL.RANGE_SHORT],
      rangeDescription: entry[COL.RANGE_DESCRIPTION],
      picture: entry[COL.PICTURE],
      asset: entry[COL.ASSET],
      ebirdCode: entry[COL.EBIRD],
      children: [],
      countExtant: 0, countExtinct: 0, countFossil: 0,
    } as Species));

    // 2. Second Pass: Build relationships and map ranges
    allNodes.forEach(entry => {
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

    return root;
  }

  /**
   * Deep clones the tree recursively, omitting nodes that fail the filter.
   */
  private cloneAndFilterSubtree(node: Species, filters?: EpochFilters): Species | null {
    if (!this.shouldIncludeSpecies(node, filters)) {
      return null;
    }

    const clonedNode = { ...node, children: [] as Species[] };

    if (node.children) {
      for (const child of node.children) {
        const filteredChild = this.cloneAndFilterSubtree(child, filters);
        if (filteredChild) {
          clonedNode.children.push(filteredChild);
        }
      }
    }

    // Optional: If an intermediate node (like a family) has 0 surviving children after filtering, 
    // and is not a leaf node (species/subspecies), you might want to return null to hide empty folders.
    // if (clonedNode.rank !== 'species' && clonedNode.rank !== 'ssp' && clonedNode.children.length === 0) {
    //   return null; 
    // }

    return clonedNode;
  }

  private shouldIncludeSpecies(species: Species, filters?: EpochFilters): boolean {
    if (species.category !== 'FO') return true;
    if (!filters || !filters.showFossils) return false;

    const e = filters.epochs;
    return (
      (e.cretaceous && Boolean(species.cretaceous)) ||
      (e.paleocene && Boolean(species.paleocene)) ||
      (e.eocene && Boolean(species.eocene)) ||
      (e.oligocene && Boolean(species.oligocene)) ||
      (e.miocene && Boolean(species.miocene)) ||
      (e.pliocene && Boolean(species.pliocene)) ||
      (e.pleistocene && Boolean(species.pleistocene)) ||
      (e.holocene && Boolean(species.holocene))
    );
  }

  private findSpeciesAncestor(node: Species | undefined, map: Map<string, Species>): Species | undefined {
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
      if (species.category === 'FO') species.countFossil = 1;
      else if (species.category === 'EX') species.countExtinct = 1;
      else species.countExtant = 1;
    } else if (species.children) {
      for (const child of species.children) {
        this.countChildren(child);
        species.countFossil += child.countFossil ?? 0;
        species.countExtinct += child.countExtinct ?? 0;
        species.countExtant += child.countExtant ?? 0;
      }
    }
  }

  private isTrueCell(val: any): boolean {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const clean = val.trim().toUpperCase();
      return clean === 'TRUE' || clean === '1' || clean === 'X';
    }
    if (typeof val === 'number') return val === 1;
    return false;
  }
}
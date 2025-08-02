import { Injectable } from '@angular/core';
import { FamilyMenu, FamilyTree } from './familytree';
import { GoogleSheetResult } from '../species/species';
import { Observable, map, shareReplay, defer } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class FamilyTreeService {
  private readonly _url = "https://sheets.googleapis.com/v4/spreadsheets/1HYJKxmv4lpKJsYdGJRusaM9ZlIJ9ksLPShxNDN9_tqk/values/Sheet2?alt=json&key=AIzaSyCS8VedcfE96MslUdLY34iSG0GSMdOaWu8";

  // Cold observable – only executes when subscribed
  private _familyTree$: Observable<FamilyTree> = defer(() => this.getFamiliesFromGoogle()).pipe(
    shareReplay(1)
  );

  private readonly EMPTY_TREE: FamilyTree = {
    main: '', parent: '', name: '', rank: '',
    english: '', dutch: '', extinct: '',
    isMain: '', seen: '', picNum: '', picName: '', children: [], latin: ''
  };

  constructor(private http: HttpClient) { }

  getFamilyMenu(): Observable<FamilyMenu[]> {
    return this._familyTree$.pipe(
      map((clade: FamilyTree) => {
        let menus: FamilyMenu[] = []
        return this.findMainAndChildren(clade, menus)
      })
    );
  }

  findMainAndChildren(clade: FamilyTree, menus: FamilyMenu[]): FamilyMenu[] {
    if (clade.rank == 'Family' && clade.extinct == 'FALSE') {
      if (menus.length > 0) {
        menus[menus.length - 1].children.push({
          main: clade.main,
          latin: clade.latin,
          english: clade.english,
          dutch: clade.dutch,
          picNum: clade.picNum
        })
      }
      return menus;
    } else if (clade.isMain == 'TRUE') {
      menus.push({
        name: clade.name,
        children: []
      });
    }
    if (clade.children != null) {
      for (var i = 0; i < clade.children.length; i++) {
        menus = this.findMainAndChildren(clade.children[i], menus);
      }
    }

    return menus;
  }

  getFamilies(): Observable<FamilyTree> {
    return this._familyTree$;
  }

  getPartialTree(name: string): Observable<FamilyTree> {
    return this._familyTree$.pipe(
      map((clade: FamilyTree) => {
        const path = this.findPathToNode(name, clade);
        if (!path) return this.EMPTY_TREE;

        const ancestorLevel = this.findClimbUntilNextMain(path);
        return this.rebuildSubtree(path, ancestorLevel);
      })
    );
  }

  private findPathToNode(name: string, node: FamilyTree, path: FamilyTree[] = []): FamilyTree[] | null {
    const newPath = [...path, node];

    if (node.name === name) {
      return newPath;
    }

    if (node.children) {
      for (const child of node.children) {
        const result = this.findPathToNode(name, child, newPath);
        if (result) return result;
      }
    }

    return null;
  }
  private findClosestMainDownOrUp(path: FamilyTree[]): number {
    const leaf = path[path.length - 1];

    const descendantMain = this.findClosestMainDownward(leaf);
    if (descendantMain) {
      // Vind het pad tot aan die main, en gebruik dat als basis
      const newPath = this.findPathToNode(descendantMain.name, path[0]);
      if (newPath) {
        // Start rebuild vanaf deze node
        return newPath.length - 1;
      }
    }

    // Anders gebruik klassieke omhoog-klim-methode
    return this.findClimbUntilNextMain(path);
  }

  private findClosestMainDownward(node: FamilyTree): FamilyTree | null {
    if (node.isMain === 'TRUE') return node;

    for (const child of node.children || []) {
      const result = this.findClosestMainDownward(child);
      if (result) return result;
    }

    return null;
  }

  private findClimbUntilNextMain(path: FamilyTree[]): number {
    // Fallback: als er geen zijtak met main gevonden wordt
    let fallbackIndex = path.length - 1;

    for (let i = path.length - 2; i >= 0; i--) {
      const parent = path[i];
      const child = path[i + 1];
      const index = parent.children.findIndex(c => c.name === child.name);

      // Check of deze node zelf een isMain is — als fallback
      if (parent.isMain === "TRUE") {
        fallbackIndex = i;
      }

      // Kijk naar siblings ná deze node
      const siblingsAfter = parent.children.slice(index + 1);

      for (const sibling of siblingsAfter) {
        if (this.subtreeContainsMain(sibling)) {
          return i; // Stop hier, main zit in zijtak
        }
      }
    }

    return fallbackIndex; // Geen zijtak-main gevonden, gebruik dichtstbijzijnde main in pad
  }

  /*
    private findClimbUntilNextMain(path: FamilyTree[]): number {
      // Start from the node's parent
      for (let i = path.length - 2; i >= 0; i--) {
        const parent = path[i];
        const child = path[i + 1];
        const index = parent.children.findIndex(c => c.name === child.name);
  
        // Look at siblings AFTER the matched node
        const siblingsAfter = parent.children.slice(index + 1);
  
        for (const sibling of siblingsAfter) {
          if (this.subtreeContainsMain(sibling)) {
            return i; // Stop climbing here
          }
        }
      }
  
      return 0; // No main found: return root
    }
      */

  private subtreeContainsMain(node: FamilyTree): boolean {
    if (node.isMain === "TRUE") return true;

    return node.children?.some(c => this.subtreeContainsMain(c)) ?? false;
  }
  private rebuildSubtree(path: FamilyTree[], startLevel: number): FamilyTree {
    let subtree = this.cloneFully(path[path.length - 1]); // The target node

    // Rebuild from bottom up to startLevel
    for (let i = path.length - 2; i >= startLevel; i--) {
      const current = path[i];
      const child = subtree;
      subtree = {
        ...current,
        children: current.children.map(c =>
          c.name === child.name ? child : this.cloneUntilIsMain(c)
        )
      };
    }

    return subtree;
  }
  private cloneFully(clade: FamilyTree): FamilyTree {
    return {
      ...clade,
      children: clade.children?.map(c => this.cloneFully(c)) ?? []
    };
  }
  private cloneUntilIsMain(clade: FamilyTree): FamilyTree {
    // Stop recursion if ismain is "TRUE"
    if (clade.isMain === "TRUE" || clade.rank == "Order") {
      return { ...clade, children: [] };
    }

    return {
      ...clade,
      children: clade.children?.map(c => this.cloneUntilIsMain(c)) ?? []
    };
  }

  private getFamiliesFromGoogle(): Observable<FamilyTree> {
    return this.http.get<GoogleSheetResult>(this._url).pipe(
      map((data: GoogleSheetResult) => {
        const idToFamilyMap = new Map<string, FamilyTree>();
        const tempEntries: FamilyTree[] = [];

        // Step 1: Convert sheet rows to FamilyTree objects (without main yet)
        data.values.slice(1).forEach((entry: string) => {
          const latin = entry[5] === 'TRUE' ? '† ' + entry[1] : entry[1];
          const node: FamilyTree = {
            main: '',
            parent: entry[0],
            name: entry[1],
            rank: entry[2],
            english: entry[3],
            dutch: entry[4],
            extinct: entry[5],
            isMain: entry[6],
            seen: entry[7],
            picNum: entry[8],
            picName: entry[9],
            children: [],
            latin: latin
          };

          tempEntries.push(node);
          idToFamilyMap.set(node.name, node);
        });

        let root: FamilyTree = {} as FamilyTree;

        // Step 2: Build tree
        tempEntries.forEach(entry => {
          if (entry.parent === '') {
            root = entry;
          } else {
            const parent = idToFamilyMap.get(entry.parent);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(entry);
            }
          }
        });

        // Step 3: Propagate `main` downwards from each "isMain" node
        const propagateMain = (node: FamilyTree, inheritedMain: string) => {
          let newMain = inheritedMain;

          if (node.isMain === 'TRUE') {
            newMain = node.name;
          }

          // Als er nog geen main is en deze node is zelf geen main,
          // zoek dan in de eigen subtree naar eerste isMain — maar gebruik dit enkel voor deze tak.
          if (!newMain) {
            const findFirstChildMain = (children: FamilyTree[]): string | null => {
              for (const child of children) {
                if (child.isMain === 'TRUE') {
                  return child.name;
                }
                const deeper = findFirstChildMain(child.children || []);
                if (deeper) return deeper;
              }
              return null;
            };
            newMain = findFirstChildMain(node.children || '') || '';
          }

          node.main = newMain;

          // Geef het originele `node.main` (niet fallback!) door aan children
          const nextInheritedMain = node.isMain === 'TRUE' ? node.name : inheritedMain;

          node.children?.forEach(child => propagateMain(child, nextInheritedMain));
        };

        propagateMain(root, '');

        return root;
      }),
      shareReplay(1)
    );
  }
}
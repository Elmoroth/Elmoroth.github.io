import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { FamilyMenu, FamilyTree } from './familytree';
import { GoogleSheetResult } from '../species/species';

// Column indices for the Google Sheet response
const COL = {
  PARENT: 0,
  NAME: 1,
  RANK: 2,
  ENGLISH: 3,
  DUTCH: 4,
  EXTINCT: 5,
  IS_MAIN: 6,
  SEEN: 7,
  PIC_NUM: 8,
  PIC_NAME: 9,
} as const;

const EMPTY_TREE: FamilyTree = {
  main: '',
  parent: '',
  name: '',
  rank: '',
  english: '',
  dutch: '',
  extinct: '',
  isMain: '',
  seen: '',
  picNum: '',
  picName: '',
  children: [],
  latin: '',
};

@Injectable({
  providedIn: 'root',
})
export class FamilyTreeService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.familytreeApiUrl;

  private familyTree$?: Observable<FamilyTree>;

  /** Returns the cached tree observable or initiates a cold request */
  getFamilies(): Observable<FamilyTree> {
    if (!this.familyTree$) {
      this.familyTree$ = this.getFamiliesFromGoogle();
    }
    return this.familyTree$;
  }

  getFamilyMenu(): Observable<FamilyMenu[]> {
    return this.getFamilies().pipe(
      map((clade) => this.buildMenuStructure(clade))
    );
  }

  getPartialTree(name: string): Observable<FamilyTree> {
    return this.getFamilies().pipe(
      map((clade) => {
        const path = this.findPathToNode(name, clade);
        if (!path) return EMPTY_TREE;

        const ancestorLevel = this.findClimbUntilNextMain(path);
        return this.rebuildSubtree(path, ancestorLevel);
      })
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                          Menu Building Helpers                             */
  /* -------------------------------------------------------------------------- */

  private buildMenuStructure(root: FamilyTree): FamilyMenu[] {
    const menus: FamilyMenu[] = [];
    let currentMenu: FamilyMenu | null = null;

    const traverse = (node: FamilyTree): void => {
      if (node.isMain === 'TRUE') {
        currentMenu = { name: node.name, children: [] };
        menus.push(currentMenu);
      }

      if (node.rank === 'Family' && node.extinct === 'FALSE' && currentMenu) {
        currentMenu.children.push({
          main: node.main,
          latin: node.latin,
          english: node.english,
          dutch: node.dutch,
          picNum: node.picNum,
        });
      }

      node.children?.forEach((child) => traverse(child));
    };

    traverse(root);
    return menus;
  }

  /* -------------------------------------------------------------------------- */
  /*                          Subtree Navigation Helpers                       */
  /* -------------------------------------------------------------------------- */

  private findPathToNode(
    name: string,
    node: FamilyTree,
    path: FamilyTree[] = []
  ): FamilyTree[] | null {
    const currentPath = [...path, node];

    if (node.name === name) {
      return currentPath;
    }

    if (node.children) {
      for (const child of node.children) {
        const result = this.findPathToNode(name, child, currentPath);
        if (result) return result;
      }
    }

    return null;
  }

  private findClimbUntilNextMain(path: FamilyTree[]): number {
    let fallbackIndex = path.length - 1;

    for (let i = path.length - 2; i >= 0; i--) {
      const parent = path[i];
      const child = path[i + 1];
      const index = parent.children?.findIndex((c) => c.name === child.name) ?? -1;

      if (parent.isMain === 'TRUE') {
        fallbackIndex = i;
      }

      if (index !== -1 && parent.children) {
        const siblingsAfter = parent.children.slice(index + 1);
        for (const sibling of siblingsAfter) {
          if (this.subtreeContainsMain(sibling)) {
            return i;
          }
        }
      }
    }

    return fallbackIndex;
  }

  private subtreeContainsMain(node: FamilyTree): boolean {
    if (node.isMain === 'TRUE') return true;
    return node.children?.some((c) => this.subtreeContainsMain(c)) ?? false;
  }

  private rebuildSubtree(path: FamilyTree[], startLevel: number): FamilyTree {
    let subtree = this.cloneFully(path[path.length - 1]);

    for (let i = path.length - 2; i >= startLevel; i--) {
      const current = path[i];
      const child = subtree;
      subtree = {
        ...current,
        children: (current.children ?? []).map((c) =>
          c.name === child.name ? child : this.cloneUntilIsMain(c)
        ),
      };
    }

    return subtree;
  }

  private cloneFully(clade: FamilyTree): FamilyTree {
    return {
      ...clade,
      children: clade.children?.map((c) => this.cloneFully(c)) ?? [],
    };
  }

  private cloneUntilIsMain(clade: FamilyTree): FamilyTree {
    if (clade.isMain === 'TRUE' || clade.rank === 'Order') {
      return { ...clade, children: [] };
    }

    return {
      ...clade,
      children:
        clade.children
          ?.filter((c) => c.extinct === 'FALSE')
          .map((c) => this.cloneUntilIsMain(c)) ?? [],
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                          Data Fetching & Parsing                           */
  /* -------------------------------------------------------------------------- */

  private getFamiliesFromGoogle(): Observable<FamilyTree> {
    return this.http.get<GoogleSheetResult>(this.url).pipe(
      map((data: GoogleSheetResult) => {
        const idToFamilyMap = new Map<string, FamilyTree>();
        const tempEntries: FamilyTree[] = [];

        // 1. Map raw sheet rows to FamilyTree objects
        (data.values ?? []).slice(1).forEach((entry: any[]) => {
          const isExtinct = entry[COL.EXTINCT] === 'TRUE';
          const name = entry[COL.NAME] ?? '';
          const node: FamilyTree = {
            main: '',
            parent: entry[COL.PARENT] ?? '',
            name,
            rank: entry[COL.RANK] ?? '',
            english: entry[COL.ENGLISH] ?? '',
            dutch: entry[COL.DUTCH] ?? '',
            extinct: entry[COL.EXTINCT] ?? '',
            isMain: entry[COL.IS_MAIN] ?? '',
            seen: entry[COL.SEEN] ?? '',
            picNum: entry[COL.PIC_NUM] ?? '',
            picName: entry[COL.PIC_NAME] ?? '',
            children: [],
            latin: isExtinct ? `† ${name}` : name,
          };

          tempEntries.push(node);
          idToFamilyMap.set(node.name, node);
        });

        let root: FamilyTree = { ...EMPTY_TREE };

        // 2. Assemble parent-child relations
        tempEntries.forEach((entry) => {
          if (!entry.parent) {
            root = entry;
          } else {
            const parent = idToFamilyMap.get(entry.parent);
            if (parent) {
              parent.children ??= [];
              parent.children.push(entry);
            }
          }
        });

        // 3. Propagate `main` identifiers downwards
        this.propagateMain(root, '');

        return root;
      }),
      shareReplay(1)
    );
  }

  private propagateMain(node: FamilyTree, inheritedMain: string): void {
    let newMain = node.isMain === 'TRUE' ? node.name : inheritedMain;

    if (!newMain) {
      newMain = this.findFirstChildMain(node.children ?? []) ?? '';
    }

    node.main = newMain;

    const nextInheritedMain = node.isMain === 'TRUE' ? node.name : inheritedMain;
    node.children?.forEach((child) => this.propagateMain(child, nextInheritedMain));
  }

  private findFirstChildMain(children: FamilyTree[]): string | null {
    for (const child of children) {
      if (child.isMain === 'TRUE') {
        return child.name;
      }
      const deeper = this.findFirstChildMain(child.children ?? []);
      if (deeper) return deeper;
    }
    return null;
  }
}
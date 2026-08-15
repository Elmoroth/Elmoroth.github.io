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

  /** Single cached observable for raw parsed tree */
  private readonly familyTree$: Observable<FamilyTree> = this.fetchAndBuildTree().pipe(
    shareReplay(1)
  );

  /** Returns the cached family tree observable */
  getFamilies(): Observable<FamilyTree> {
    return this.familyTree$;
  }

  getFamilyMenu(): Observable<FamilyMenu[]> {
    return this.getFamilies().pipe(
      map((root) => this.buildMenuStructure(root))
    );
  }

  getPartialTree(name: string): Observable<FamilyTree> {
    return this.getFamilies().pipe(
      map((root) => {
        const path = this.findPathToNode(name, root);
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
      if (this.isTrue(node.isMain)) {
        currentMenu = { name: node.name, children: [] };
        menus.push(currentMenu);
      }

      if (node.rank === 'Family' && !this.isTrue(node.extinct) && currentMenu) {
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
  /*                      Subtree Navigation Helpers                           */
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

      if (this.isTrue(parent.isMain)) {
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
    if (this.isTrue(node.isMain)) return true;
    return node.children?.some((c) => this.subtreeContainsMain(c)) ?? false;
  }

  private rebuildSubtree(path: FamilyTree[], startLevel: number): FamilyTree {
    let subtree = structuredClone(path[path.length - 1]);

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

  private cloneUntilIsMain(clade: FamilyTree): FamilyTree {
    if (this.isTrue(clade.isMain) || clade.rank === 'Order') {
      return { ...clade, children: [] };
    }

    return {
      ...clade,
      children:
        clade.children
          ?.filter((c) => !this.isTrue(c.extinct))
          .map((c) => this.cloneUntilIsMain(c)) ?? [],
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                      Data Fetching & Parsing                               */
  /* -------------------------------------------------------------------------- */

  private fetchAndBuildTree(): Observable<FamilyTree> {
    return this.http.get<GoogleSheetResult>(this.url).pipe(
      map((data: GoogleSheetResult) => {
        const idToFamilyMap = new Map<string, FamilyTree>();
        const tempEntries: FamilyTree[] = [];

        // 1. Map raw sheet rows to FamilyTree objects
        (data.values ?? []).slice(1).forEach((entry: any[]) => {
          const extinctRaw = entry[COL.EXTINCT] ?? '';
          const name = entry[COL.NAME] ?? '';
          const node: FamilyTree = {
            main: '',
            parent: entry[COL.PARENT] ?? '',
            name,
            rank: entry[COL.RANK] ?? '',
            english: entry[COL.ENGLISH] ?? '',
            dutch: entry[COL.DUTCH] ?? '',
            extinct: extinctRaw,
            isMain: entry[COL.IS_MAIN] ?? '',
            seen: entry[COL.SEEN] ?? '',
            picNum: entry[COL.PIC_NUM] ?? '',
            picName: entry[COL.PIC_NAME] ?? '',
            children: [],
            latin: this.isTrue(extinctRaw) ? `† ${name}` : name,
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
      })
    );
  }

  private propagateMain(node: FamilyTree, inheritedMain: string): void {
    let newMain = this.isTrue(node.isMain) ? node.name : inheritedMain;

    if (!newMain) {
      newMain = this.findFirstChildMain(node.children ?? []) ?? '';
    }

    node.main = newMain;

    const nextInheritedMain = this.isTrue(node.isMain) ? node.name : inheritedMain;
    node.children?.forEach((child) => this.propagateMain(child, nextInheritedMain));
  }

  private findFirstChildMain(children: FamilyTree[]): string | null {
    for (const child of children) {
      if (this.isTrue(child.isMain)) {
        return child.name;
      }
      const deeper = this.findFirstChildMain(child.children ?? []);
      if (deeper) return deeper;
    }
    return null;
  }

  /** Normalizes boolean-like cell values from Google Sheets */
  private isTrue(val: any): boolean {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const clean = val.trim().toUpperCase();
      return clean === 'TRUE' || clean === '1' || clean === 'X';
    }
    if (typeof val === 'number') return val === 1;
    return false;
  }
}
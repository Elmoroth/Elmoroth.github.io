export interface FamilyTree {
    main: string;
    parent: string;
    name: string;
    rank: string;
    english: string;
    dutch: string;
    extinct: string;
    isMain: string;
    seen: string;
    picNum: string;
    picName: string;
    children: FamilyTree[];
    latin: string;
}

export interface FamilyMenu {
    name: string;
    children: FamilyMenuItem[];
}

export interface FamilyMenuItem {
    main: string;
    latin: string;
    english: string;
    dutch: string;
    picNum: string;
}
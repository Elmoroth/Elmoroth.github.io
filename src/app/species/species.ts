export interface Species {
    rank: string,
    parent: string,
    name: string,
    genus: string,
    species: string,
    englishName: string,
    nederlands: string,
    category: string,
    authority: string,
    notes: string,
    rangeShort: string,
    rangeDescription: string,
    picture: string,
    asset: string,
    ebirdCode: string,
    children: Species[];
}

export interface Clade {
    name: string,
    rank: string
}

export interface GoogleSheetResult {
    range: string,
    majorDimension: string,
    values: string[]
}
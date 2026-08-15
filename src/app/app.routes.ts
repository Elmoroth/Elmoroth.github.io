import { Routes, withInMemoryScrolling, withRouterConfig } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clade/Paleognathae', pathMatch: 'full' },
  {
    path: 'clade/:id',
    loadComponent: () =>
      import('./species/species.component').then((m) => m.SpeciesComponent),
  },
  {
    path: 'familytree',
    loadComponent: () =>
      import('./family-tree-block/familyTreeBlock.component').then(
        (m) => m.FamilyTreeBlockComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
];
import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 57],
};
export const routes: Routes = [
  { path: '', redirectTo: 'clade/Paleognathae', pathMatch: 'full'},
  { path: 'clade/:id', loadComponent: () => import('./species/species.component').then(m => m.SpeciesComponent) },
  { path: 'familytree', loadComponent: () => import('./familyTreeBlock/familyTreeBlock.component').then(m => m.FamilyTreeBlockComponent) },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

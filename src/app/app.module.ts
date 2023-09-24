
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
 
/* App Root */
import { AppComponent } from './app.component';

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

/* Feature Modules */
import { SpeciesComponent } from './species/species.component';
import { FamilyTreeComponent } from './familytree/familytree.component';
import { HeaderComponent } from './header/header.component';
import { SpeciestreeComponent } from './speciestree/speciestree.component';
import { GenusblockComponent } from './genusblock/genusblock.component';
import { SpeciesblockComponent } from './speciesblock/speciesblock.component';
import { FamilyTreeBlockComponent } from './familyTreeBlock/familyTreeBlock.component';

/* Loading Modules*/
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingInterceptor } from './loading.interceptor';
import { BigmenuComponent } from './bigmenu/bigmenu.component';

@NgModule({
  imports: [
    BrowserModule,
    SpeciesComponent,
    FamilyTreeComponent,
    HeaderComponent,
    SpeciestreeComponent,
    GenusblockComponent,
    SpeciesblockComponent,
    FamilyTreeBlockComponent,
    BigmenuComponent,
    HttpClientModule,
    AppRoutingModule,
  ],
  declarations: [													
    AppComponent,
    PageNotFoundComponent,
    SpinnerComponent
   ], 
   providers: [
     {
       provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
     }
   ],
  bootstrap: [AppComponent]
})

export class AppModule {}
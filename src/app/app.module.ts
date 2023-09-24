
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
 
/* App Root */
import { AppComponent } from './app.component';

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

/* Loading Modules*/
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingInterceptor } from './loading.interceptor';

/* Feature Modules */
import { SpeciesComponent } from './species/species.component';
import { FamilyTreeComponent } from './familytree/familytree.component';
import { HeaderComponent } from './header/header.component';
import { SpeciestreeComponent } from './speciestree/speciestree.component';
import { GenusblockComponent } from './genusblock/genusblock.component';
import { SpeciesblockComponent } from './speciesblock/speciesblock.component';
import { FamilyTreeBlockComponent } from './familyTreeBlock/familyTreeBlock.component';
import { BigmenuComponent } from './bigmenu/bigmenu.component';
import { IucnComponent } from './iucn/iucn.component';
import { SpeciesPictureComponent } from './species-picture/species-picture.component';
import { RangeComponent } from './range/range.component';
import { SpeciesInfoComponent } from './species-info/species-info.component';

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
    IucnComponent,
    SpeciesPictureComponent,
    RangeComponent,
    SpeciesInfoComponent,
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
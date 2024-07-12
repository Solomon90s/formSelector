import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, Observable, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private countriesService: CountriesService
  ) {}


  get regions(): Region[] {
    return this.countriesService.regions;
  }

  public myForm: FormGroup = this.formBuilder.group({
    region:  ['', Validators.required ],
    country: ['', Validators.required ],
    border: ['', Validators.required ],
  });


  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }


  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        //! el tap se usa para crear un efecto secundario
        tap( () => this.myForm.get('country')!.setValue('') ),
        tap( () => this.borders = [] ),
        //! el swtichMap toma el valor del observable anterior y se suscribe al nuevo observable
        switchMap( (region) => this.countriesService.getCountriesByRegion(region) ),
      )
      .subscribe( countries => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('') ),
        //! el filter filtra la información
        filter( ( value: string ) => value.length > 0),
        switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
        switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ) ),
      )
      .subscribe( countries => {
        this.borders = countries;
      });
  }



}

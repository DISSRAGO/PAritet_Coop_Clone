import { CountryDto } from './country.dto';
import { IsArray, IsDefined } from 'class-validator';

export class GetCountryDtoResult {
  @IsDefined()
  @IsArray()
  countries: Array<CountryDto>;
}

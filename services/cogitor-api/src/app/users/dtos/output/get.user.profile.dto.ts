import { ApiProperty } from '@nestjs/swagger';
import { UserPhotoDto } from '../user.photo.dto';
import { AddressDto } from "../address.dto";

export class GetUserProfileDto {
  @ApiProperty({
    description: 'Идентификатор пользователя',
    type: Number,
  })
  id?: number;

  @ApiProperty({
    description: 'Логин пользователя',
    type: String,
  })
  login?: string;

  @ApiProperty({
    description: 'Идентификатор валюты',
    type: String,
  })
  isTrusted?: string;

  @ApiProperty({
    description: '',
    type: Number,
  })
  typeCode?: string;

  @ApiProperty({
    description: 'ФИО пользователя',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Почта пользователя',
    type: String,
  })
  email?: string;

  @ApiProperty({
    description: 'Телефон пользователя',
    type: String,
  })
  phone?: string;

  @ApiProperty({
    description: 'Дата рождения',
    type: String,
  })
  birthDate?: string;

  @ApiProperty({
    description: 'Пол пользователя',
    type: Number,
  })
  sex?: string;

  @ApiProperty({
    description: 'Адрес пользователя',
    type: AddressDto,
  })
  livingAddress?: AddressDto;

  @ApiProperty({
    description: 'Фотография пользователя',
    type: UserPhotoDto,
  })
  photoImage?: UserPhotoDto;
}

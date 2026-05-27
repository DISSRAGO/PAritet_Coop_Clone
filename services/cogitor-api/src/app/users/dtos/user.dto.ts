import { ApiProperty } from '@nestjs/swagger';
import { GetUserProfileDto } from './output/get.user.profile.dto';
import { UserPhotoDto } from './user.photo.dto';
import { AddressDto } from "./address.dto";

/**
 * Информация о пользователе
 */
export class UserDto {
  @ApiProperty({
    description: 'Статус пользователя',
    type: String,
  })
  status: string;

  @ApiProperty({
    description: 'Профиль пользователя',
    type: GetUserProfileDto,
  })
  userProfile: GetUserProfileDto;

  @ApiProperty({
    description: 'Адрес',
    type: AddressDto,
  })
  address: AddressDto;

  @ApiProperty({
    description: 'Фотография',
    type: UserPhotoDto,
  })
  photoImage: UserPhotoDto;
}

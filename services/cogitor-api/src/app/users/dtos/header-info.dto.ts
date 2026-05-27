import { ApiProperty } from '@nestjs/swagger';
import { UserPhotoDto } from './user.photo.dto';

export class HeaderInfoDto {
  @ApiProperty({
    description: 'Bltynbabrfnjh gjkmpjdfntkz',
    type: Number,
  })
  id?: number;
  @ApiProperty({
    description: 'Почта',
    type: String,
  })
  email?: string;
  @ApiProperty({
    description: 'Логин',
    type: String,
  })
  login?: string;
  @ApiProperty({
    description: 'Название',
    type: String,
  })
  name?: string;
  @ApiProperty({
    description: 'Фотография',
    type: UserPhotoDto,
  })
  photoImage?: UserPhotoDto;
}

import { ApiProperty } from '@nestjs/swagger';

/**
 * Фотография пользователя
 */
export class UserPhotoDto {
  @ApiProperty({
    description: 'Название файла',
    type: String,
  })
  fileName?: string;

  @ApiProperty({
    description: 'Контент',
    type: String,
  })
  binaryContents?: string;

  @ApiProperty({
    description: 'Описание',
    type: String,
  })
  description?: string;

  @ApiProperty({
    description: 'Тип файла (Jpeg/png и т.д.)',
    type: String,
  })
  contentType?: string;
}

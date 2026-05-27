import { IsDefined, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'i.ivanov',
    description: 'Логин пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  public readonly login: string;

  @ApiProperty({
    example: 'XaXukjhaADf123',
    description: 'Пароль пользователя',
  })
  @IsNotEmpty()
  @MinLength(5)
  public readonly password: string;
}

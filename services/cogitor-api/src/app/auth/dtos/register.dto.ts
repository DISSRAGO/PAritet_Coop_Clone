import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия',
  })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Иванович',
    description: 'Отчество',
  })
  @IsString()
  @IsNotEmpty()
  secondName: string;

  @ApiProperty({
    description: 'Телефон',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'i.ivanov@yandex.ru',
    description: 'Почта',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Логин',
    description: 'Логин',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'qwerty',
    description: 'Пароль',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'qwerty',
    description: 'Повтор пароля',
  })
  @IsNotEmpty()
  restorePassword: string;

  @ApiProperty({
    example: '5',
    description: 'Идентификатор адреса',
  })
  @IsNotEmpty()
  addressId: number;
}

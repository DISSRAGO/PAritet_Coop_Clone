import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { HttpExceptionFilter } from '../filters';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUserProfileDto } from './dtos/output/get.user.profile.dto';
import { SaveUserProfileDto } from './dtos/input/save.user.profile.dto';
import { AppLogger } from '../logger/logger.service';
import { AuthGuard } from '@nestjs/passport';
import { AccountDto } from './dtos/account.dto';
import { OperationHistoryOutDto } from './dtos/output/operation-history.dto';
import { OperationsHistoryInputDto } from './dtos/input/operations.history.dto';
@ApiTags('user')
@Controller('/user')
export class UserController {
  constructor(
    private userService: UsersService,
    private readonly logger: AppLogger,
  ) {}

  @ApiOkResponse({
    description: 'Успешно получен данные профиля пользователя',
  })
  @ApiBearerAuth()
  @Get('/profile')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard('jwt'))
  getProfile(
    @Headers('Authorization') token: string,
  ): Promise<GetUserProfileDto> {
    this.logger.log(`${this.getProfile.name} вызван`);
    return this.userService.getProfileInformation(token.substring(7));
  }

  @ApiOkResponse({
    description: 'Успешно сохранен профиль пользователя',
  })
  @ApiBearerAuth()
  @Post('/profile')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard('jwt'))
  saveProfile(
    @Headers('Authorization') token: string,
    @Body() userProfile: SaveUserProfileDto,
  ): Promise<GetUserProfileDto> {
    this.logger.log(`${this.saveProfile.name} вызван`);
    return this.userService.saveProfileInformation(
      userProfile,
      token.substring(7),
    );
  }

  /* @ApiOkResponse({
    description: 'Успешно получена фотография пользователя',
  })


  @Get('/avatar')
  @UseFilters(new HttpExceptionFilter())
  getAvatar(file: any): Promise<GetUserProfileDto> {
    return file;
  }

  @ApiOkResponse({
    description: 'Успе',
  })
  @Post('/avatar')
  @UseFilters(new HttpExceptionFilter())
  saveAvatar(
    @Headers('access-token') token: string,
    @Body('userProfile') userProfile: GetUserProfileDto,
  ): Promise<GetUserProfileDto> {
    return this.userService.saveProfileInformation(userProfile, token);
  }*/
  @ApiOkResponse({
    description: 'Успешно сохранён адрес пользователя',
  })
  @ApiBearerAuth()
  @Post('/profile/address')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard('jwt'))
  saveProfileAddress(
    @Headers('Authorization') token: string,
    @Body('userProfile') userProfile: GetUserProfileDto,
  ): Promise<GetUserProfileDto> {
    return this.userService.saveProfileAddress(userProfile, token.substring(7));
  }

  @ApiOkResponse({
    description:
      'Успешно получена краткая информация о пользователе (id, Login, почта, ФИО, Фото)',
  })
  @ApiBearerAuth()
  @Get('/header_info')
  @UseFilters(new HttpExceptionFilter())
  getHeaderInfo(@Headers('Authorization') token: string) {
    return this.userService.getHeaderInfo(token.substring(7));
  }

  @ApiOkResponse({
    description:
      'Успешно получена информация об аккаунте пользователя (номера счетов, баланс и и т.д. )',
  })
  @ApiBearerAuth()
  @Get('/account')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard('jwt'))
  async getAccount(
    @Headers('Authorization') token: string,
  ): Promise<AccountDto> {
    return this.userService.getAccount(token.substring(7));
  }

  @ApiOkResponse({
    description:
      'Успешно получена информация об операциях на определённом аккаунте за определённый период',
  })
  @ApiBearerAuth()
  @Get('/operation_history')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard('jwt'))
  getOperationHistory(
    @Headers('Authorization') token: string,
    @Query() query: OperationsHistoryInputDto,
  ): Promise<OperationHistoryOutDto> {
    return this.userService.getOperationHistoryByAccount(
      query,
      token.substring(7),
    );
  }
}

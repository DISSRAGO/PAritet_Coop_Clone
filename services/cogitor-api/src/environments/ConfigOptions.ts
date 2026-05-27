import * as Joi from 'joi';
import { ConfigModuleOptions } from '@nestjs/config';
export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: '.env',

  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    AUTHOR: Joi.string(),
    NAME: Joi.string(),
    DESCRIPTION: Joi.string(),
    VERSION: Joi.string(),

    APP_HOST: Joi.string().required(),
    BACKEND_PORT: Joi.number().required(),
    END_POINT: Joi.string().required(),
    RATE_LIMIT_MAX: Joi.number(),
    SECURITY_ACCESS_JWT_SECRET: Joi.string().required(),
    SECURITY_REFRESH_JWT_SECRET: Joi.string().required(),
    SECURITY_ACCESS_TOKEN_EXPIRED: Joi.string().required(),
    SECURITY_REFRESH_TOKEN_EXPIRED: Joi.string().required(),
  }),
};

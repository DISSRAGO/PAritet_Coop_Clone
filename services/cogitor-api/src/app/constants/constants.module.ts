import { RequestUrl, WsdlUrl } from './url.constants';
import { Module } from '@nestjs/common';

@Module({
  exports: [RequestUrl, WsdlUrl],
  providers: [RequestUrl, WsdlUrl],
})
export class ConstantsModule {}

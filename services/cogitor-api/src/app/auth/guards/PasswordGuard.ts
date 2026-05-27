import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const PassportGuard = (strategy: string | string[]): any =>
  class extends AuthGuard(strategy) {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const result = (await super.canActivate(context)) as boolean;

      await super.logIn(request);

      return result;
    }
  };

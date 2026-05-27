export class ConfirmTransferDto {
  activationRequestId: string;
  activationCode: string;
  contractFrom: string;
  amount: string;
  typeTo: string;
  valueTo: string;
  description: string;
}

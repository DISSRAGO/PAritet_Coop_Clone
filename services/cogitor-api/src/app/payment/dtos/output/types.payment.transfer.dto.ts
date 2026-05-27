export class TypeToDto {
  name: string;
  value: string;
}

export class ContractFrom {
  name: string;
  value: string;
}

export class TypesPaymentTransferDto {
  typeTo: Array<TypeToDto>;
  contractFrom: Array<ContractFrom>;
}

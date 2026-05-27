/**
 * AdditionalProps
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface AdditionalProps {
  /** s:string */
  AdditionalPropsItem?: Array<AdditionalPropsItem>;
}

interface AdditionalPropsItem {
  attributes: {
    AdditionalPropsKey: string;
  };
  $value?: string;
}

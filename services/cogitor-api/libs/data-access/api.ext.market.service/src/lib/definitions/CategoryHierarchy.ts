/**
 * CategoryHierarchy
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface CategoryHierarchy {
  /** s:string */
  Id?: string;
  /** s:string */
  Name?: string;
  /** Childlist[] */
  Childlist?: Array<CategoryHierarchy>;
}

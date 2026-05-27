import { Human } from "./Human";
import { Organization } from "./Organization";

/**
 * AbonentCreate
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface AbonentCreate {
    /** Human */
    Human?: Human;
    /** Organization */
    Organization?: Organization;
}

import { PropertyList } from "./PropertyList";

/** GetProducerAvatarList */
export interface GetProducerAvatarList {
    /** s:string */
    OrganizationId?: string;
    /** s:string */
    Filter?: string;
    /** s:string */
    My?: string;
    /** s:string */
    Sort?: string;
    /** s:string */
    Order?: string;
    /** s:string */
    ContextSearch?: string;
    /** s:long */
    PositionFrom?: string;
    /** s:long */
    MaxCount?: string;
    /** PropertyList */
    PropertyList?: PropertyList;
}

import { PropertyList } from "./PropertyList";

/** GetDistributorAvatarList */
export interface GetDistributorAvatarList {
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
    PositionFrom?: number;
    /** s:long */
    MaxCount?: number;
    /** PropertyList */
    PropertyList?: PropertyList;
}

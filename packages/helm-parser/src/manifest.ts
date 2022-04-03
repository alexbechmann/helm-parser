import { ObjectMeta } from "kubernetes-types/meta/v1";

/**
 * Base type for all kubernetes objects
 */
export interface Manifest {
  apiVersion: string | any;
  kind?: string | any;
  metadata?: ObjectMeta;
  [key: string]: any;
}

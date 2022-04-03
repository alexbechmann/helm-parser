import { Manifest } from "./manifest";
import { Deployment } from "kubernetes-types/apps/v1";
import { Ingress } from "kubernetes-types/networking/v1beta1";
import { Service } from "kubernetes-types/core/v1";

export class TemplateResult {
  constructor(public manifests: Manifest[]) {}

  public getDeployments() {
    return this.manifests.filter((manifest) => manifest.kind === "Deployment") as Deployment[];
  }

  public getDeployment(name: string) {
    return this.getDeployments().find((deployment) => deployment.metadata.name === name);
  }

  public getIngresses() {
    return this.manifests.filter((manifest) => manifest.kind === "Ingress") as Ingress[];
  }

  public getIngress(name: string) {
    return this.getIngresses().find((ingress) => ingress.metadata.name === name);
  }

  public getServices() {
    return this.manifests.filter((manifest) => manifest.kind === "Service") as Service[];
  }

  public getService(name: string) {
    return this.getServices().find((service) => service.metadata.name === name);
  }
}

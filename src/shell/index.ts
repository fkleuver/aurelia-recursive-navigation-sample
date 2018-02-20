import { FrameworkConfiguration, PLATFORM } from "aurelia-framework";

export function configure(fxconfig: FrameworkConfiguration): void {
  fxconfig.globalResources(PLATFORM.moduleName("shell/nav-menu/nav-menu"));
}

import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as ScrollToPlugin from  "gsap/ScrollToPlugin";

export function configure(aurelia: Aurelia): void {
  console.log(ScrollToPlugin);
  aurelia.use.developmentLogging();
  aurelia.use.standardConfiguration();
  aurelia.use.feature(PLATFORM.moduleName("shell/index"));

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("shell/app")));
}

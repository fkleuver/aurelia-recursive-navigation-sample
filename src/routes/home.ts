import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { defaultRoute } from "./default";

export class HomeViewModel {
  public router: Router;

  public async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
    config.map([
      defaultRoute,
      {
        route: "home",
        name: "home",
        moduleId: PLATFORM.moduleName("routes/home"),
        nav: true,
        title: "Home"
      },
      {
        route: "slow",
        name: "slow",
        moduleId: PLATFORM.moduleName("routes/slow"),
        nav: true,
        title: "Slow"
      }
    ]);

    this.router = router;
  }

  public close(): void {
    this.router.parent.navigate("");
  }
}

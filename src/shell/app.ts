import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration, NavigationInstruction } from "aurelia-router";
import { HorizontalScroller } from "./util/horizontal-scroller";
import { autoinject } from "aurelia-dependency-injection";
import { defaultRoute } from "routes/default";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";

@autoinject()
export class AppShell {
  public routerView: HTMLElement;
  public router: Router;
  public scroller: HorizontalScroller;
  public ea: EventAggregator;

  constructor(scroller: HorizontalScroller, ea: EventAggregator) {
    this.scroller = scroller;
    this.ea = ea;
  }

  public async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
    if (/aurelia-recursive-navigation-sample/.test(PLATFORM.location.pathname)) {
      config.options.root = "/aurelia-recursive-navigation-sample/";
    }
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

  public attached(): void {
    this.scroller.bind(this.routerView);
  }

  public detached(): void {
    this.scroller.unbind();
  }

  public openAllAtOnce(): void {
    this.getLeafRouter().navigate("slow/".repeat(10));
    this.ea.subscribeOnce("router:navigation:complete", () => {
      this.scroller.scrollTo(100000);
    })
  }

  public openOneByOne(): void {
    let i = 10;
    const handle = () => {
      if (--i > 0) {
        this.getLeafRouter().navigateToRoute("slow");
      } else {
        subscription.dispose();
        this.scroller.scrollTo(100000);
      }
    };
    const subscription = this.ea.subscribe("router:navigation:complete", handle);
    this.getLeafRouter().navigateToRoute("slow");
  }

  private getLeafRouter(): Router {
    let childRouter = this.router;
    while (childRouter.currentInstruction.viewPortInstructions.default.childRouter) {
      childRouter = childRouter.currentInstruction.viewPortInstructions.default.childRouter;
    }
    return childRouter;
  }
}

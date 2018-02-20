import { bindingMode } from "aurelia-binding";
import { Router } from "aurelia-router";
import { bindable } from "aurelia-templating";

export class NavMenu {
  @bindable({ defaultBindingMode: bindingMode.toView })
  public router: Router;
}

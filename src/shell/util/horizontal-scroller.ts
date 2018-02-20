import { singleton } from "aurelia-dependency-injection";
import { TaskQueue } from "aurelia-task-queue";

enum ScrollDir {
  x,
  y
}

@singleton()
export class HorizontalScroller {
  public host: HTMLElement;
  public offset: Offset;
  public tq: TaskQueue;
  public isBound: boolean;

  private isHandlingScrollEvent: boolean;
  private cache: { mouseX: number; mouseY: number; scrollDir: ScrollDir };

  constructor(tq: TaskQueue) {
    this.tq = tq;
    this.isHandlingScrollEvent = false;
    this.isBound = false;
  }

  public bind(containerEl: HTMLElement): void {
    if (this.isBound === true) {
      this.unbind();
    }
    this.host = containerEl;
    this.offset = { x: this.host.scrollLeft, y: this.host.scrollTop };
    this.cache = { mouseX: null, mouseY: null, scrollDir: null };

    window.addEventListener("scroll", this.scrollHandler, true);
    window.addEventListener("wheel", this.wheelHandler, true);
    this.tq.queueTask(() => {
      this.scrollTo(100000);
    });
    this.isBound = true;
  }

  public unbind(): void {
    if (this.isBound === false) {
      return;
    }
    window.removeEventListener("wheel", this.wheelHandler, true);
    window.removeEventListener("scroll", this.scrollHandler, true);

    this.host = null;
    this.cache = { mouseX: null, mouseY: null, scrollDir: null };
    this.isBound = false;
  }

  public updateOffsetX(offset: number): void {
    if (this.offset) {
      this.offset.x += offset;
    }
  }

  public scrollTo(newOffset: number, skipBoundsCheck: boolean = false): void {
    let calculatedNewOffset = newOffset;
    if (skipBoundsCheck === false) {
      calculatedNewOffset = calculateNewOffset(this.host, this.offset.x, null, null, newOffset);
    }

    if (calculatedNewOffset !== this.offset.x) {
      this.offset.x = calculatedNewOffset;
      this.offset.setByScript = true;
      this.tq.queueMicroTask(() => {
        TweenLite.to(this.host, 0.3, { scrollTo: { x: this.offset.x }, ease: Power2.easeOut });
      });
    }
  }

  public scrollOffset(offset: number, skipBoundsCheck: boolean = false): void {
    let calculatedNewOffset = this.offset.x - offset;
    if (skipBoundsCheck === false) {
      calculatedNewOffset = calculateNewOffset(this.host, this.offset.x, null, offset, null);
    }

    this.scrollTo(calculatedNewOffset, true);
  }

  private wheelHandler = (e: WheelEvent): void | boolean => {
    let scrollDir = this.cache.scrollDir;
    if (e.clientX > this.cache.mouseX + 12 || e.clientX < this.cache.mouseX - 12) {
      this.cache.scrollDir = scrollDir = determineScrollDirection(this.host, e.clientX, e.clientY);
      this.cache.mouseX = e.clientX;
      this.cache.mouseY = e.clientY;
    }
    if (scrollDir === ScrollDir.x) {
      const delta = getDelta(e);
      const calculatedNewOffset = calculateNewOffset(this.host, this.offset.x, delta);
      this.scrollTo(calculatedNewOffset, true);

      if (e.preventDefault && e.stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        return false;
      }
    }
  };

  private scrollHandler = (_: UIEvent): void | boolean => {
    if (this.isHandlingScrollEvent) {
      return;
    }
    this.isHandlingScrollEvent = true;
    if (!this.offset.setByScript) {
      this.offset.x = this.host.scrollLeft;
    }
    this.offset.setByScript = false;
    this.tq.queueMicroTask(() => {
      this.isHandlingScrollEvent = false;
    });
  };
}

export interface Offset {
  x: number;
  y: number;
  setByScript?: boolean;
}

function calculateNewOffset(
  containerEl: HTMLElement,
  currentOffset: number,
  wheelDelta: number = null,
  offsetChange: number = null,
  newOffset: number = null
): number {
  if (!containerEl) {
    throw new Error("containerEl is nil");
  }

  let calculatedOffsetChange = offsetChange;
  if (calculatedOffsetChange === null && wheelDelta !== null) {
    calculatedOffsetChange = calculateOffsetChange(wheelDelta);
  }

  const minOffset = 0;
  const maxOffset = containerEl.scrollWidth - containerEl.offsetWidth;

  let calculatedNewOffset = newOffset;
  if (calculatedNewOffset === null && calculatedOffsetChange !== null) {
    if (currentOffset === minOffset && calculatedOffsetChange >= 0) {
      return minOffset;
    }
    if (currentOffset === maxOffset && calculatedOffsetChange <= 0) {
      return maxOffset;
    }

    calculatedNewOffset = currentOffset - calculatedOffsetChange;
  }

  if (calculatedNewOffset < minOffset) {
    calculatedNewOffset = minOffset;
  } else if (calculatedNewOffset > maxOffset) {
    calculatedNewOffset = maxOffset;
  }

  return calculatedNewOffset;
}

function calculateOffsetChange(wheelDelta: number): number {
  return wheelDelta / 120 * 10;
}

function getDelta(event: WheelEvent): number {
  if (event.detail) {
    return event.detail * -240;
  } else if (event.wheelDelta) {
    return event.wheelDelta * 5;
  } else {
    return 0;
  }
}

function determineScrollDirection(
  containerEl: HTMLElement,
  mouseX: number,
  mouseY: number,
  overflowThreshhold: number = 6
): ScrollDir {
  let currentEl = document.elementFromPoint(mouseX, mouseY) as HTMLElement;
  while (currentEl.parentElement && currentEl !== containerEl) {
    const lenientScrollHeight = currentEl.scrollHeight - overflowThreshhold;
    let hasOverflowY = lenientScrollHeight > currentEl.clientHeight;
    if (hasOverflowY) {
      const containerStyle = (currentEl as any).currentStyle || window.getComputedStyle(currentEl, "");
      hasOverflowY =
        containerStyle.overflow === "visible" ||
        containerStyle.overflowY === "visible" ||
        (hasOverflowY && containerStyle.overflow === "auto") ||
        (hasOverflowY && containerStyle.overflowY === "auto");
    }

    if (hasOverflowY) {
      return ScrollDir.y;
    } else {
      currentEl = currentEl.parentElement;
    }
  }

  return ScrollDir.x;
}

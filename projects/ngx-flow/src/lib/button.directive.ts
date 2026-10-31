import { Directive, ElementRef, inject, Input } from '@angular/core';
import type { FlowInstance } from './flow-js';

@Directive({
  selector: '[flowButton]'
})
export class FlowButton {

  protected el = inject(ElementRef);

  protected _directoryOnly = false;
  @Input()
  set flowDirectoryOnly(directoriesOnly: boolean) {
    this._directoryOnly = directoriesOnly;
    this.setup();
  }

  protected _attributes?: Record<string, string>;
  @Input()
  set flowAttributes(attributes: Record<string, string>) {
    this._attributes = attributes;
    this.setup();
  }

  protected _flow?: FlowInstance;
  @Input()
  set flow(flow: FlowInstance) {
    this._flow = flow;
    this.setup();
  }

  setup() {
    if (!this._flow) {
      return;
    }
    this._flow.assignBrowse(
      this.el.nativeElement,
      this._directoryOnly,
      this._flow.opts.singleFile,
      this._attributes
    );
  }

}

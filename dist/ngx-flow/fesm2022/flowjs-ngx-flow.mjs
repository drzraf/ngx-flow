import * as i0 from '@angular/core';
import { inject, ElementRef, Input, Directive, Renderer2, InjectionToken, PLATFORM_ID, NgModule } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReplaySubject, Subject, merge, fromEvent } from 'rxjs';
import { switchMap, map, shareReplay, startWith } from 'rxjs/operators';

class FlowButton {
    constructor() {
        this.el = inject(ElementRef);
        this._directoryOnly = false;
        this._setupScheduled = false;
    }
    set flowDirectoryOnly(directoriesOnly) {
        this._directoryOnly = directoriesOnly;
        this.setup();
    }
    set flowAttributes(attributes) {
        this._attributes = attributes;
        this.setup();
    }
    set flow(flow) {
        this._flow = flow;
        this.setup();
    }
    setup() {
        if (!this._flow || this._setupScheduled) {
            return;
        }
        // flow, flowAttributes and flowDirectoryOnly are separate inputs. Angular
        // calls their setters in the same change-detection pass; coalesce them so
        // assignBrowse() runs once and does not attach duplicate change listeners.
        this._setupScheduled = true;
        Promise.resolve().then(() => {
            this._setupScheduled = false;
            if (!this._flow) {
                return;
            }
            const attributes = JSON.stringify(this._attributes || {});
            if (this._boundFlow === this._flow) {
                if (this._boundAttributes !== attributes) {
                    this.applyAttributes();
                    this._boundAttributes = attributes;
                }
                return;
            }
            this._boundFlow = this._flow;
            this._boundAttributes = attributes;
            this._flow.assignBrowse(this.el.nativeElement, this._directoryOnly, this._flow.opts.singleFile, this._attributes);
        });
    }
    applyAttributes() {
        const element = this.el.nativeElement;
        const input = element.tagName === 'INPUT'
            ? element
            : element.querySelector('input[type="file"]');
        if (!input || !this._attributes) {
            return;
        }
        for (const [name, value] of Object.entries(this._attributes)) {
            input.setAttribute(name, value);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowButton, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.2.14", type: FlowButton, isStandalone: true, selector: "[flowButton]", inputs: { flowDirectoryOnly: "flowDirectoryOnly", flowAttributes: "flowAttributes", flow: "flow" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowButton, decorators: [{
            type: Directive,
            args: [{
                    selector: '[flowButton]'
                }]
        }], propDecorators: { flowDirectoryOnly: [{
                type: Input
            }], flowAttributes: [{
                type: Input
            }], flow: [{
                type: Input
            }] } });

class FlowDrop {
    constructor() {
        this.el = inject(ElementRef);
        this.renderer = inject(Renderer2);
    }
    set flow(flow) {
        this.flowJs = flow;
        if (!flow) {
            return;
        }
        this.enable();
    }
    enable() {
        this.flowJs?.assignDrop(this.el.nativeElement);
    }
    disable() {
        this.flowJs?.unAssignDrop(this.el.nativeElement);
    }
    ngOnInit() {
        this.renderer.listen('body', 'drop', (event) => event.preventDefault());
        this.renderer.listen('body', 'dragover', (event) => event.preventDefault());
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowDrop, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.2.14", type: FlowDrop, isStandalone: true, selector: "[flowDrop]", inputs: { flow: "flow" }, exportAs: ["flowDrop"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowDrop, decorators: [{
            type: Directive,
            args: [{
                    selector: '[flowDrop]',
                    exportAs: 'flowDrop'
                }]
        }], propDecorators: { flow: [{
                type: Input
            }] } });

class FlowSrc {
    constructor() {
        this.el = inject(ElementRef);
    }
    set flowSrc(transfer) {
        this.fileReader = new FileReader();
        this.fileReader.readAsDataURL(transfer.flowFile.file);
        this.fileReader.onload = (event) => {
            const url = event.target.result;
            this.el.nativeElement.setAttribute('src', url);
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowSrc, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.2.14", type: FlowSrc, isStandalone: true, selector: "[flowSrc]", inputs: { flowSrc: "flowSrc" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowSrc, decorators: [{
            type: Directive,
            args: [{
                    selector: '[flowSrc]'
                }]
        }], propDecorators: { flowSrc: [{
                type: Input
            }] } });

const FlowInjectionToken = new InjectionToken('Flow');

function flowFile2Transfer(flowFile) {
    return {
        id: flowFile.uniqueIdentifier,
        name: flowFile.name,
        progress: flowFile.progress(),
        averageSpeed: flowFile.averageSpeed,
        currentSpeed: flowFile.currentSpeed,
        size: flowFile.size,
        paused: flowFile.paused,
        cancelled: flowFile.cancelled,
        error: flowFile.error,
        errorMessage: flowFile.errorMessage,
        complete: flowFile.isComplete(),
        success: flowFile.isSuccessful(),
        streaming: flowFile.streaming,
        timeRemaining: flowFile.timeRemaining(),
        flowFile
    };
}

const FLOW_EVENTS = [
    'upload-start',
    'upload-resume',
    'file-progress',
    'progress',
    'file-success',
    'file-error',
    'error',
    'file-retry',
    'file-removed',
    'complete',
];
class FlowConfig {
    constructor() {
        this.flowConstructor = inject(FlowInjectionToken);
        this.platform = inject(PLATFORM_ID);
        this.flow$ = new ReplaySubject(1);
        this.pauseOrResumeEvent$ = new Subject();
        this.events$ = this.flow$.pipe(switchMap((flow) => merge(this.flowEvents(flow), this.ngxFlowEvents())));
        this.transfers$ = this.events$.pipe(map(() => this.flowJs.files), map((files = []) => ({
            transfers: files.map((flowFile) => flowFile2Transfer(flowFile)),
            flow: this.flowJs,
            totalProgress: this.flowJs.progress(),
        })), shareReplay(1));
        this.somethingToUpload$ = this.transfers$.pipe(map((state) => state.transfers.some((file) => !file.success)), startWith(false));
    }
    set flowConfig(options) {
        if (isPlatformBrowser(this.platform)) {
            this.flowJs = new this.flowConstructor(options);
            this.flow$.next(this.flowJs);
        }
    }
    ngOnDestroy() {
        this.flow$.complete();
        this.pauseOrResumeEvent$.complete();
    }
    upload() {
        return this.flowJs.upload();
    }
    cancel() {
        return this.flowJs.cancel();
    }
    cancelFile(file) {
        return file.flowFile.cancel();
    }
    async pauseFile(file) {
        await file.flowFile.pause();
        this.pauseOrResumeEvent$.next();
    }
    resumeFile(file) {
        void file.flowFile.resume().catch(() => undefined);
        this.pauseOrResumeEvent$.next();
    }
    flowEvents(flow) {
        const events = FLOW_EVENTS.map((eventName) => this.listenForEvent(flow, eventName));
        return merge(...events);
    }
    ngxFlowEvents() {
        const pauseOrResumeEvent$ = this.pauseOrResumeEvent$.pipe(map(() => ({
            type: 'pauseOrResume',
        })));
        const newFlowInstanceEvent$ = this.flow$.pipe(map(() => ({
            type: 'newFlowJsInstance',
        })));
        return merge(pauseOrResumeEvent$, newFlowInstanceEvent$);
    }
    listenForEvent(flow, eventName) {
        return fromEvent(flow, eventName).pipe(map((event) => {
            const flowEvent = event;
            return {
                type: eventName,
                event: flowEvent,
                detail: flowEvent.detail,
            };
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowConfig, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.2.14", type: FlowConfig, isStandalone: true, selector: "[flowConfig]", inputs: { flowConfig: "flowConfig" }, exportAs: ["flow"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: FlowConfig, decorators: [{
            type: Directive,
            args: [{
                    selector: '[flowConfig]',
                    exportAs: 'flow',
                }]
        }], propDecorators: { flowConfig: [{
                type: Input
            }] } });

const directives = [
    FlowButton,
    FlowSrc,
    FlowDrop,
    FlowConfig,
];
class NgxFlowModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: NgxFlowModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "21.2.14", ngImport: i0, type: NgxFlowModule, imports: [FlowButton,
            FlowSrc,
            FlowDrop,
            FlowConfig], exports: [FlowButton,
            FlowSrc,
            FlowDrop,
            FlowConfig] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: NgxFlowModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.14", ngImport: i0, type: NgxFlowModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [...directives],
                    exports: directives,
                }]
        }] });

/*
 * Public API Surface of ngx-flow
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FlowButton, FlowConfig, FlowDrop, FlowInjectionToken, FlowSrc, NgxFlowModule };
//# sourceMappingURL=flowjs-ngx-flow.mjs.map

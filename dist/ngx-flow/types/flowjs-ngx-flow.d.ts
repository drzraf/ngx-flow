import * as i0 from '@angular/core';
import { ElementRef, OnInit, Renderer2, OnDestroy, InjectionToken } from '@angular/core';
import * as _flowjs_ngx_flow from '@flowjs/ngx-flow';
import { ReplaySubject, Subject, Observable } from 'rxjs';

type MaybePromise<T> = T | Promise<T>;
type FlowChunkState = 'pending' | 'reading' | 'uploading' | 'success' | 'error' | 'cancelled';
interface FlowHookContext {
    event: Event | null;
    flow: FlowInstance;
}
type FlowHook<TArguments extends unknown[], TResult = void> = ((...args: TArguments) => MaybePromise<TResult>) | ((...args: TArguments) => MaybePromise<TResult>)[];
interface FlowHooks {
    filterFile?: FlowHook<[File, FlowHookContext], boolean | void>;
    fileAdded?: FlowHook<[FlowFile, FlowHookContext]>;
    filesAdded?: FlowHook<[FlowFile[], FlowHookContext]>;
    filesSubmitted?: FlowHook<[FlowFile[], FlowHookContext]>;
}
interface FlowAddFileOptions {
    event?: Event | null;
    initFileFn?: FlowInitFileFn;
}
type FlowInitFileFn = (file: FlowFile, context: FlowHookContext) => MaybePromise<void>;
type FlowReadFileFn = (file: FlowFile, startByte: number, endByte: number, fileType: string, chunk: FlowChunk, context: {
    signal: AbortSignal;
}) => MaybePromise<Blob | ArrayBuffer | string | null | undefined>;
type FlowChunkChecksumFn = (chunk: FlowChunk, payload: Blob | ArrayBuffer | string) => MaybePromise<string>;
type FlowOptionValue<T> = T | ((file: FlowFile, chunk: FlowChunk, isTest: boolean) => T);
interface FlowOptions {
    target?: FlowOptionValue<string>;
    chunkSize?: number | ((file: FlowFile) => number);
    forceChunkSize?: boolean;
    simultaneousUploads?: number;
    singleFile?: boolean;
    fileParameterName?: string;
    progressCallbacksInterval?: number;
    speedSmoothingFactor?: number;
    query?: FlowOptionValue<Record<string, unknown>>;
    headers?: FlowOptionValue<Record<string, string>>;
    withCredentials?: boolean;
    preprocess?: (chunk: FlowChunk) => MaybePromise<void>;
    changeRawDataBeforeSend?: (chunk: FlowChunk, data: BodyInit | null) => MaybePromise<BodyInit | void>;
    method?: 'multipart' | 'octet';
    testMethod?: FlowOptionValue<string>;
    uploadMethod?: FlowOptionValue<string>;
    prioritizeFirstAndLastChunk?: boolean;
    allowDuplicateUploads?: boolean;
    testChunks?: boolean;
    generateUniqueIdentifier?: (file: File) => string;
    maxChunkRetries?: number;
    chunkRetryInterval?: number | null;
    chunkChecksum?: FlowChunkChecksumFn | null;
    allowShortStream?: boolean;
    streaming?: boolean;
    xhrTimeout?: number;
    permanentErrors?: number[];
    testNotFoundStatuses?: number[];
    successStatuses?: number[];
    onDropStopPropagation?: boolean;
    hooks?: FlowHooks;
    initFileFn?: FlowInitFileFn | null;
    readFileFn?: FlowReadFileFn;
}
interface FlowChunk {
    flowObj: FlowInstance;
    fileObj: FlowFile;
    offset: number;
    state: FlowChunkState;
    startByte: number;
    endByte: number;
    chunkSize: number;
    payload: unknown;
    checksum: string | null;
    progress(): number;
    sizeUploaded(): number;
    status(): FlowChunkState;
    message(): string;
}
interface FlowFile {
    flowObj: FlowInstance;
    file: File;
    name: string;
    relativePath: string;
    size: number;
    uniqueIdentifier: string;
    chunks: FlowChunk[];
    paused: boolean;
    cancelled: boolean;
    error: boolean;
    errorMessage: string | null;
    averageSpeed: number;
    currentSpeed: number;
    streaming: boolean;
    eof: boolean;
    pause(): Promise<void>;
    resume(): Promise<UploadSummary>;
    cancel(): Promise<void>;
    retry(): Promise<UploadSummary>;
    progress(): number;
    sizeUploaded(): number;
    timeRemaining(): number;
    isUploading(): boolean;
    isReading(): boolean;
    isComplete(): boolean;
    isSuccessful(): boolean;
    getExtension(): string;
    getType(): string | undefined;
}
interface UploadSummaryFile {
    file: FlowFile;
    status: 'complete' | 'error' | 'pending';
    error: string | null;
    uploadedBytes: number;
}
interface UploadSummary {
    status: 'complete' | 'cancelled' | 'error';
    files: UploadSummaryFile[];
    uploadedBytes: number;
    totalBytes: number;
    error?: unknown;
}
interface FlowEventBase<TType extends string> {
    type: TType;
    flow: FlowInstance;
}
interface FlowEventDetailMap {
    'upload-start': FlowEventBase<'upload-start'> & {
        files: FlowFile[];
    };
    'upload-resume': FlowEventBase<'upload-resume'> & {
        files: FlowFile[];
    };
    'file-progress': FlowEventBase<'file-progress'> & {
        file: FlowFile;
        chunk: FlowChunk;
        progress: number;
    };
    progress: FlowEventBase<'progress'> & {
        file: FlowFile;
        chunk: FlowChunk;
        progress: number;
    };
    'file-success': FlowEventBase<'file-success'> & {
        file: FlowFile;
        message: string;
        chunk: FlowChunk;
    };
    'file-error': FlowEventBase<'file-error'> & {
        file: FlowFile;
        message: string;
        chunk: FlowChunk;
    };
    error: FlowEventBase<'error'> & {
        message: string;
        file?: FlowFile;
        chunk?: FlowChunk;
        error?: unknown;
        hook?: string;
    };
    'file-retry': FlowEventBase<'file-retry'> & {
        file: FlowFile;
        chunk: FlowChunk;
    };
    'file-removed': FlowEventBase<'file-removed'> & {
        file: FlowFile;
    };
    complete: FlowEventBase<'complete'> & {
        files: FlowFile[];
        summary: UploadSummary;
    };
    'catch-all': {
        type: string;
        hook: boolean;
        detail: unknown;
    };
}
type FlowEventName = keyof FlowEventDetailMap;
type FlowEvent<TType extends FlowEventName> = CustomEvent<FlowEventDetailMap[TType]>;
interface FlowChangeEvent<TType extends FlowEventName> {
    type: TType;
    event: FlowEvent<TType>;
    detail: FlowEventDetailMap[TType];
}
interface FlowInstance extends EventTarget {
    readonly opts: FlowOptions;
    files: FlowFile[];
    supportDirectory?: boolean;
    assignBrowse(domNodes: Element | Element[] | ArrayLike<Element>, isDirectory?: boolean, singleFile?: boolean, attributes?: Record<string, string>): void;
    assignDrop(domNodes: Element | Element[] | ArrayLike<Element>): void;
    unAssignDrop(domNodes: Element | Element[] | ArrayLike<Element>): void;
    addFile(file: File, options?: FlowAddFileOptions): Promise<FlowFile>;
    addFiles(files: FileList | File[], options?: FlowAddFileOptions): Promise<FlowFile[]>;
    upload(): Promise<UploadSummary>;
    pause(): Promise<void>;
    resume(): Promise<UploadSummary>;
    cancel(): Promise<void>;
    removeFile(file: FlowFile): Promise<void>;
    getFromUniqueIdentifier(identifier: string): FlowFile | false;
    getSize(): number;
    sizeUploaded(): number;
    timeRemaining(): number;
    progress(): number;
    isUploading(): boolean;
}

declare class FlowButton {
    protected el: ElementRef<any>;
    protected _directoryOnly: boolean;
    set flowDirectoryOnly(directoriesOnly: boolean);
    protected _attributes?: Record<string, string>;
    set flowAttributes(attributes: Record<string, string>);
    protected _flow?: FlowInstance;
    set flow(flow: FlowInstance);
    protected _boundFlow?: FlowInstance;
    protected _boundAttributes?: string;
    protected _setupScheduled: boolean;
    setup(): void;
    protected applyAttributes(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlowButton, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlowButton, "[flowButton]", never, { "flowDirectoryOnly": { "alias": "flowDirectoryOnly"; "required": false; }; "flowAttributes": { "alias": "flowAttributes"; "required": false; }; "flow": { "alias": "flow"; "required": false; }; }, {}, never, never, true, never>;
}

declare class FlowDrop implements OnInit {
    protected el: ElementRef<any>;
    protected renderer: Renderer2;
    protected flowJs?: FlowInstance;
    set flow(flow: FlowInstance);
    enable(): void;
    disable(): void;
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlowDrop, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlowDrop, "[flowDrop]", ["flowDrop"], { "flow": { "alias": "flow"; "required": false; }; }, {}, never, never, true, never>;
}

interface Transfer {
    id: string;
    name: string;
    flowFile: FlowFile;
    progress: number;
    error: boolean;
    errorMessage: string | null;
    paused: boolean;
    cancelled: boolean;
    success: boolean;
    complete: boolean;
    currentSpeed: number;
    averageSpeed: number;
    size: number;
    timeRemaining: number;
    streaming: boolean;
}

declare class FlowSrc {
    private el;
    protected fileReader: any;
    set flowSrc(transfer: Transfer);
    static ɵfac: i0.ɵɵFactoryDeclaration<FlowSrc, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlowSrc, "[flowSrc]", never, { "flowSrc": { "alias": "flowSrc"; "required": false; }; }, {}, never, never, true, never>;
}

interface UploadState {
    transfers: Transfer[];
    totalProgress: number;
    flow: FlowInstance;
}

interface NgxFlowEvent {
    type: 'pauseOrResume' | 'newFlowJsInstance';
}
declare class FlowConfig implements OnDestroy {
    protected flowConstructor: _flowjs_ngx_flow.FlowConstructor;
    protected platform: Object;
    set flowConfig(options: FlowOptions);
    flowJs: FlowInstance;
    protected flow$: ReplaySubject<FlowInstance>;
    pauseOrResumeEvent$: Subject<void>;
    events$: Observable<FlowChangeEvent<FlowEventName> | NgxFlowEvent>;
    transfers$: Observable<UploadState>;
    somethingToUpload$: Observable<boolean>;
    ngOnDestroy(): void;
    upload(): Promise<UploadSummary>;
    cancel(): Promise<void>;
    cancelFile(file: Transfer): Promise<void>;
    pauseFile(file: Transfer): Promise<void>;
    resumeFile(file: Transfer): void;
    protected flowEvents(flow: FlowInstance): Observable<FlowChangeEvent<FlowEventName>>;
    protected ngxFlowEvents(): Observable<NgxFlowEvent>;
    protected listenForEvent<TType extends FlowEventName>(flow: FlowInstance, eventName: TType): Observable<FlowChangeEvent<TType>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlowConfig, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlowConfig, "[flowConfig]", ["flow"], { "flowConfig": { "alias": "flowConfig"; "required": false; }; }, {}, never, never, true, never>;
}

type FlowConstructor = new (flowOptions?: FlowOptions) => FlowInstance;

declare const FlowInjectionToken: InjectionToken<FlowConstructor>;

declare class NgxFlowModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxFlowModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NgxFlowModule, never, [typeof FlowButton, typeof FlowSrc, typeof FlowDrop, typeof FlowConfig], [typeof FlowButton, typeof FlowSrc, typeof FlowDrop, typeof FlowConfig]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NgxFlowModule>;
}

export { FlowButton, FlowConfig, FlowDrop, FlowInjectionToken, FlowSrc, NgxFlowModule };
export type { FlowAddFileOptions, FlowChangeEvent, FlowChunk, FlowChunkChecksumFn, FlowChunkState, FlowConstructor, FlowEvent, FlowEventBase, FlowEventDetailMap, FlowEventName, FlowFile, FlowHook, FlowHookContext, FlowHooks, FlowInitFileFn, FlowInstance, FlowOptionValue, FlowOptions, FlowReadFileFn, MaybePromise, NgxFlowEvent, Transfer, UploadState, UploadSummary, UploadSummaryFile };

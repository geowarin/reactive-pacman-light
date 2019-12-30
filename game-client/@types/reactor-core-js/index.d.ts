declare module 'reactor-core-js/flux' {
    import { Disposable } from "reactor-core-js";
    import { Publisher, Subscriber, Subscription } from "reactor-core-js/reactive-streams-spec";
    
    export class Flux<T> implements Publisher<T> {
        subscribe<S extends T>(s: Subscriber<S>): void;

        static from<T>(stream: Publisher<T>): Flux<T>;




        map<V> (mapper: (t: T) => V): Flux<V>;
        doOnNext(callback: (t: T) => void): Flux<T>;



        compose<V>(transformer: (flux: Flux<T>) => Publisher<V>): Flux<V> 
        static mergeArray<T>(sources: Flux<T>[]): Flux<T>;
        consume(): Disposable;
        consume(onNextCallback: (t: T) => void): Disposable;
        consume(onNextCallback: (t: T) => void, onErrorCallback: (e: Error) => void): Disposable;
        consume(onNextCallback: (t: T) => void, onErrorCallback: (e: Error) => void, onCompleteCallback: () => void): Disposable;
    }

    export class DirectProcessor<T> extends Flux<T> implements Subscriber<T> {
        onSubscribe(s: Subscription): void;
        onNext(t: T): void;
        onError(t: Error): void;
        onComplete(): void;
    }
// }

// declare module 'reactor-core-js/mono' {

    export class Mono<T> implements Publisher<T> {
        subscribe(): void
    }
}

declare module 'reactor-core-js' {
    export interface Disposable {
        dispose(): void;
    }
}

declare module 'reactor-core-js/reactive-streams-spec' {
    export interface Subscription {
        request(n: number): void;
        cancel(): void;
    }
    
    export interface Subscriber<T> {
        onSubscribe(s: Subscription): void;
        onNext(t: T): void;
        onError(t: Error): void;
        onComplete(): void;
    }
    
    export interface Publisher<T> {
        subscribe<S extends T>(s: Subscriber<S>): void;
    }
    
    export interface Processor<T, R> extends Subscriber<T>, Publisher<R> { }
}
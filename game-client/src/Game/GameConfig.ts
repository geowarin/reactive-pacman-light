export default interface Config {
    readonly zoom: number;
    readonly size: number;
    readonly scale: number;
    readonly map: {
        readonly width: number;
        readonly height: number;
    };
    readonly screen: {
        readonly width: number;
        readonly height: number;
    };
}
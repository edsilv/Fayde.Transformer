declare module Utils {
    class Bools {
        static GetBool(val: any, defaultVal: boolean): boolean;
    }
}
declare module Utils {
    class Color {
        static Float32ColorToARGB(float32Color: number): number[];
        private static _ComponentToHex(c);
        static RGBToHexString(rgb: number[]): string;
        static ARGBToHexString(argb: number[]): string;
        static Coalesce(arr: any[]): void;
    }
}
declare module Utils {
    class Dates {
        static GetTimeStamp(): number;
    }
}
declare module Utils.Maths {
    class Vector {
        X: number;
        Y: number;
        constructor(x: number, y: number);
        Get(): Vector;
        Set(x: number, y: number): void;
        Add(v: Vector): void;
        static Add(v1: Vector, v2: Vector): Vector;
        Sub(v: Vector): void;
        static Sub(v1: Vector, v2: Vector): Vector;
        Mult(n: number): void;
        static Mult(v1: Vector, v2: Vector): Vector;
        static MultN(v1: Vector, n: number): Vector;
        Div(n: number): void;
        static Div(v1: Vector, v2: Vector): Vector;
        static DivN(v1: Vector, n: number): Vector;
        Mag(): number;
        MagSq(): number;
        Normalise(): void;
        Limit(max: number): void;
        Equals(v: Vector): boolean;
        Heading(): number;
        static Random2D(): Vector;
        static FromAngle(angle: number): Vector;
    }
}
declare module Utils.Measurement {
    class Size {
        width: number;
        height: number;
        constructor(width: number, height: number);
    }
    class Dimensions {
        static FitRect(width1: number, height1: number, width2: number, height2: number): Size;
    }
}
declare module Utils {
    class Numbers {
        static NumericalInput(event: any): boolean;
    }
}
declare module Utils {
    class Objects {
        static ConvertToPlainObject(obj: any): any;
    }
}
declare module Utils {
    class Strings {
        static Ellipsis(text: string, chars: number): string;
        static HtmlDecode(encoded: string): string;
    }
}
declare module Utils {
    class Urls {
        static GetHashParameter(key: string, doc?: Document): string;
        static SetHashParameter(key: string, value: any, doc?: Document): void;
        static GetQuerystringParameter(key: string, w?: Window): string;
        static GetQuerystringParameterFromString(key: string, querystring: string): string;
        static SetQuerystringParameter(key: string, value: any, doc?: Document): void;
        static UpdateURIKeyValuePair(uriSegment: string, key: string, value: string): string;
        static GetUrlParts(url: string): any;
        static ConvertToRelativeUrl(url: string): string;
    }
}

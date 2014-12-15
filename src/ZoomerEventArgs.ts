
module Fayde.Zoomer {

    export class ZoomerEventArgs implements nullstone.IEventArgs {
        Size: Size;
        Offset: TranslateTransform;

        constructor (size: Size, offset: TranslateTransform) {
            Object.defineProperty(this, 'Size', { value: size, writable: false });
            Object.defineProperty(this, 'Offset', { value: offset, writable: false });
        }
    }
}
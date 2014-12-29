
module Fayde.Zoomer {

    export class ZoomerEventArgs implements nullstone.IEventArgs {
        Scale: Fayde.Media.ScaleTransform;
        Translate: Fayde.Media.TranslateTransform;

        constructor (scale: ScaleTransform, translate: TranslateTransform) {
            Object.defineProperty(this, 'Scale', { value: scale, writable: false });
            Object.defineProperty(this, 'Translate', { value: translate, writable: false });
        }
    }
}
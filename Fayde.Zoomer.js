var Fayde;
(function (Fayde) {
    (function (Zoomer) {
        Zoomer.Version = '0.1.0';
    })(Fayde.Zoomer || (Fayde.Zoomer = {}));
    var Zoomer = Fayde.Zoomer;
})(Fayde || (Fayde = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Fayde;
(function (Fayde) {
    (function (_Zoomer) {
        var Controls = Fayde.Controls;

        var Zoomer = (function (_super) {
            __extends(Zoomer, _super);
            function Zoomer() {
                _super.call(this);
                this.DefaultStyleKey = this.constructor;
            }
            Zoomer.prototype.OnApplyTemplate = function () {
                _super.prototype.OnApplyTemplate.call(this);
            };
            return Zoomer;
        })(Controls.Control);
        _Zoomer.Zoomer = Zoomer;
    })(Fayde.Zoomer || (Fayde.Zoomer = {}));
    var Zoomer = Fayde.Zoomer;
})(Fayde || (Fayde = {}));
//# sourceMappingURL=Fayde.Zoomer.js.map

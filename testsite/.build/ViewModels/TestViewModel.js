var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var Vector = Fayde.Utils.Vector;

    var TestViewModel = (function (_super) {
        __extends(TestViewModel, _super);
        function TestViewModel() {
            _super.call(this);

            this.ZoomLevel = 0;
        }
        Object.defineProperty(TestViewModel.prototype, "ZoomLevel", {
            get: function () {
                return this._ZoomLevel;
            },
            set: function (value) {
                this._ZoomLevel = value;

                this.OnPropertyChanged("ZoomLevel");
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TestViewModel.prototype, "ZoomContentSize", {
            get: function () {
                return this._ZoomContentSize;
            },
            set: function (value) {
                this._ZoomContentSize = value;
                this.OnPropertyChanged("ZoomContentSize");
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TestViewModel.prototype, "ZoomContentOffset", {
            get: function () {
                if (!this._ZoomContentOffset) {
                    this._ZoomContentOffset = new Vector(0, 0);
                }
                return this._ZoomContentOffset;
            },
            set: function (value) {
                this._ZoomContentOffset = value;
                this.OnPropertyChanged("ZoomContentOffset");
            },
            enumerable: true,
            configurable: true
        });


        TestViewModel.prototype.ZoomChanged = function (e) {
            this.ZoomContentSize = e.args.Size;
            this.ZoomContentOffset = e.args.Offset;
        };

        TestViewModel.prototype.ZoomIn_Click = function () {
            this.ZoomLevel += 1;
        };

        TestViewModel.prototype.ZoomOut_Click = function () {
            this.ZoomLevel -= 1;
        };

        TestViewModel.prototype.ScrollLeft_Click = function () {
        };

        TestViewModel.prototype.ScrollRight_Click = function () {
        };

        TestViewModel.prototype.ScrollUp_Click = function () {
        };

        TestViewModel.prototype.ScrollDown_Click = function () {
        };
        return TestViewModel;
    })(Fayde.MVVM.ViewModelBase);

    
    return TestViewModel;
});
//# sourceMappingURL=TestViewModel.js.map

/**
 * @return {Any}
 */
(function () {
    var exports = {};
    /*-
     * #%L
     * test
     * %%
     * Copyright (C) 2023 TODO: Enter Organization name
     * %%
     * TODO: Define header text
     * #L%
     */
    var SampleClass = /** @class */ (function () {
        function SampleClass() {
        }
        SampleClass.prototype.sum = function (x, y) {
            return x + y;
        };
        return SampleClass;
    }());
    exports.SampleClass = SampleClass;
    return exports;
});

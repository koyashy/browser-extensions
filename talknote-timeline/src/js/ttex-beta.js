"use strict";

/**
 * namespace
 */
var ttex = ttex || {};
ttex.beta = $.extend(true, {}, ttex);

/**
 * β版固有の機能
 */
(new class {
    style() {
        ttex.beta.App.EXTENSION_TITLE += " β";
    }
    reportIssue() {
        // TODO
    }
    main() {
        this.style();
        this.reportIssue();
    }
}).main();

/**
 * β実装の選択
 */
if (false) {
    ttex = ttex.beta;
}

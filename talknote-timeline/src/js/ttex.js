"use strict";

/**
 * namespace
 */
var ttex = ttex || {};

/**
 * ttex.App
 */
ttex.App = new class {
    constructor() {
        this.EXTENSION_TITLE = "TIMELINE @extention";
        this.NEWS_URL_PATTERN = /\/[^/]+\/news\/($|\?|#)/;
        this.HOMELINK_PATTERN = /^\/([^/]+)\/index\/.*/;
    }
    run() {
        ttex.NoticeContainer.init();
    }
    shouldRun() {
        if (this.onNews(location.pathname) && !ttex.NoticeContainer.ready()) {
            this.run();
        }
    }
    onNews(url) {
        return this.NEWS_URL_PATTERN.test(url);
    }
    homeLink() {
        let link = ttex.Html.homeLink();
        let url = link.attr("href");
        if (this.HOMELINK_PATTERN.test(url)) {
            let newsUrl = url.replace(this.HOMELINK_PATTERN, "/$1/news/");
            link.attr("title", ttex.App.EXTENSION_TITLE)
                .attr("href", newsUrl);
        }
    }
};

/**
 * ttex.NoticeContainer
 */
ttex.NoticeContainer = new class {
    constructor() {
        this.REPORT_ISSUE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z'+
            '0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/Ii'+
            'BpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9I'+
            'kFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1s'+
            'bnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJ'+
            'vdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLm'+
            'NvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiI'+
            'HhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpF'+
            'NTE3OEEyQTk5QTAxMUUyOUExNUJDMTA0NkE4OTA0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTE3OEEyQjk5QTAxMUUyOUE'+
            'xNUJDMTA0NkE4OTA0RCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1MTc4QTI4OTlBMDExRT'+
            'I5QTE1QkMxMDQ2QTg5MDREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1MTc4QTI5OTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREI'+
            'i8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+m4QGuQAAAyRJREFU'+
            'eNrEl21ojWEYx895TDPbMNlBK46IUiNmPvHBSUjaqc0H8pF5+aDUKPEBqU2NhRQpX5Rv5jWlDIWlMCv7MMSWsWwmb3tpXub4XXWdPHv'+
            'c9/Gc41nu+nedc7/8r/99PffLdYdDPsvkwsgkTBwsA/PADJCnzX2gHTwBt8Hl7p537/3whn04XoDZDcpBlk+9P8AFcAghzRkJwPF4zG'+
            'Gw0Y9QS0mAM2AnQj77FqCzrtcwB1Hk81SYojHK4DyGuQ6mhIIrBWB9Xm7ug/6B/nZrBHBegrkFxoVGpnwBMSLR9EcEcC4qb8pP14BWc'+
            'BcUgewMnF3T34VqhWMFkThLJAalwnENOAKiHpJq1FZgI2AT6HZtuxZwR9GidSHtI30jOrbawxlVX78/AbNfhHlomEUJJI89O2MqeE79'+
            'T8/nk8nMBm/dK576hZgmA3cp/R4l9/UeSxiHLVIlNm4nFfT0bxyuIj7LHRTKai+zdJobwMKzcZSJb0ePV5PKN+BqAAKE47UlMnERELM'+
            'M3EdYP/yrd+XYb2mOiYBiQ8OQnoRBlXrl9JZix7D1pHTazu4MoyBcnYamqAjIMTR8G4FT8LuhLsexXYYjICBiqhQBvYb6fLZIJCjPyp'+
            'VvaOoVAW2WcasCnL2Nq82xHJNSqlCeFcDshaPK0twkAhosjZL31QYw+1rlMpWGMArl23SBsZZO58F2tlJXmjOXS+s4WGvpMiBJT/I2P'+
            'InZ6lIs9/hBsNS1hS6BG0DSqmYEDRlCXQrmy50P1oDRKTSegmNbUsA0zDMwRhPJXeCE3vWLPQMvan6X8AgIa1vcR4AkGZkDR4ejJ1UH'+
            'psaVI0g2LInpOsNFUud1rhxSV+fzC9Woz2EZkWQuja7/B+jUrgtIMpy9YCW4n4K41YfzRneW5E1KJTe4B2Zq1Q5EHEtj4U3AfEzR5SV'+
            'Y4l7QYQPJdN2as7RKBF0BPZqqH4VgMAMBL8Byxr7y8zCZiDlnOcEKIPmUpgB5Z2ww5RdOiiRiNajUmWda5IG6WbhsyY2fx6m8gLcoJD'+
            'JFkH219M3We1+cnda93pfycZpIJEL/s/wSYADmOAwAQgdpBAAAAABJRU5ErkJggg==';
    }
    init() {
        this._title();
        this._markRead();
        this._resetEntries();
        // 通知がボックスに追加されたことをフックする
        (new MutationObserver(this._callNotice))
            .observe(ttex.Html.container().get(0), {childList: true});
        this._initComplete();
    }
    _callNotice(mutations) {
        mutations.forEach((mutation) => {
            $.each(mutation.addedNodes, (i, node) => {
                try {
                    let notice = new ttex.Notice($(node));
                    notice.load();
                } catch (e) {
                    console.error("Failed to process Notice", e);
                }
            });
        });
    }
    ready() {
        return !!ttex.Html.container().attr("data-ttex-init");
    }
    _initComplete() {
        ttex.Html.container().attr("data-ttex-init", true);
    }
    _title() {
        ttex.Html.title().text(ttex.App.EXTENSION_TITLE);
        ttex.Html.containerTitle().append(
            $(`<a><img src='${this.REPORT_ISSUE_IMAGE}' width='16' height='16' alt='report issue'></a>`)
                .addClass("__ttex_report_issue")
                .attr("href", "https://github.com/koyashy/browser-extensions/issues/new")
                .attr("title", "拡張機能のバグや改善要望を投稿します")
        );
    }
    _markRead() {
        $("<div class='__ttex_markread'></div>")
            .append($("<a>mark all read</a>")
                .attr("title", "表示されている通知を全て既読にします")
                .click((event) => {
                    $("li.status.unread .do_read_action").click();
                    return false;}))
            .appendTo(ttex.Html.markReadBox());
    }
    _resetEntries() {
        this._entries = new Set();
    }
    uniqueCall(uniqueKey, callback) {
        if (this._entries.has(uniqueKey)) {
            return;
        }
        this._entries.add(uniqueKey);
        callback();
    }
};

/**
 * ttex.Notice
 */
ttex.Notice = class {
    constructor(node) {
        this.node = node;
        if (!this.node.is("li.status")) {
            throw new Error("Unexpected node");
        }
    }
    load() {
        // 投稿かコメントのみを対象にする
        $("a:contains('投稿'), a:contains('コメント')", this.node).each((i, e) => {
            let postUrl = $(e).attr("href");
            let restUrl = ttex.TalknoteAPI.toRestUrl(postUrl);
            // 既出の投稿であればスキップ
            ttex.NoticeContainer.uniqueCall(restUrl, () => {
                ttex.TalknoteAPI.getPost(restUrl, (msg) => {
                    this._expandPost(msg);
                });
            });
        });
    }
    _expandPost(msg) {
        // ボックスを生成して投稿を表示する
        var loadBox = $("<div class='__ttex_readahead'></div>")
            .append(`${this.Companion._nameLink(msg)}`
                +`<p>${this.Companion._insertTags(msg.message)}</p>`);
        var commentBox = $("<ul class='__ttex_comment'></ul>").appendTo(loadBox);
        // コメントが多い場合は隠す設定をする
        if (msg.comment_array.length > 10) {
            this.Companion._hideManyComments(commentBox);
        }
        // コメントを表示する
        msg.comment_array.forEach((comment) => {
            commentBox.append(
                `<li>${this.Companion._nameLink(comment)}`
                +`<p>${this.Companion._insertTags(comment.message_com)}</p></li>`
            );
        });
        loadBox.appendTo(this.node);
    }
};

/**
 * ttex.Notice.Companion
 */
ttex.Notice.prototype.Companion = new class {
    constructor() {
        this.BR_PATTERN = /\r\n|\n|\r/g;
        this.HREF_PATTERN = /https?:\/\/\S+/g;
    }
    _br(str) {
        return str.replace(this.BR_PATTERN, "<br />");
    }
    _href(str) {
        return str.replace(this.HREF_PATTERN, "<a href='$&'>$&</a>");
    }
    _insertTags(str) {
        str = this._href(str);
        str = this._br(str);
        return str;
    }
    _nameLink(msg) {
        return `<a>${msg.user_name_sei} ${msg.user_name_mei}</a><time>${msg.regist_date}</time>`;
    }
    _hideManyComments(commentBox) {
        commentBox.addClass("__ttex_hide_more");
        $("<div class='__ttex_read_more'></div>")
            .insertBefore(commentBox)
            .append(
                $("<a>...more comments...</a>")
                    .attr("title", "以前のコメントをすべて表示します")
                    .click((event) => {
                        $(event.target).remove();
                        commentBox.removeClass("__ttex_hide_more");
                        return false;
            }));
    }
};

/**
 * ttex.TalknoteAPI
 */
ttex.TalknoteAPI = new class {
    constructor() {
        this.GROUP_POST_PATTERN = /^\/([^/]+)\/group\/([^/]+)\/msg\/([^/]+).*/;
        this.PUBLIC_POST_PATTERN = /^\/([^/]+)\/user\/[^/]+\/msg\/([^/]+).*/;
    }
    toRestUrl(url) {
        // グループへの投稿の場合
        if (this.GROUP_POST_PATTERN.test(url)) {
            return url.replace(this.GROUP_POST_PATTERN, "/$1/rest/group/$2/$3");
        }
        // 全社投稿の場合
        if (this.PUBLIC_POST_PATTERN.test(url)) {
            return url.replace(this.PUBLIC_POST_PATTERN, "/$1/rest/timeline/$2");
        }
        throw new Error("Unknown URL pattern");
    }
    getPost(url, callback) {
        $.getJSON(url, (res) => {
            if (res.status == 1) {
                callback(res.data.message);
            } else {
                console.error("Failed to get post", url, res);
            }
        });
    }
};

/**
 * ttex.Html
 */
ttex.Html = {
    homeLink() {
        return $(".talknote_logo a");
    },
    title() {
        return $("title, #title");
    },
    containerTitle() {
        return $("#title");
    },
    markReadBox() {
        return $("#title").parent();
    },
    container() {
        return $('#feed_container');
    }
};

/**
 * ttex.Chrome
 */
ttex.Chrome = {
    launch() {
        ttex.App.homeLink();
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                if (message.event == "moveToNewsPage") {
                    ttex.App.run();
                }
            });
        ttex.App.shouldRun();
    },
    background() {
        chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
            if (ttex.App.onNews(details.url)) {
                chrome.tabs.sendMessage(details.tabId, {event: "moveToNewsPage", data: details});
            }
        }, {url: [
            {hostEquals: "company.talknote.com"}
        ]});
    }
};

/**
 * ttex.Safari
 */
ttex.Safari = {
    launch() {
        ttex.App.homeLink();
        let loop = () => {
            ttex.App.shouldRun();
            setTimeout(loop, 1000);
        };
        loop();
    }
};

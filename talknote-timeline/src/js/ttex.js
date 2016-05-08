"use strict";

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
ttex.NoticeContainer = {
    init() {
        this._title();
        this._markRead();
        this._resetEntries();
        // 通知がボックスに追加されたことをフックする
        (new MutationObserver(this._callNotice))
            .observe(ttex.Html.container().get(0), {childList: true});
        this._initComplete();
    },
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
    },
    ready() {
        return !!ttex.Html.container().attr("data-ttex-init");
    },
    _initComplete() {
        ttex.Html.container().attr("data-ttex-init", true);
    },
    _title() {
        ttex.Html.title().text(ttex.App.EXTENSION_TITLE);
    },
    _markRead() {
        $("<div class='__ttex_markread'></div>")
            .append($("<a>mark all read</a>")
                .attr("title", "表示されている通知を全て既読にします")
                .click((event) => {
                    $("li.status.unread .do_read_action").click();
                    return false;}))
            .appendTo(ttex.Html.markReadBox());
    },
    _resetEntries() {
        this._entries = new Set();
    },
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

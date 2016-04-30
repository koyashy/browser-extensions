"use strict";

var ttex = ttex || {};

/**
 * ttex.App
 */
ttex.App = {};
ttex.App.run = function() {
    // console.time("Timeline-extension loop");
    ttex.NoticeContainer.init();
    // console.timeEnd("Timeline-extension loop");
};
ttex.App.shouldRun = function() {
    if (this.onNews(location.pathname) && !ttex.NoticeContainer.ready()) {
        this.run();
    }
};
ttex.App.NEWS_URL_PATTERN = /\/[^/]+\/news\/($|\?|#)/;
ttex.App.onNews = function(url) {
    return this.NEWS_URL_PATTERN.test(url);
};
ttex.App.HOMELINK_PATTERN = /^\/([^/]+)\/index\/.*/;
ttex.App.homeLink = function() {
    var link = ttex.Html.homeLink();
    var url = link.attr("href");
    if (this.HOMELINK_PATTERN.test(url)) {
        var newsUrl = url.replace(this.HOMELINK_PATTERN, "/$1/news/");
        link.attr("href", newsUrl);
    }
};

/**
 * ttex.NoticeContainer
 */
ttex.NoticeContainer = {};
ttex.NoticeContainer.init = function() {
    this._title();
    this._markRead();
    this.entries = [];
    // 通知がボックスに追加されたことをフックする
    (new MutationObserver(this._callNotice))
        .observe(ttex.Html.container().get(0), {childList: true});
    this._initComplete();
};
ttex.NoticeContainer._callNotice = function(mutations) {
    mutations.forEach(function(mutation) {
        $.each(mutation.addedNodes, function(i, node) {
            try {
                var notice = new ttex.Notice($(node));
                notice.load();
            } catch (e) {
                console.error("Failed to process Notice", e);
            }
        });
    });
};
ttex.NoticeContainer.ready = function() {
    return !!ttex.Html.container().attr("data-ttex-init");
};
ttex.NoticeContainer._initComplete = function() {
    ttex.Html.container().attr("data-ttex-init", true);
};
ttex.NoticeContainer._title = function() {
    ttex.Html.title().text("TIMELINE @extention");
};
ttex.NoticeContainer._markRead = function() {
    $("<div class='__ttex_markread'></div>")
        .append($("<a>mark all read</a>").click(function(event) {
            $("li.status.unread .do_read_action").click();
        }))
        .appendTo(ttex.Html.markReadBox());
};
ttex.NoticeContainer.uniqueCall = function(uniqueKey, callback) {
    if ($.inArray(uniqueKey, this.entries) !== -1) {
        return;
    }
    this.entries.push(uniqueKey);
    callback();
};

/**
 * ttex.Notice
 */
ttex.Notice = function(node) {
    this.node = node;
    if (!this.node.is("li.status")) {
        throw new Error("Unexpected node");
    }
};
ttex.Notice.prototype.load = function() {
    // this退避
    var self = this;
    // 投稿かコメントのみを対象にする
    $("a:contains('投稿'), a:contains('コメント')", self.node).each(function() {
        var postUrl = $(this).attr("href");
        var restUrl = ttex.TalknoteAPI.toRestUrl(postUrl);
        // 既出の投稿であればスキップ
        ttex.NoticeContainer.uniqueCall(restUrl, function() {
            ttex.TalknoteAPI.getPost(restUrl, function(msg) {
                self._expandPost(msg)
            });
        });
    });
};
ttex.Notice.prototype._expandPost = function(msg) {
    // this退避
    var self = this;
    // ボックスを生成して投稿を表示する
    var loadBox = $("<div class='__ttex_readahead'></div>")
        .append(self._nameLink(msg)+"<p>"+self._insertTags(msg.message)+"</p>");
    var commentBox = $("<ul class='__ttex_comment'></ul>").appendTo(loadBox);
    // コメントが多い場合は隠す設定をする
    if (msg.comment_array.length > 10) {
        self._hideManyComments(commentBox);
    }
    // コメントを表示する
    msg.comment_array.forEach(function(comment) {
        commentBox.append(
            "<li>"+self._nameLink(comment)
            +"<p>"+self._insertTags(comment.message_com)+"</p></li>"
        );
    });
    loadBox.appendTo(self.node);
};
ttex.Notice.prototype.BR_PATTERN = /\r\n|\n|\r/g;
ttex.Notice.prototype._br = function(str) {
    return str.replace(this.BR_PATTERN, "<br />");
};
ttex.Notice.prototype.HREF_PATTERN = /https?:\/\/\S+/g;
ttex.Notice.prototype._href = function(str) {
    return str.replace(this.HREF_PATTERN, "<a href='$&'>$&</a>");
};
ttex.Notice.prototype._insertTags = function(str) {
    str = this._href(str);
    str = this._br(str);
    return str;
};
ttex.Notice.prototype._nameLink = function(msg) {
    return "<a>"+msg.user_name_sei+" "+msg.user_name_mei+"</a><time>"+msg.regist_date+"</time>";
};
ttex.Notice.prototype._hideManyComments = function(commentBox) {
    commentBox.addClass("__ttex_hide_more");
    $("<div class='__ttex_read_more'></div>")
        .insertBefore(commentBox)
        .append(
            $("<a>...more comments...</a>")
                .click(function(event) {
                    $(this).remove();
                    commentBox.removeClass("__ttex_hide_more");
                    return false;
        }));
};

/**
 * ttex.TalknoteAPI
 */
ttex.TalknoteAPI = {};
ttex.TalknoteAPI.GROUP_POST_PATTERN = /^\/([^/]+)\/group\/([^/]+)\/msg\/([^/]+).*/;
ttex.TalknoteAPI.PUBLIC_POST_PATTERN = /^\/([^/]+)\/user\/[^/]+\/msg\/([^/]+).*/;
ttex.TalknoteAPI.toRestUrl = function(url) {
    // グループへの投稿の場合
    if (this.GROUP_POST_PATTERN.test(url)) {
        return url.replace(this.GROUP_POST_PATTERN, "/$1/rest/group/$2/$3");
    }
    // 全社投稿の場合
    if (this.PUBLIC_POST_PATTERN.test(url)) {
        return url.replace(this.PUBLIC_POST_PATTERN, "/$1/rest/timeline/$2");
    }
    throw new Error("Unknown URL pattern");
};
ttex.TalknoteAPI.getPost = function(url, callback) {
    $.getJSON(url, function(res) {
        if (res.status == 1) {
            callback(res.data.message);
        } else {
            console.error("Failed to get post", url, res);
        }
    });
};

/**
 * ttex.Html
 */
ttex.Html = {};
ttex.Html.homeLink = function() {
    return $(".talknote_logo a");
};
ttex.Html.title = function() {
    return $("title, #title");
};
ttex.Html.markReadBox = function() {
    return $("#title").parent();
};
ttex.Html.container = function() {
    return $('#feed_container');
};

/**
 * ttex.Chrome
 */
ttex.Chrome = {};
ttex.Chrome.launch = function() {
    ttex.App.homeLink();
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            if (message.event == "moveToNewsPage") {
                ttex.App.run();
            }
        });
    ttex.App.shouldRun();
};
ttex.Chrome.background = function() {
    chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
        if (ttex.App.onNews(details.url)) {
            chrome.tabs.sendMessage(details.tabId, {event: "moveToNewsPage", data: details});
        }
    }, {url: [
        {hostEquals: "company.talknote.com"}
    ]});
};

/**
 * ttex.Safari
 */
ttex.Safari = {};
ttex.Safari.launch = function() {
    ttex.App.homeLink();
    var loop = function() {
        ttex.App.shouldRun();
        setTimeout(loop, 1000);
    };
    loop();
};

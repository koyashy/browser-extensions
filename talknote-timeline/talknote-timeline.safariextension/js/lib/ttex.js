"use strict";

var ttex = ttex || {};

ttex.App = {};
ttex.App.run = function() {
    ttex.Title.replace();
    ttex.MarkRead.add();
    ttex.NoticeContainer.initialize();
};
ttex.App.newsUrlPattern = /\/[^/]+\/news\/($|\?|#)/;
ttex.App.onNews = function(url) {
    return this.newsUrlPattern.test(url);
};
ttex.App.shouldRun = function() {
    if (this.onNews(location.pathname) && !ttex.NoticeContainer.ready()) {
        this.run();
    }
};

ttex.NoticeContainer = {};
ttex.NoticeContainer.ready = function() {
    return !!ttex.Html.container().attr("data-ttex-init");
};
ttex.NoticeContainer.markReady = function() {
    ttex.Html.container().attr("data-ttex-init", true);
};
ttex.NoticeContainer.initialize = function() {
    this.entries = [];
    (new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            $.each(mutation.addedNodes, function(i, node) {
                try {
                    var notice = new ttex.Notice(node);
                    notice.load();
                } catch (e) {
                    console.error(e);
                }
            });
        });
    })).observe(ttex.Html.container().get(0), {childList: true});
    this.markReady();
};
ttex.NoticeContainer.unique = function(url, callback) {
    if ($.inArray(url, this.entries) !== -1) {
        return;
    }
    this.entries.push(url);
    callback(url);
};

ttex.Notice = function(node) {
    this.node = $(node);
    if (!this.node.is("li.status:not([data-ttex-loaded])")) {
        throw new Error("Unexpected node");
    }
};
ttex.Notice.prototype.load = function() {
    var self = this;
    $("a:contains('投稿'), a:contains('コメント')", self.node).each(function() {
        var postUrl = $(this).attr("href");
        var restUrl = ttex.TalknoteAPI.toRestUrl(postUrl);
        ttex.NoticeContainer.unique(restUrl, function() {
            ttex.TalknoteAPI.getPost(restUrl, function(msg) {
                var loadBox = $("<div class='__ttex_readahead'></div>")
                    .html(
                        ttex.NoticeHtml.nameLink(msg)
                        +"<p>"+ttex.NoticeHtml.insertTags(msg.message)+"</p>"
                    );
                var commentBox = $("<ul class='__ttex_comment'></ul>").appendTo(loadBox);
                if (msg.comment_array.length > 10) {
                    ttex.NoticeHtml.hideManyComments(commentBox);
                }
                $.each(msg.comment_array, function(i, comment) {
                    commentBox.append(
                        "<li>"
                        +ttex.NoticeHtml.nameLink(comment)
                        +"<p>"
                        +ttex.NoticeHtml.insertTags(comment.message_com)
                        +"</p></li>"
                    );
                });
                loadBox.appendTo(self.node);
            });
        });
    });
};

ttex.NoticeHtml = {};
ttex.NoticeHtml.brPattern = /\r\n|\n|\r/g;
ttex.NoticeHtml.br = function(str) {
    return str.replace(this.brPattern, "<br />");
};
ttex.NoticeHtml.hrefPattern = /https?:\/\/\S+/g;
ttex.NoticeHtml.href = function(str) {
    return str.replace(this.hrefPattern, "<a href='$&'>$&</a>");
};
ttex.NoticeHtml.insertTags = function(str) {
    str = this.href(str);
    str = this.br(str);
    return str;
};
ttex.NoticeHtml.nameLink = function(msg) {
    return "<a>"+msg.user_name_sei+" "+msg.user_name_mei+"</a><time>"+msg.regist_date+"</time>"
};
ttex.NoticeHtml.hideManyComments = function(commentBox) {
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
}

ttex.HomeLink = {};
ttex.HomeLink.pattern = /^\/([^/]+)\/index\/.*/;
ttex.HomeLink.replace = function() {
    var link = ttex.Html.homeLink();
    var url = link.attr("href");
    if (this.pattern.test(url)) {
        var newsUrl = url.replace(this.pattern, "/$1/news/");
        link.attr("href", newsUrl);
    }
};

ttex.MarkRead = {};
ttex.MarkRead.add = function() {
    $("<div class='__ttex_markread'></div>")
        .append($("<a>mark all read</a>").click(function(event) {
            $("li.status.unread .do_read_action").click();
        }))
        .appendTo(ttex.Html.markReadBox());
};

ttex.Title = {};
ttex.Title.replace = function() {
    ttex.Html.title().text("TIMELINE @extention");
};

ttex.TalknoteAPI = {};
ttex.TalknoteAPI.groupPostPattern = /\/([^/]+)\/group\/([^/]+)\/msg\/([^/]+).*/;
ttex.TalknoteAPI.publicPostPattern = /\/([^/]+)\/user\/[^/]+\/msg\/([^/]+).*/;
ttex.TalknoteAPI.toRestUrl = function(url) {
    // グループへの投稿の場合
    if (this.groupPostPattern.test(url)) {
        return url.replace(this.groupPostPattern, "/$1/rest/group/$2/$3");
    }
    // 全社投稿の場合
    if (this.publicPostPattern.test(url)) {
        return url.replace(this.publicPostPattern, "/$1/rest/timeline/$2");
    }
    throw new Error("Unknown URL pattern");
};
ttex.TalknoteAPI.getPost = function(url, callback) {
    $.getJSON(url, function(res) {
        if (res.status == 1) {
            var msg = res.data.message
            callback(msg);
        } else {
            console.error(res.errors);
        }
    });
};

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

ttex.Chrome = {};
ttex.Chrome.launch = function() {
    ttex.HomeLink.replace();
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

ttex.Safari = {};
ttex.Safari.launch = function() {
    ttex.HomeLink.replace();
    var loop = function() {
        ttex.App.shouldRun();
        setTimeout(loop, 1000);
    };
    loop();
};

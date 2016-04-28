"use strict";

var __ttex = {
    logoLinkPattern : /\/([^/]+)\/index\//,
    replace_logo_link : function(link) {
        var url = link.attr("href");
        if (this.logoLinkPattern.test(url)) {
            var news_url = url.replace(this.logoLinkPattern, "/$1/news/");
            link.attr("href", news_url);
        }
    },
    newsUrlPattern : /\/[^/]+\/news\//,
    onNewsPage : function() {
        return location.pathname.search(this.newsUrlPattern) == 0;
    },
    always : function() {
        return true;
    },
    brPattern : /\r\n|\n|\r/g,
    br : function(str) {
        return str.replace(this.brPattern, "<br />");
    },
    hrefPattern : /https?:\/\/\S+/g,
    href : function(str) {
        return str.replace(this.hrefPattern, "<a href='$&'>$&</a>");
    },
    insertTags : function(str) {
        str = this.href(str);
        str = this.br(str);
        return str;
    },
    groupPostPattern : /\/([^/]+)\/group\/([^/]+)\/msg\/([^/]+).*/,
    publicPostPattern : /\/([^/]+)\/user\/[^/]+\/msg\/([^/]+).*/,
    restUrl : function(url) {
        // グループへの投稿の場合
        if (this.groupPostPattern.test(url)) {
            return url.replace(this.groupPostPattern, "/$1/rest/group/$2/$3");
        }
        // 全社投稿の場合
        if (this.publicPostPattern.test(url)) {
            return url.replace(this.publicPostPattern, "/$1/rest/timeline/$2");
        }
        throw "Unknown URL pattern";
    },
    nameLink : function(msg) {
        return "<a>"+msg.user_name_sei+" "+msg.user_name_mei+"</a><time>"+msg.regist_date+"</time>"
    },
    entries : []
};

var __ttex_loop = function(loop_condition) {
    // console.time("Timeline-extension loop");
    __ttex.replace_logo_link($(".talknote_logo a"));
    if (__ttex.onNewsPage()) {
        if (!$("#feeds").attr("data-ttex-init")) {
            // 初期化処理
            $("title, #title").text("TIMELINE @extention");
            __ttex.entries = [];
            // 全て既読にするボタン
            $("<div class='__ttex_markread'></div>")
                .append($("<a>mark all read</a>").click(function(event) {
                    $("li.status.unread .do_read_action").click();
                }))
                .insertAfter($("#title"));

            (new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === "childList") {
                        $.each(mutation.addedNodes, function(i, e) {
                            $("li.status:not([data-ttex-loaded])", $(e).parent()).each(function() {
                                // 1件の通知
                                var item = $(this);
                                // 投稿かコメントのみを対象にする
                                var link = $("a:contains('投稿'), a:contains('コメント')", item)
                                    .each(function(){
                                        try {
                                            var link = $(this);
                                            var url = link.attr("href");
                                            // console.log(url);
                                            // API
                                            var restUrl = __ttex.restUrl(url)
                                            // console.log(restUrl);
                                            // 既出の投稿であればスキップ
                                            if ($.inArray(restUrl, __ttex.entries) !== -1) {
                                                // console.log("skip: "+url);
                                                return true;
                                            }
                                            __ttex.entries.push(restUrl);
                                            $.getJSON(restUrl, function(res){
                                                if (res.status == 1) {
                                                    var msg = res.data.message
                                                    // console.log(msg);
                                                    // ボックスを生成して投稿を読み込む
                                                    var loadBox = item.append("<div class='__ttex_readahead'></div>")
                                                        .children(".__ttex_readahead")
                                                        .html(
                                                            __ttex.nameLink(msg)
                                                            +"<p>"+__ttex.insertTags(msg.message)+"</p><ul class='__ttex_comment'></ul>"
                                                        );
                                                    var commentBox = $("ul", loadBox);
                                                    // コメントが多い場合は隠す
                                                    if (msg.comment_array.length > 10) {
                                                        commentBox.addClass("__ttex_hide_more");
                                                        $("<div class='__ttex_read_more'></div>")
                                                            .insertBefore(commentBox)
                                                            .append(
                                                                $("<a>...more comments...</a>")
                                                                    .click(function(event){
                                                                        $(this).remove();
                                                                        commentBox.removeClass("__ttex_hide_more");
                                                                        return false;
                                                            }));
                                                    }
                                                    // コメントを読み込む
                                                    $.each(msg.comment_array, function(i, comment){
                                                        commentBox.append(
                                                            "<li>"
                                                            +__ttex.nameLink(comment)
                                                            +"<p>"
                                                            +__ttex.insertTags(comment.message_com)
                                                            +"</p></li>"
                                                        );
                                                    });
                                                } else {
                                                    console.error(res.errors);
                                                }
                                            });
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                                $(item).attr("data-ttex-loaded", "");
                            });
                        });
                    }
                });
            })).observe($('#feed_container').get(0), {childList: true});

            $("#feeds").attr("data-ttex-init", true);
        }
    }
    // if (loop_condition()) {
    //     setTimeout(__ttex_loop, 1000, loop_condition);
    // }
    // console.timeEnd("Timeline-extension loop");
};

if (typeof chrome !== "undefined") {
    // console.log(chrome);
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            if (message.event == "onNewsPage") {
                // console.log(message);
                setTimeout(__ttex_loop, 500, __ttex.onNewsPage.bind(__ttex));
            }
        });
    __ttex_loop(__ttex.onNewsPage.bind(__ttex));
} else if (typeof safari !== "undefined") {
    // console.log(safari);
    setTimeout(__ttex_loop, 500, __ttex.always.bind(__ttex));
}

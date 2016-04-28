"use strict";

var __ttex = {
    entries : [],
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
    never : function() {
        return false;
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
    dom : {
        addMarkRead : function() {
            $("<div class='__ttex_markread'></div>")
                .append($("<a>mark all read</a>").click(function(event) {
                    $("li.status.unread .do_read_action").click();
                }))
                .insertAfter($("#title"));
        },
        hideManyComments : function(commentBox) {
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
    }
};

var __ttex_loop = function(loop_continue) {
    // console.time("Timeline-extension loop");
    __ttex.replace_logo_link($(".talknote_logo a"));
    if (__ttex.onNewsPage()) {
        if (!$("#feeds").attr("data-ttex-init")) {
            // 初期化処理
            $("title, #title").text("TIMELINE @extention");
            __ttex.entries = [];
            __ttex.dom.addMarkRead();

            // 通知がボックスに追加されたことをフックする
            (new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    $.each(mutation.addedNodes, function(i, e) {
                        var item = $(e);
                        if (!item.is("li.status:not([data-ttex-loaded])")) {
                            // 意図通りの要素でない場合はスキップ
                            return true;
                        }
                        // 投稿かコメントのみを対象にする
                        $("a:contains('投稿'), a:contains('コメント')", item).each(function() {
                            try {
                                // API
                                var restUrl = __ttex.restUrl($(this).attr("href"));
                                // 既出の投稿であればスキップ
                                if ($.inArray(restUrl, __ttex.entries) !== -1) {
                                    return true;
                                }
                                __ttex.entries.push(restUrl);
                                $.getJSON(restUrl, function(res) {
                                    if (res.status == 1) {
                                        var msg = res.data.message
                                        // ボックスを生成して投稿を表示する
                                        var loadBox = $("<div class='__ttex_readahead'></div>")
                                            .appendTo(item)
                                            .html(
                                                __ttex.nameLink(msg)
                                                +"<p>"+__ttex.insertTags(msg.message)+"</p>"
                                            );
                                        var commentBox = $("<ul class='__ttex_comment'></ul>").appendTo(loadBox);
                                        // コメントが多い場合は隠す設定をする
                                        if (msg.comment_array.length > 10) {
                                            __ttex.dom.hideManyComments(commentBox);
                                        }
                                        // コメントを表示する
                                        $.each(msg.comment_array, function(i, comment) {
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
            })).observe($('#feed_container').get(0), {childList: true});

            $("#feeds").attr("data-ttex-init", true);
        }
    }
    if (loop_continue()) {
        setTimeout(__ttex_loop, 1000, loop_continue);
    }
    // console.timeEnd("Timeline-extension loop");
};

if (typeof chrome !== "undefined") {
    // Chromeの場合、newsへの遷移をフックできる。ループしない
    // console.log(chrome);
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            if (message.event == "moveToNewsPage") {
                // console.log(message);
                __ttex_loop(__ttex.never);
            }
        });
    __ttex_loop(__ttex.never);
} else if (typeof safari !== "undefined") {
    // Safariの場合、newsへの遷移をフックできない。常にループする
    // console.log(safari);
    __ttex_loop(__ttex.always);
}

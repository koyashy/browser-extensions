var __ttex = {
    onNewsPage : function() {
        return location.pathname.search(/\/[^/]+\/news\//) == 0;
    },
    always : function() {
        return true;
    },
    br : function(str) {
        return str.replace(/\r\n|\n|\r/g, "<br />");
    },
    href : function(str) {
        return str.replace(/https?:\/\/\S+/g, "<a href='$&'>$&</a>");
    },
    insertTags : function(str) {
        str = this.href(str);
        str = this.br(str);
        return str;
    },
    groupPostPattern : /\/([^/]+)\/group\/([^/]+)\/msg\/([^/]+)/,
    publicPostPattern : /\/([^/]+)\/user\/[^/]+\/msg\/([^/]+)/,
    restUrl : function(url) {
        // グループへの投稿の場合
        if (this.groupPostPattern.test(url)) {
            var match = this.groupPostPattern.exec(url);
            return "/"+match[1]+"/rest/group/"+match[2]+"/"+match[3];
        }
        // 全社投稿の場合
        if (this.publicPostPattern.test(url)) {
            var match = this.publicPostPattern.exec(url);
            return "/"+match[1]+"/rest/timeline/"+match[2];
        }
        throw "Unknown URL pattern";
    },
    nameLink : function(msg) {
        return "<a>"+msg.user_name_sei+" "+msg.user_name_mei+"</a><time>"+msg.regist_date+"</time><br />"
    },
    entries : []
};

var __ttex_loop = function(loop_condition) {
    // console.timeStamp("Timeline-extension loop");
    if (__ttex.onNewsPage()) {
        if (!$("#feeds").attr("data-ttex-init")) {
            // 初期化処理
            $("title, .container_title h2").text("TIMELINE @extention");
            __ttex.entries = [];
            $("#feeds").attr("data-ttex-init", true);
        }
        $("#feeds li.status:not([data-ttex-loaded])").each(function() {
            // 1件の通知
            var item = $(this);
            // console.log($(".message_text", item).text().trim());
            // 投稿かコメントのみを対象にする
            var link = $("a:contains('投稿'), a:contains('コメント')", item)
                .css("border", "1px solid #f99")
                .each(function(){
                    try {
                        var link = $(this);
                        var url = link.attr("href");
                        // console.log(url);
                        // API
                        var restUrl = __ttex.restUrl(url)
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
                                // コメントを読み込む
                                $.each(msg.comment_array, function(i, comment){
                                    $("ul", loadBox).append(
                                        "<li>"
                                        +__ttex.nameLink(comment)
                                        +__ttex.insertTags(comment.message_com)
                                        +"</li>"
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
    }
    if (loop_condition()) {
        setTimeout(__ttex_loop, 1000, loop_condition);
    }
};

if (typeof chrome !== "undefined") {
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            if (message.event == "onNewsPage") {
                // console.log(message);
                __ttex_loop(__ttex.onNewsPage);
            }
        });
    __ttex_loop(__ttex.onNewsPage);
} else if (typeof safari !== "undefined") {
    // console.log(safari);
    __ttex_loop(__ttex.always);
}

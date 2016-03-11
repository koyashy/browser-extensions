
var onNewsPage = function(url) {
    return url.search(/\/[^/]+\/news\//) !== -1;
};

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    // console.log(details);
    if (onNewsPage(details.url)) {
        chrome.tabs.sendMessage(details.tabId, {event: "onNewsPage", data: details});
    }
}, {url: [
    {hostEquals: "company.talknote.com"}
]});

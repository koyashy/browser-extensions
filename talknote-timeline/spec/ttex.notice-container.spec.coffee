describe 'ttex.NoticeContainer', ->

    describe 'init()', ->
        it 'call title(), markRead(), MutationObserver#observe(), initComplete()', ->
            spyOn ttex.NoticeContainer, '_title'
            spyOn ttex.NoticeContainer, '_markRead'
            spyOn MutationObserver.prototype, 'observe'
            spyOn ttex.NoticeContainer, '_initComplete'
            container = $('<ul id="feed_container"></ul>')
            spyOn(ttex.Html, 'container').and.returnValue container
            ttex.NoticeContainer.init()
            expect(ttex.NoticeContainer._title).toHaveBeenCalled()
            expect(ttex.NoticeContainer._markRead).toHaveBeenCalled()
            expect(MutationObserver.prototype.observe).toHaveBeenCalledWith(
                container.get(0), {childList: true})
            expect(ttex.NoticeContainer._initComplete).toHaveBeenCalled()

    describe '_callNotice for MutationObserver', ->
        it 'call Notice#load for each node', ->
            li = $('<li class="status"></li>')
            mutations = [{addedNodes : [li]}, {addedNodes : [li]}]
            spyOn(ttex.Notice.prototype, 'load')
            ttex.NoticeContainer._callNotice(mutations)
            expect(ttex.Notice.prototype.load.calls.count()).toBe 2

    describe 'ready(), _initComplete()', ->
        it 'return true after _initComplete() called', ->
            container = $('<ul id="feed_container"></ul>')
            spyOn(ttex.Html, 'container').and.returnValue container
            expect(ttex.NoticeContainer.ready()).toBe false
            ttex.NoticeContainer._initComplete()
            expect(ttex.NoticeContainer.ready()).toBe true

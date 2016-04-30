describe 'ttex.NoticeContainer', ->

    describe 'init()', ->
        it 'call _title(), _markRead(), _resetEntries(), MutationObserver#observe(), _initComplete()', ->
            spyOn ttex.NoticeContainer, '_title'
            spyOn ttex.NoticeContainer, '_markRead'
            spyOn ttex.NoticeContainer, '_resetEntries'
            spyOn MutationObserver.prototype, 'observe'
            spyOn ttex.NoticeContainer, '_initComplete'
            container = $('<ul id="feed_container"></ul>')
            spyOn(ttex.Html, 'container').and.returnValue container
            ttex.NoticeContainer.init()
            expect(ttex.NoticeContainer._title).toHaveBeenCalled()
            expect(ttex.NoticeContainer._markRead).toHaveBeenCalled()
            expect(ttex.NoticeContainer._resetEntries).toHaveBeenCalled()
            expect(MutationObserver.prototype.observe).toHaveBeenCalledWith(
                container.get(0), {childList: true})
            expect(ttex.NoticeContainer._initComplete).toHaveBeenCalled()

    describe '_callNotice for MutationObserver', ->
        it 'call Notice#load for each node', ->
            li = $('<li class="status"></li>')
            mutations = [{addedNodes : [li, li]}, {addedNodes : [li]}]
            spyOn(ttex.Notice.prototype, 'load')
            ttex.NoticeContainer._callNotice(mutations)
            expect(ttex.Notice.prototype.load.calls.count()).toBe 3

    describe 'ready(), _initComplete()', ->
        it 'return true after _initComplete() called', ->
            container = $('<ul id="feed_container"></ul>')
            spyOn(ttex.Html, 'container').and.returnValue container
            expect(ttex.NoticeContainer.ready()).toBe false
            ttex.NoticeContainer._initComplete()
            expect(ttex.NoticeContainer.ready()).toBe true

    describe 'uniqueCall()', ->
        beforeEach ->
            ttex.NoticeContainer._resetEntries()
            this.callback = jasmine.createSpy 'callback'

        it 'callback uniquely by given key', ->
            ttex.NoticeContainer.uniqueCall('key1', this.callback)
            expect(this.callback.calls.count()).toBe 1
            ttex.NoticeContainer.uniqueCall('key1', this.callback)
            expect(this.callback.calls.count()).toBe 1

        it 'callback uniquely by given key', ->
            ttex.NoticeContainer.uniqueCall('key1', this.callback)
            expect(this.callback.calls.count()).toBe 1
            ttex.NoticeContainer.uniqueCall('key2', this.callback)
            expect(this.callback.calls.count()).toBe 2
            ttex.NoticeContainer.uniqueCall('key1', this.callback)
            expect(this.callback.calls.count()).toBe 2

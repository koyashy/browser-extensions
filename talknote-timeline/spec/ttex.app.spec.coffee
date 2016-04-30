describe 'ttex.App', ->

    describe 'run()', ->
        beforeEach ->
            spyOn ttex.NoticeContainer, 'init'

        it 'call ttex.NoticeContainer.init()', ->
            ttex.App.run()
            expect(ttex.NoticeContainer.init).toHaveBeenCalled()

    describe 'shouldRun()', ->
        beforeEach ->
            spyOn ttex.NoticeContainer, 'init'

        it 'conditional call ttex.NoticeContainer.init()', ->
            spyOn(ttex.App, 'onNews').and.returnValue true
            spyOn(ttex.NoticeContainer, 'ready').and.returnValue false
            ttex.App.shouldRun()
            expect(ttex.NoticeContainer.init).toHaveBeenCalled()

        it 'conditional call ttex.NoticeContainer.init()', ->
            spyOn(ttex.App, 'onNews').and.returnValue false
            spyOn(ttex.NoticeContainer, 'ready').and.returnValue false
            ttex.App.shouldRun()
            expect(ttex.NoticeContainer.init).not.toHaveBeenCalled()

        it 'conditional call ttex.NoticeContainer.init()', ->
            spyOn(ttex.App, 'onNews').and.returnValue true
            spyOn(ttex.NoticeContainer, 'ready').and.returnValue true
            ttex.App.shouldRun()
            expect(ttex.NoticeContainer.init).not.toHaveBeenCalled()

    describe 'onNews()', ->
        it 'match url', ->
            url = '/abcd.com/news/'
            expect(ttex.App.onNews(url)).toBe true

        it 'match url', ->
            url = 'http://talknote.com/abcd.com/news/'
            expect(ttex.App.onNews(url)).toBe true

        it 'dont match url', ->
            url = '/abcd.com/index/'
            expect(ttex.App.onNews(url)).toBe false

        it 'dont match url', ->
            url = '/abcd.com/news/child/'
            expect(ttex.App.onNews(url)).toBe false

    describe 'homeLink()', ->
        it 'replace home href', ->
            href = '/abcd.com/index/'
            link = $("<a href='#{ href }' />")
            spyOn(ttex.Html, 'homeLink').and.returnValue link
            ttex.App.homeLink()
            expect(link.attr('href')).toBe '/abcd.com/news/'

        it 'dont replace other href', ->
            href = '/abcd.com/foo/'
            link = $("<a href='#{ href }' />")
            spyOn(ttex.Html, 'homeLink').and.returnValue link
            ttex.App.homeLink()
            expect(link.attr('href')).not.toBe '/abcd.com/news/'

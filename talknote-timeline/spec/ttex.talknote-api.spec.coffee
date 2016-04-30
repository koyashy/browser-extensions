describe 'ttex.TalknoteAPI', ->

    describe 'toRestUrl()', ->
        it 'make rest URL from group post URL', ->
            postUrl = '/abc.com/group/103306/msg/8182243/ntc/9693976#last_comment'
            expect(ttex.TalknoteAPI.toRestUrl(postUrl))
                .toBe '/abc.com/rest/group/103306/8182243'

        it 'make rest URL from public post URL', ->
            postUrl = '/abc.com/user/1000019517/msg/1729928/ntc/9660587#last_comment'
            expect(ttex.TalknoteAPI.toRestUrl(postUrl))
                .toBe '/abc.com/rest/timeline/1729928'

        it 'throw Error for unknown URL', ->
            postUrl = '/abc.com/foo'
            expect(-> ttex.TalknoteAPI.toRestUrl(postUrl)).toThrow();

    describe 'getPost', ->
        it 'get JSON and callback', ->
            spyOn($, 'getJSON').and.callFake( (url, getJsonCallback) ->
                    getJsonCallback({status : 1, data : {message: 'msg'}}) )
            getPostCallback = jasmine.createSpy('getPostCallback');
            ttex.TalknoteAPI.getPost('/abc.com/dummy', getPostCallback)
            expect($.getJSON).toHaveBeenCalledWith('/abc.com/dummy', jasmine.any(Function))
            expect(getPostCallback).toHaveBeenCalledWith('msg')

        it 'get JSON bad status and dont callback', ->
            spyOn($, 'getJSON').and.callFake( (url, getJsonCallback) ->
                    getJsonCallback({status : 100, data : {message: 'msg'}}) )
            getPostCallback = jasmine.createSpy('getPostCallback');
            spyOn(console, 'error')
            ttex.TalknoteAPI.getPost('/abc.com/dummy', getPostCallback)
            expect($.getJSON).toHaveBeenCalledWith('/abc.com/dummy', jasmine.any(Function))
            expect(getPostCallback).not.toHaveBeenCalled()
            expect(console.error).toHaveBeenCalled()

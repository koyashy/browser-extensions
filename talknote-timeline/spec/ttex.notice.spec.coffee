describe 'ttex.Notice', ->

    describe 'load()', ->
        beforeEach ->
            ttex.NoticeContainer._resetEntries()
            this.href1 = '/abc.com/group/103306/msg/1111111/ntc/9693976#last_comment'
            this.href2 = '/abc.com/group/103306/msg/2222222/ntc/9693976#last_comment'
            this.li = (href) -> $("
            <li class='status'>
                <a href='#{ href }'>投稿</a>
            </li>")

        it 'call TalknoteAPI.getPost() uniquely', ->
            dup_notice1 = new ttex.Notice(this.li(this.href1))
            dup_notice2 = new ttex.Notice(this.li(this.href1))
            spyOn ttex.TalknoteAPI, 'getPost'
            dup_notice1.load()
            expect(ttex.TalknoteAPI.getPost.calls.count()).toBe 1
            dup_notice2.load()
            expect(ttex.TalknoteAPI.getPost.calls.count()).toBe 1

        it 'call TalknoteAPI.getPost() uniquely', ->
            notice = new ttex.Notice(this.li(this.href1))
            another = new ttex.Notice(this.li(this.href2))
            spyOn ttex.TalknoteAPI, 'getPost'
            notice.load()
            expect(ttex.TalknoteAPI.getPost.calls.count()).toBe 1
            another.load()
            expect(ttex.TalknoteAPI.getPost.calls.count()).toBe 2

    describe '_expandPost for TalknoteAPI.getPost()', ->
        it 'expand msg contents', ->
            li = $("<li class='status'></li>")
            msg = {
                message : 'post'
                user_name_sei : 'White'
                user_name_mei : 'Tom'
                regist_date : '2016/01/01'
                comment_array : [
                    {
                        message_com : 'comment'
                        user_name_sei : 'Brown'
                        user_name_mei : 'Cathy'
                        regist_date : '2016/01/02'
                    }, {
                        message_com : 'comment2'
                        user_name_sei : 'Red'
                        user_name_mei : 'Yoshida'
                        regist_date : '2016/01/03'
                    }
                ]
            }
            notice = new ttex.Notice(li)
            notice._expandPost(msg)
            expect(li.text()).toBe 'White Tom2016/01/01post'+
                'Brown Cathy2016/01/02comment'+'Red Yoshida2016/01/03comment2'

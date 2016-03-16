describe 'Hello', ->
  it 'say hello!', ->
    hello = new Hello()
    result = hello.say()
    expect(result).toBe 'Hello!'

---

title:	"The Else Statement Smell"
date:	2019-06-21
---

  There is a pattern we've started talking about at work recently that have to do with the else block and by extension the if block. It can be written in different ways but you can easily spot it in two ways:

1. The missing else
2. The else that assumes but doesn't assert

Point 1 above is code that begs the question: yea ok, so if X then Y. But what about all other cases? (Early returns are an exception, they are ok)

If you introduce an else instead of falling though you get to point 2. From my experience it seems like an else clause that has no assert/throw in it is often brittle, i.e. it's correct *now* but when the code is expanded it will break in subtle ways because the else clause assumes something about the state that is no longer true. This becomes more and more probable the longer the if/elseif/else chain is. So if it's just one if statement the probability is fairly low but it goes up quite fast as soon as there is one elseif. The most obvious example is of course when there's a comment on the else block saying "x and y is true here". In these cases my internal voice goes "Really? If you thought so, why didn't you assert those things?"

I'm a big fan of else blocks containing a blanket assert false (with some comment preferably). This means the code doesn't fail silently when the assumptions change.


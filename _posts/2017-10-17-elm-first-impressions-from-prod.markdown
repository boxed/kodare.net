---
title:	"Elm first impressions from prod"
date:	2017-10-17
tags: [programming, elm]
author: Anders Hovmöller
---

(If you're coming from /r/elm to read this, please mail me directly. I was banned there so can't reply)

Since [writing my scathing initial article on Elm](https://hackernoon.com/a-small-dive-into-and-rejection-of-elm-8217fd5da235) I've mollified my position and eventually I was part of the group who pushed to start using Elm for production. It's not because I love Elm (which should be obvious if you read the article linked above), but because I think it's the best option available right now. We've used it for a while now so here are some initial impressions. I'll start with:

### The bad

#### Major language issues

* Currying is annoying. Mistakes where you miss to supply a parameter to some function/constructor creates type errors instead of a compiler error telling you you missed an argument. Sometimes you get a friendly error telling you this. Sometimes it even points you to the actual function. But far from every time and many times you get a really big and hard to read type mismatch error somewhere else. Just having to explicitly say "partial x foo" instead of "x foo" would be much better I think. It would localize errors, make the code more explicit, and not increase code size in many places. A symbol for partial evaluation would also be ok with the advantage of being shorter. Another solution I've come up with would be to have [syntax highlighting for currying](https://github.com/durkiewicz/elm-plugin/issues/74).
* Using the type inference instead of explicitly typing all functions often leads to hard to understand errors far from the place where I made a mistake. This is partially because of currying but not exclusively. I now always write types first just to get errors closer to where I screw up, and I sometimes break expressions into smaller parts just to be able to type them and get better error messages.
* Positional arguments are a bad default in all languages, and the total lack of keyword arguments is even worse. Because of currying the language can't have default arguments which creates code that is annoying to write, annoying to read, overly verbose and inflexible. Types might save you from making mistakes, but only when the types are all unique and types only sometimes makes the reading experience better.

#### Lots of boilerplate

We solve this category of problems with a code generator (an old version [is available on github](https://github.com/boxed/elm-cog), I'll publish new versions periodically with updates from what we learn in production). Using code generators has upsides, but I think it also shows some serious lack of features in Elm.

* Json decoders for records with Json.Decode.Pipeline isn't great because it relies on positional arguments. This seems wrong to me since you can create records with named members which is a lot less error prone. If you always have distinct types for each element that you are decoding, positional arguments are at least not prone to bugs, but this seems like it would be the exception and not the rule.
* Generally json decoders become a big chunk of the code and it's almost all trivial and would be better if it was written by a computer.
* I do miss some kind of compile time logic thing. Maybe not full macros, but it's annoying to not be able to assert at compile time that certain invariants are true, like list constants having the same length or case blocks having at least the same number of cases as a union type. These simple compile time assertions would make it a lot easier to not make mistakes when writing all that boilerplate.
* Reusing GUI elements is not so nice. We haven't resorted to effect managers yet, but instead we've ended up with the model-update-msg triple (in some places) that we've been warned against many times (never with any good alternative proposed I think!). This isn't great, but I don't see much of an alternative at this point.

#### Grab bad

* evancz/url-parse UrlParser.elm doesn't expose parseParams and toKeyValuePair, trying to force you to use a very complex parser API even for simple things. These would be better as exported functions.
* No support for trailing commas creates silly looking code with commas in front of lines. You still can't insert at the first position of a list/record/union without screwing up blame so this is just a straight loss as far as I can tell.
* Dict.getWithDefault is missing. This means you get `foo = withDefault ( Dict.get "foo" params)` when `foo = Dict.getWithDefault "foo" params ""` would have been much nicer. (With optional keyword arguments in the language it could be improved further.)
* No constants in case expressions (only literals are accepted). This means you can't even use constants for something like character codes in case expressions. This seems silly to me and I hope this is an oversight that will be remedied.
* I often go to <http://elm-lang.org/docs/syntax> to try to find something and can't find what I'm looking for. Some words that aren't on that page at all: switch, compare, equal, call, !=, etc. <http://elm-lang.org/docs/from-javascript> lacks all of these too. "++" as string concatenation is missing from the syntax page, but is on the from-javascript page but there you can't search for the word "concatenation" or even "concat".
* I miss list/dict/set comprehensions. It's much nicer I think to be able to start thinking "I want a list here" instead of doing List.map or whatever. Especially pythons list comprehensions shine here with readable syntax and flexibility where you can do `[x.y for x in bar if x.z != 2]` which in elm becomes the not so nice `List.map .y (List.filter (x -> x.z /= 2) bar)`.
* Currying makes it impossible to overload on the arity of functions. This results in all those `[]` all over your views for empty attribute lists. It's a minor thing, but something ClojureScript/reagent does better.
* I miss a lot of small convenience string functions that I'm used to in Python: String.split (and rsplit) with a limit, String.partition (and rpartition), String.replace.. stuff like that.

### The good

This is a short list, but every point in it is a huge deal.

* I have yet to have a runtime exception. Pretty damn great!
* elm-format is amazing. I've written code many times that I think looks quite unreadable and then after elm-format it's readable. Very impressive!
* The error message are very good.
* Elm code is quite readable and much nicer than ClojureScript which was our main contender. Elm-format is a part of this for sure.
* The Elm Architecture is very nice, even if it's a bit awkward to scale up beyond trivial pages.
* Knowing that all .elm files are 100% pure is fantastic.

### Summary

So far I am optimistic. I feel a lot more confident about the Elm code than I've ever felt about ClojureScript code. Especially when writing front end code this is very important to us, because we spend most our time on the back end so we need a language where it's possible to make changes without mistakes even when we haven't used that language for weeks or even months. Having the compiler smack us on the fingers instead of having crashes in the customer browser is very nice. "If it compiles, it works" is pretty close to the truth.

If you want to use Elm at work, I strongly suggest to set up some kind of code generator from day one. It will save you time and prevent errors, especially when it comes to json decoders/encoders. It will also make it easier to make sure your front end code is in sync with your back end.

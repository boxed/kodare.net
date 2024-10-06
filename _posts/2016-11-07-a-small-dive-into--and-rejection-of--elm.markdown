---
title:	"A small dive into, and rejection of, Elm"
date:	2016-11-07
tags: [programming, elm]
---

I am always dissatisfied with the state of front end development. I did a fairly deep dive into ClojureScript and found it nice initially but ultimately lacking in some key areas. I've also done my stint in JQuery and Angular land (and tried for a few hours trying to get Ember to even work, but decided that it was enough that it was so nasty in the beginning). Those are clearly much worse than ClojureScript + reagent.

So this lead me naturally to Elm. I've heard great things: awesome error messages, great type safety leading to no runtime errors, functional programming goodness, super fast rendering, etc. I was intent on making a strong case for Elm as a replacement for Angular at work. I came in with the (quite unfounded) strong faith that this, this must finally be acceptable or even good.

I took the simplest angular backed page at work as a starting point. The idea being that I could produce an Elm version and then compare that in amount of code, readability, etc to the existing code. This page is a super simple log viewer with a GUI basically like this:


```
[search field] time range: [select box with 3 choices] page size: [select box 3 choices] [checkbox] verbosity
[list of results with tags and stuff]
```

Seems easy enough? Turns out it's pretty icky and enough for me to reject Elm. I'll cut to the chase here. Things I liked with Elm:

* the error message are mostly pretty damn good
* the compiler is fast enough (this is high praise!)
* the Elm Architecture is great
And now the deal breaker:

There is no reasonable or agreed upon way to do select boxes. You might at this point go "what?! isn't that pretty basic stuff?" and I'd argue that you'd be right. The more I dug into this problem the more my conclusion solidified: Elm is:

* not ready for serious use
* a language that seems to inherit not just nice types and largely ok or even nice syntax from Haskell but also a stubborn approach to prefer (imagined) purity over practicality, resulting in core language features that could be useful but in practice can't be used
Let's go over the problem. A select box contains a list of options that

* are unique (for most uses anyway)
* have a user facing string
* have some internal ID
Elm has what are called union types which models the first point super nicely:

```haskell
type TimeRange = AllTime | OneWeek | OneDay
```

To create a user facing string from that is also pretty nice:

```haskell
timeRangeDisplayName : TimeRange -> StringtimeRangeDisplayName timeRange =  
 case timeRange of  
 AllTime -> "All time"  
 OneWeek -> "One week"  
 OneDay -> "24h"
```

The nice thing here is if I add an alternative to the TimeRange definition I'll get a compile error because timeRangeDisplayName is not exhaustive and I have no default case. Great! It's very verbose and duplicates names a lot and the definition of the display name is comparatively far away from the type definition but that's an ok tradeoff for being 100% sure you've covered all cases.

Now the internal id. So I have to make a function like above again. That's right, I can't even just get numbers for the different options. I can't loop through them at compile or runtime, no inspection, nada. Ok I think, that sucks but I'll just use the same user facing string, it's fine.

Now I have to create the DOM from this. Again: no way to enumerate the options at compile or runtime so copy paste it is:

```haskell
  , select [id "id_time_range", onSelect ChangeTimeRange]  
  [ option [] [text "24h"] --— or should I use timeRangeDisplayName here? It's even worse!  
  , option [] [text "1 week"]  
  , option [] [text "All time"]  
  ]
```

Ugh. Ok, whatever. It's probably fine. Then when the user changes the selection I need to update my model. After a LOT of googling I find this:

```haskell
onSelect : (String -> msg) -> Attribute msgonSelect msg =  
   on "change" (Json.map msg targetValue)
```

First of all, what is json doing here? Ok, fine. The type signature? I have no idea why it should look like that, doesn't make sense to me. Then I get a message with the target value. Ok cool, getting somewhere… now to convert back from a string to the union type.

So I declare basically the reverse function above:

```haskell
timeRangeFromString : String -> TimeRange  
timeRangeFromString s =  
  case s of  
  "All time" -> AllTime  
  "One week" -> OneWeek  
  "24h" -> OneDay
```

Obviously that's a compile error because it's not exhaustive. So I add a default that will never be used. The entire function is basically copy paste. Fine. But here's the kicker: if I add an option to TimeRange this function will just go to the default. There is no way to have a case that must produce all valid _outputs_ but there is one to check you've handled all _inputs_. So now I have brittle code in addition to a lot of copy paste.

Ok, I'll just write a test! But I can't enumerate TimeRange. :(

I asked around on Elm slack and the "solution" people have gone with seems to be to duplicate the union type in a list:

```haskell
type TimeRange = AllTime | OneWeek | OneDay
  
ranges = [AllTime, OneWeek, OneDay]
```

But I can't make sure that list is in sync, of course, because I can't enumerate TimeRange.

I google for how people are handling stuff like that and find a heated argument about introducing macros because people are writing code generators. At this point I stop and decide this language has no pragmatism.

Maybe time to look into python on the web again?

After writing the text above I came on this article: <http://reasonablypolymorphic.com/blog/elm-is-wrong>

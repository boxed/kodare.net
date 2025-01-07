---
title:	"Followup to \"My Disillusionment with Clojure and Lisps\""
date:	2016-12-21
tags: [programming, clojure]
author: Anders Hovmöller
---

 I've had long and heated discussions on reddit and some more constructive on medium after posting my last article, and I've come to mellow my stance. I've had people point out of points of pure fact I got wrong, new developments and features I didn't know about.

A lot of my critique does not apply to Common Lisp so the original article should just have been specifically about Clojure.

I also forgot to write in my last article that my information is ~1–2 years or so out of date, which is probably significant. My bad.

Here follows a point by point of my changed stances.

### Multiple forms return/insert

It's been pointed out that the use case I had is already supported in reagent by just inserting a seq. Reagent will unroll it in place just fine.

Another suggestion was to unroll it in place with splicing. This turns out to be exactly what I want. With a naming convention it should be very nice. Much nicer than the special handling of seqs in reagent I think because it's more explicit and doesn't rely on someone upstream implementing a feature so the solution is more broadly applicable. I was under the impression this feature was only available in macros, which turns out not to be the case. This is an example of how to use it:

```clojure
user=> (defn foo [] ‘(1 2 3))  
#'user/foo  
user=> (foo)  
(1 2 3)  
user=> (defn bar [] `(5 ~@(foo)))  
#'user/bar  
user=> (bar)  
(5 1 2 3)
```
### Keyword arguments

People have pointed me to [defnk](https://github.com/plumatic/plumbing#bring-on-defnk) for keyword arguments. Still has issue with dropping arguments:

```clojure
user=> (defnk simple-fnk [a b c] (+ a b c))  
#'user/simple-fnk  
user=> (simple-fnk {:a 1 :b 2 :c 3 :this-does-not-exist 4})  
6
```

so my critique still stands: positional arguments suck (especially in dynamic languages) because removing an argument in the middle of an argument list is a super brittle operation. Plus readability is bad compared to keyword arguments. No one has yet pointed me to a good keyword argument system in Clojure, and the ones people do recommend are bad because removing an argument from a function causes no crashes at call sites that still use the old removed argument.

### DSLs everywhere

[Alex Miller](https://medium.com/u/7c416bc6420a):


> The new spec library for Clojure will enable the next level of data to boost these tools further as well.I'm hopeful this solves the technical and tooling sides of the problem at least partially, maybe even fully. Significant work that I didn't know about is obviously going into fixing this deficiency and that's great!

I am going to paraphrase (heavily) here because I can't for the life of me find the exact quote (and thus who wrote it):


> ~In theory Clojure is an untoolable mess, but in practice it's pretty nice~

This is a good argument I think! Maybe `(defn foo [& args]…)` is in fact so uncommon outside the standard library that it doesn't matter much. And tooling can handle the standard lib with special rules or the upcoming clojure.spec (even if the latter requires some user input in their own code, that's probably something people will do to get the tooling to behave).

Statistics and community collective behavior matters. C++ people all learn that operator overloading is Bad, but in Python I've found it to be fine almost always. It's more about how the statistics of the usage patterns turns out in practice than the concept itself.

I still feel that the standard lib contains too many of these, effectively creating a language with a needlessly big surface area and too little visual syntax to hang all that information on. A good IDE could maybe help with this.

### Conclusion

I need to check out Cursive again, or ask colleagues that use Clojure to show it to me. I am more positive towards Clojure now than before publishing the article. I'll definitely try to reduce my exposure to reddit comments a bit :P

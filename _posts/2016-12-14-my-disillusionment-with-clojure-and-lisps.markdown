---

title:	"My disillusionment with Clojure and Lisps"
date:	2016-12-14
---

  **Update**: I've been corrected in many points related to this article.[ Read my follow up](https://medium.com/@boxed/followup-to-my-disillusionment-with-clojure-and-lisps-49d8b0ec94c1?source=linkShare-8ad86cc82e5f-1482354544).

I should start with some background: the most important thing you need to know is that I am a recovered C++ True Believer. I am also a neophile (meaning I am always drawn to the new shiny thing). So I have this strong desire for Something Better while at the same time being very weary not to get stuck in the zealots trap. I see-saw between these extremes and I am constantly monitoring myself for these tendencies.

I have not tried other Lisps than Clojure so I might be making broad conclusions about Lisps in general based on Clojure specifics. I apologize in advance and welcome corrections. UPDATE: I've since been told that at least Common Lisp has keyword arguments that are checked at compile time.

I made a fairly long dive into Clojure before I started to feel uneasy. It took me a long time to understand where this feeling came from. I've learned from my experience with C++ to spot the symptoms of disillusionment faster but the trap with Lisps is, I think, more subtle. With C++ it's the tendency to blame the user for the problems while glorifying oneself for managing to work with such an unforgiving and "clever" language. The draw of identifying oneself with being a "smart person" is strong. And working closer to the machine also sounds cool even if it's worthless in most cases.

Learning Clojure is pretty easy for a functional language, much simpler than Haskell (which I've given up on a few times) and the learning curve is pretty smooth. If you're trying to get into functional programming I highly recommend starting with Clojure. However…

I did notice some problems with the community that it shares with C++: the denial of problems and blaming the user. It's much less severe but in some areas it's near absolute. Any mention that parenthesis is a problem is the obvious one of course, but I soon hit another one: a macro can only evaluate to a single form. Suggesting this is an annoying limitation elicits many a comment of "you shouldn't ever need that" and "you're doing it wrong" without managing to show good alternatives and in many cases just outright ignoring the examples I gave. Or the worst response: "that doesn't even make sense", which is the response you get from people who are so deep into the language they can't escape the box. This is a pity and makes it impossible to introduce fixes for these problems. You can't fix a problem you can't even accept exists after all.

Another problem was the idea that all deficiencies in the language can be "fixed" with macros. It can't of course, but that's the argument. But even worse than the fact that the argument is ultimately false, is that *when it's true* it's not a strength but a weakness.

### Every function and macro is a new language

This is the fundamental problem with Lisps that ultimately made me reject at least Lisps with macros as something worth investing in (and I suspect all Lisps).

In C++ land it's well known that you must keep to a subset of the language in a code base to keep sane. It's also known that every time you increase the size of the subset you are making the situation worse even if it solves a small problem at hand.

In Lisp land on the other hand, all users can increase the size of the language themselves with macros. But it's worse! All non-trivial functions are in fact also extensions of the language. I'll explain how shortly.

### Simple made difficult

You also often hear from Lisp proponents that Lisps are great because code and data are described in the same way. The implication being that it's simpler because it's one thing to learn instead of two and that when you learn to transform data you learn to transform code, enabling powerful tooling. There are at least two problems with this thinking:

1. The simplicity argument: Different things should be different. Having fundamentally different things looking very similar is in fact a risk and a problem, not a strength. The human brain easily handles the idiosyncrasies of English, it can handle the small rule sets of sane programming languages. It has huge problems with simplicity though, as evidenced by the perpetual resistance to the theory of evolution.
2. Enabling tooling: if this hypothesis is correct, where are the tools? It should be that *everyone* could write them but somehow there is more and better tooling (like refactoring tools, IDEs) for e.g. Python, a language Lisp proponents are horrified by because of things like significant white space and syntax with lots of special rules.
The lack of tooling for Clojure, I think, largely comes from the system of defining function signatures. It has some interesting properties, the first is that there are only positional arguments. To hack around this limitation you can use various tricks like:

1. Just accepting one argument that is a dictionary/map and using map destructuring. E.g.: (foo {:params ‘(1 2), :else ‘(1, 2)})
2. Interspersing keywords ("atoms" for erlang people, basically specially typed strings) into the argument list and creating structure from that. E.g.: (foo 1 2 :else 3 4)
3. With macros: interspersing symbols into the argument list. E.g.: (foo 1 2 else 3 4)
4. Applying structure to the flat list of arguments according to some pattern. E.g.: (foo 1 2 3 4)
(Point 1 is special in that it has the nasty downside that it only grabs things from the dictionary. It doesn't validate that it's empty at the end, leading to functions that silently ignores unexpected inputs like in JavaScript.)

The common problems with all these solutions are: a) They are different. So to know which one this particular call site needs you need to know them by heart or look at the docs and b) they are all implemented *procedurally inside the body of the function/macro*. The first point is painful and annoying to deal with. The second is an absolute killer. This parsing of arguments is what makes tooling fundamentally hopeless. Turing complete definitions of function signatures that don't even output to some intermediate format that tooling can process! Of course the guys doing Clojure IDEs have a hard time. They will never be able to handle user written code or obscure libraries.

There will never be an IDE that is as good as PyCharm or IntelliJ, or even vaguely close, unless a new way of declaring functions and macros is invented, implemented, and all old code moved over to the new system. An IDE can't determine if an argument must be a keyword, a value or if it is disallowed totally (by being an uneven argument on a function that takes pairs for example). But even then, we still have the other problems:

### Language design is hard, don't let everyone do it

The features you have in your language and the features you choose *not* to have are difficult decisions that subtly and not so subtly shape the community, libraries and other code written in the language. Lisps punt on these hard questions in favor of allowing users to write their own languages on top of Lisp. This creates a Wild West where Domain Specific Languages (DSLs) abound. You will find that in Lisp land this is seen as a strength but if you ask most developers which they would prefer of: a) a project written in *one* language, or b) a project written in *fifty* languages you will be hard pressed to find anyone preferring fifty. But that is exactly what DSLs everywhere means, although I'm being kind when I say fifty instead of hundreds or thousands.

The syntax of Lisps is super simple but just because the information normally contained in the syntax has been moved somewhere else. And that somewhere else is arbitrarily complex, creating a language with boundless semantic complexity. In some ways it's not even a language like we're used to but a construction set for creating a sprawling vista of languages.

### Let him who is without sin cast the first stone

I am a part of the problem of course. I have for example written [instar](https://github.com/boxed/instar), a cool library that would be great as part of the standard library but is another annoying DSL to learn as a library. It's a local improvement that globally makes things worse.

I've even designed a fix for the lack of keyword arguments in Clojure called [defk](https://github.com/boxed/defk), which is a macro that evaluates to another macro and a function (two forms through the magic of mutability and procedural code :P).

### Conclusion

Lisps are a good playground to fairly easily implement super experimental language features, But coding in a language where all libraries contain a big bag of experimental language features is not so great.


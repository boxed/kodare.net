---
title:	"Code generation is terrible and great"
date:	2017-08-03
tags: [programming, elm]
author: Anders Hovmöller
---

  Are you generating code for the language you are writing in? Then the language you're using is terrible. By definition it's under powered because you need to write code to write code instead of just expressing what you need directly.

That said there is a place for writing custom code generators. Right now I'm [writing a code generator](https://github.com/boxed/elm-cog) for [Elm](http://elm-lang.org) based on Ned Batchelder's tool [Cog](https://nedbatchelder.com/code/cog/). The primary reason I wanted to do this is because Elm is an under powered language. Some of that is a very deliberate feature (the total lack of side effects), others are a consequence of the language being young and yet others are because the core team doesn't yet care about some problems enough to prioritize it and/or there's no known good solution.

I would have preferred Elm being more expressive, but when I started thinking about my situation I realized there are some interesting positive side effects to writing a code generator for Elm. But first things first:

### How is Elm under powered?

The basic problem is that we as users of Elm don't have access to the same information as the compiler:

* There's no way to alter the abstract syntax tree at compile time (like Lisp macros).
* There's no way to do any reflection either at compile time or runtime.
* The constructs of the language itself are very limited so can't be used to work around problems and you'll quickly hit the limits.
* The compiler itself is not built like an API (e.g. in Python the parser from source to AST and the generator from AST to bytecode are both available in the standard library).
This creates a strong incentive for code generation and there are quite a few users of Elm that admit to doing code generation when discussing on Reddit.

### Why Elm?

So you might conclude that I think Elm is not a very good language since it requires code generation and you'd be right. But I'm still arguing for Elm over ClojureScript at work partly because of the limitations of Elm. It's a much smaller language and much stricter so you can know that a lot of guarantees hold in all the Elm code. This is not the case in ClojureScript, for better and for worse. Another thing about Elm is that what it does, it does extremely well. It can do that with such a small team behind it because it is insanely focused. I want to take advantage of that.

I'm arguing that if we go with Elm we must have a good code generation system in place from day one. I'm betting on Cog for three reasons:

* It's based on Python which is our back end language where we spend most of our time. You want the generator to be easy to understand and modify.
* Cog is the only code generation tool I've seen that generates *in place*. Some might find that icky but the cool thing about it is that you can sprinkle some code generation exactly where you need it instead of creating entirely new files. It also means you don't have big chunks of code that exists twice (once in the template and once in the generated file) which should reduce the risk of editing the wrong file.
* Since our back end language and Cog are both Python, if we want to bridge our back end code with the front end code it's easy to generate pieces of Elm code and data structures directly from our existing code, making sure they're always in sync. This is a cool side effect of being forced into code generators. This might become a strength of the system as a whole even though it's a weakness of one of the parts.

### Introducing elm-cog

I want to start a discussion about code generation tooling for Elm and I'm doing it by [creating a tool and open sourcing it](https://github.com/boxed/elm-cog). I think having open source tools would help in many ways:

* Avoid duplication of effort.
* Introduce features in code generators first that can be seen as proof of concepts for Elm proper.
* Helping people write more DRY code.
* Hopefully stop people from denying that code generation in Elm is something we need, at least as a stop gap solution :P
* With elm-Cog I'm specifically helping people with Python code bases (or who can interface with Python) interop smoothly with their Elm front end, but the tool should be usable and nice to have for users of other back end languages too.

### Goals of [elm-cog](https://github.com/boxed/elm-cog)

* Output generated code that can pass through elm-format unchanged.
* Small, composable functions that can be reused to build more complex features.
* Implement the two missing features I've already found that I needed.
* An open organization: if you submit a good pull request for features or tests I'll give you commit rights straight away. This has worked fantastically for me with [instar](https://github.com/boxed/instar).

### Features so far

* Output records, lists and union types. This isn't terribly useful by itself unless your back end is Python or if you use Cog to generate Elm and another language, but it's a good foundation to build other things on.
* Enums. An enum is the trivial case of a union type (`type Foo = A | B`) with a generated accompanying list (`foo_list = [ A, B ]`).
* Enhanced enums. An enum with an extra associated record for every case. Useful to store extra data like display name, serialized name, etc.

### Example

Here's an example of a generated enum. First you write this:

```elm
--- [[[cog enum('Baz', 'D, E, F') ]]]  
--- [[[end]]]
```

Then after you've run elm-cog on your source code you'll get:

```elm
-- [[[cog enum('Baz', 'D, E, F') ]]]  
  
  
type Baz  
   = D  
   | E  
   | F  
  
  
baz_list =  
   [ D, E, F ]  
  
  
  
-- [[[end]]]
```

Never be afraid your list and your enum are out of sync again!

### Join me!

[Come to github and help](https://github.com/boxed/elm-cog)! Feature requests, bugs, pull requests, stories of pain points you've had in Elm that might be solved by elm-cog, it's all welcome!

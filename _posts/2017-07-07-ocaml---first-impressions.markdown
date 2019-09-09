---

title:	"OCaml — first impressions"
date:	2017-07-07
---

  I'm doing research to try to find my "next language" after Python. I'll publish an article on that eventually, but for now here are some of my reactions to OCaml:

* Calling their REPL "toplevel" is a bit confusing
* The REPL needs some serious work: no multiline editing, I can't move the cursor with arrow keys, no history
* The talk of "two standard libraries" (Core vs Batteries) makes me uneasy
* It seems the community hasn't settled on a standard build system
* Books and documentation gives examples of misleading code (due to inconsistent indent) because the compiler doesn't give you warnings or errors. It seems to me like an unnecessary usability flaw.
* No iPhone app. This would be nice to play around on the train to/from work. I am a big fan of Pythonista so I miss this.
* Having to run "opam init" is weird. No other package manager I know of requires something like that. It tried to ask me to update my fish config but for some reason it seemed to have answered "no" by default and continued.
* opam output while running is quite pretty
* When reading examples it looks a little bit like OCaml has significant whitespace but only in a few [very rare cases](https://ocaml.org/learn/tutorials/structure_of_ocaml_programs.html#Usingandomittingand). Reading more it looks like not. I think it would be better if the language was consistent and easy to understand. I prefer significant white space, coming from Python, but the automatic insertion of ";;" in some seemingly (to newbies) random places in the grammar looks quite icky to me. It's especially icky because it doesn't even require newlines, so "let foo = 1 let bar = 2;;" is valid even though there's no newline before the second let.
* The [manual](http://caml.inria.fr/pub/docs/manual-ocaml/language.html) is super ugly :P
* The manual has weird choices like [starting a section with the full BNF grammar](http://caml.inria.fr/pub/docs/manual-ocaml/expr.html). If the manual is for compiler writers, then it shouldn't be called "the manual"! If it's not for compiler writers, the BNF grammar should be in a reference section, not the first thing you have to scroll past.
* Feedback in the REPL needs work (notice that it says "the highlighted" but nothing is in fact highlighted):
\# let foo = (1;;Syntax error: ')' expected, the highlighted '(' might be unmatched* In general a lot of syntactical errors just ends up with the error "Syntax error" without any more information, at least in the REPL.
* Copy pasting the first example on the "[learn](https://ocaml.org/learn/)" section on the homepage to a file and running it produces the error reproduced below. The problem is that while it's formatted as one piece of code, it's actually a bunch of snippets that have to be separated by ";;", and even then it's not runnable because it requires the definition of the variable "l". Even worse, these examples are pretty terrible in trying to show the feel of a language to a beginner. Compare with the homepages of Python or Ruby.

```
➜ ~ ocaml foo.ml  
File "./foo.ml", line 3, characters 15-21:  
Error: This expression has type float -> float -> float  
 but an expression was expected of type  
 ('a ->  
 'b ->  
 'c -> 'd -> 'e -> 'f -> 'g -> 'h -> 'i -> 'j -> 'k -> 'l - > 'm) ->  
 'n ->  
 'a ->  
 'b -> 'c -> 'd -> 'e -> 'f -> 'g -> 'h -> 'i -> 'j -> 'k -> 'l -> 'm  
 Type float is not compatible with type  
 'a ->  
 'b -> 'c -> 'd -> 'e -> 'f -> 'g -> 'h -> 'i -> 'j -> 'k -> 'l -> 'm
```

* Strings are 8-bit only. No Unicode in the standard library. This is really quite unforgivable in 2017

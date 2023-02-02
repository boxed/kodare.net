---

title:	"Names are important. No, more than you think."
date:	2023-02-02
---

We programmers say names (of variables, functions, classes, etc.) are extremely important. The debate over how much code should be self-documenting is largely a debate about how good names can be. I think this all misses a bigger problem: names are for the human only. To illustrate what I mean, think of indents instead: indents for structure are much better when they are both for the computer and the human. Python, Go, and C++ all have very different approaches but fundamentally agree on this, either by using indents only as Python, auto-formatting like Go, or compiler warnings when indents+braces don't match like C++, the goal is the same: keep the human and the computer on the same page.   

What does this have to do with names? Let's look at an example:

```py
number_of_cars.append(new_car)
```

This code is obviously broken. We don't even need to know what programming language it is, or what any of the types are. A variable called `number_of_cars` should be an integer, but here it's a list of some kind. Writing a type checker that knows that variables called `number_of_*` are positive integers is trivial, yet I've never heard of anyone doing this.

Types and names are *overlapping concepts*. I've found that it's very hard to explain this to programmers. We are indoctrinated with how things are and it's hard to step outside this box to reimagine the boundary between name and type. What I'm saying is that names ARE types, at least some of the time. No I don't mean like Hungarian Notation. Not at all. I'm saying that a variable called `name` is a string. Nothing else. Never anything else. So why do I have to write the type over and over across the program? It violates DRY. It also violates the Domain Driven Design rule that business entities and variable names must always match. Writing `album: Album` in every place there's an `album` variable makes the code less readable for no gain, and it also makes it easy to *violate* this invariant by writing `album = "Thriller"` anywhere in your code base. We get the worst of both worlds: typing everywhere even when redundant, and we can still break the rules.

Names are too important to be a source of lies. If the name clearly communicates something about its type to any human reading it, the machine should be told the same information.

For experts with years of experience this isn't a big problem. We've learned this lesson and internalized it. But spend some time in a help chat for beginners and you'll see this all the time.

For beginners, mixing up singular and plural on variable names is common: `cars` when it should be `car`, or vice versa. This causes endless confusion and "solutions" like writing `car[0]` everywhere. Naming dicts is also very hard for beginners. A strong naming convention like `value_by_key` or `key_to_value` makes dicts much easier to use.

An IDE or compiler that gave a friendly and well worded warning to the user like "Incorrect name? This looks like a list, the name should probably be `cars`" could help beginners quite a lot. 

For experts a tighter integration between names and types would help too. Type inference engines could use names to infer *and enforce* types, cutting down on explicit and redundant type declarations. A well typed program with heavy use of type inference could compile faster if it could short circuit the inference by looking at the name. Error messages would be much closer to the source of the problem if the types were suitably short-circuited. In languages with currying this would be especially powerful as the type+name checker would catch accidental currying.

If you are not convinced, open up an application level code base that has explicit types and look at them. There is an enormous overlap between variable names and types. And in cases where the variable names do not map cleanly to types, making them so would often improve the code.

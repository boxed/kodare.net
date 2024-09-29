---

title:	"Why iommi is so... weird"
---

 
Something I hear a lot is that [iommi](https://docs.iommi.rocks) is weird (or ["magical and weird"](https://chaos.social/@apollo13/113209773105984233)). I would maybe use the word "different", but it's true! 

So how did we end up here? There were many small steps over a decade, each fixing a problem we had. Each step was small, necessary, and sometimes not backwards compatible. Each step felt clear and inevitable. But looking back on where we stand today it's very obvious that we ended up very far from how Python libraries are normally built.

## We had some guiding lights when starting

- [Silent failures are bad](https://docs.iommi.rocks/en/latest/philosophy.html#no-silent-mistakes). 
	- If you supply some incorrect config, the library shouldn't silently ignore it.
- "Don't send a man to do a machines job". 
	- We like libraries that take responsibility and guides users *in code* as far as possible. We dislike when known foot guns that could be prevented by code is left to documentation or help forums.
- Scale customization. 
	- We don't like libraries that do cool three line demos that does everything, but as soon as you need to customize something you need to rewrite everything yourself.
- [Escape hatches](https://docs.iommi.rocks/en/latest/philosophy.html#escape-hatches-included). 
	- Even if a library tries to have super clean configuration for everything, users *will* need to do things the authors didn't think of. You want escape hatches that can be used to get around these situations. Plan for not having all the hooks users want!
- Code should not hide the important parts in a cloud of boilerplate irrelevance. 
	- We wanted the end code to be [just the important parts](https://docs.iommi.rocks/en/latest/philosophy.html#single-point-customization-with-no-boilerplate).
- Good defaults. 
	- A single line should get you something that makes sense, that is useful, and that requires very little additional config to get what you wanted.

## Some more guiding lights made themselves known along the way

- [Everything has name](https://docs.iommi.rocks/en/latest/philosophy.html#everything-has-a-name). 
- [Values for the simple case, callables for the advanced cases](https://docs.iommi.rocks/en/latest/philosophy.html#callables-for-advanced-usage-values-for-the-simple-cases)
- [Declarative/programmatic hybrid style](https://docs.iommi.rocks/en/latest/philosophy.html#declarative-programmatic-hybrid-api)
- [Prepackaging useful features, but still allow customization](https://docs.iommi.rocks/en/latest/philosophy.html#prepackaged-commonly-used-patterns-that-can-still-be-customized)
- Ability to cleanly override the defaults of iommi globally for your specific product. This is called [Styles](https://docs.iommi.rocks/en/latest/styles.html) in iommi.


Our first library `tri.tables` was only used by the product we worked on, and in hindsight this was a blessing as it meant we could break backwards compatibility as long as we didn't break the product. We didn't have to worry about other users of the library. 

We had built up some big backwards incompatible changes we wanted to make in late 2015, which were too scary to do on the entire product at once, so we ended up forking `tri.tables` to `tri.table`. This meant we could introduce the new library one view at a time through the code base. This turned out to be a dress rehearsal for the big changes later. 

## 4 libraries

At this stage we had four libraries: `tri.table`, `tri.query`, `tri.form` and `tri.declarative` (called `tri.*` from now on).

By late 2019 we had built up a list of big problems with `tri.*`. The biggest problems were:

- Using `tri.*` was pretty nice inside the product we built it for, but quite different for other projects. This meant that docs written for `tri.*` didn't cleanly translate to our own production usage. It also meant using the libs for green field projects was hard.
- Making `tri.*` fit into an existing project with an existing design system, menu, etc. was difficult, and when you did so, the code diverged from the examples in the documentation.
- Dispatch of automatic AJAX endpoints was very cumbersome and error prone.
- Having four libraries to release and keep in sync was a huge hassle.
- Composing forms, tables, and custom templates into a bigger page was cumbersome and error prone.
- Lots of built up deprecated cruft.
- We were unhappy with many names for properties, arguments, and functions.
- It was hard to find the full conf path for the thing you wanted to change if it was deeply nested.
- `tri.*` didn't have a reasonable default style. We wanted the default to be bootstrap, and we absolutely *needed* this to be possible to change, since we were building all this for a product that uses a closed source and proprietary design system.
- There were some situations where there were name collisions with the users own code

We also had some performance problems we wanted to improve on, even if that is an ongoing battle.

## iommi is born
 
In January 2020 we decided to merge `tri.*` into a single new library, break as much backwards compatibility as possible, and solve all the fundamental design issues. From our experience with the fork of `tri.tables` to `tri.table` we knew this was a good way forward for us. 

At this point it wasn't clear the aggressive and far-reaching goals were possible, but we had an idea of where we wanted to go and a strong aesthetic sense of what a good API should be. The next 8 months until our first 1.0 release was very frantic, as we knew that this was our big chance to fix things, and that anything we didn't fix now was going to be much harder to deal with once the released library was used by someone. 

We made sweeping changes that meant we went from zero failing tests to up to a hundred failing tests, where it could take a day or two to get down to single digits again. Several times we never got to zero before finding something new to address that sent us up into double digits of failing tests again. Always keeping in mind the goal of breaking things *now* so we wouldn't deal with that baggage later. 

The discussion at the office about the name quickly decided that it should be a guitarist, as a riff off the name of Django which is named after Django Reinhardt. A few names were thrown around but I said it has to be named after Tony Iommi, as I'm a huge Black Sabbath fan. There's also a [much deeper connection between Tony and Django](https://en.wikipedia.org/wiki/Tony_Iommi#Factory_accident) that makes this name perfect. Johans requirement was that the tag line should be a pun, so we ended up with "your first pick for a Django power chord", where "power chord" is a guitar reference, but when spoken it can be heard as "power cord" which is a riff off the "batteries included" idea from Python.


## What drove the weirdness?

In hindsight, a few of the goals of iommi are responsible for making iommi so different:

- No silent failures. 
	- This meant we discarded subclassing + method override as a method for customization. This is already pretty weird!
- Zero boilerplate customization. 
	- This leads to the deep `__` separated config parameters in iommi, as you need to insert just a little bit of config deep in an object hierarchy (4 levels isn't uncommon!). In a traditional design with subclassing this would mean 3 new classes just so set a CSS class.
- Callables for advanced customization. 
	- This is necessary for zero boilerplate customization.
- Declarative/programmatic hybrid API. 
	- This is needed for our internal uses, and, in our experience, when developers get this tool they suddenly realize they've been needing this all their lives :P 	

Most of this weirdness was already in place in `tri.table` in 2018. It's just more formalized and coherent in iommi.


In the end, progress is made by deviating from the established pattern. "Doing the same thing over and over is the definition of madness" is an expression for a reason. We believe [Transparent APIs](https://kodare.net/2020/09/14/transparent_apis.html) and [Refinable Objects](https://kodare.net/2018/06/25/refinableobject-object-orientation-refined.html) is a promising way forward to be able to build higher level abstractions for GUIs, and that [iommi](https://docs.iommi.rocks) shows the way. 

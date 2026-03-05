---
title: Smoother translations in Django
date: 2026-03-05
tags: [programming, python, django, iommi, okrand]
author: Anders Hovmöller
---
I've been working for roughly 5 years now in an app that is localized to Swedish, so I have built up some opinions on how to manage translation of a Django project. Here's my list of things I do currently:

## Always use `gettext_lazy`

I've been bitten many times by accidentally using `gettext` when I should have used `gettext_lazy`, resulting in strings that were stuck in English or Swedish randomly because a user with a specific language caused that piece of code to be imported.
 
I realize that there are some performance implications here, but compared to stuff like database access this is tiny and has never shown up in profiler outputs, so I will gladly take this hit and avoid these bugs that tend to be hard to track down (if they even get reported by users at all!). 
 
A simple naive hand-rolled static analysis test that forbids usages of plain `gettext` in the code base is easy to implement and stops a whole class of bugs. 


## Django models

The Okrand setting `django_model_upgrade` which dynamically sets `verbose_name` for all fields correctly with the normal default, and on the model sets up `verbose_name` and `verbose_name_plural`. Then when you run the Okrand collect command you will get strings to translate without polluting your source with silly stuff like

```py
class Foo(Model):
    user = ForeignKey(User, verbose_name=gettext_lazy('user'))
    
    class Meta:
        verbose_name = gettext_lazy('foo')
        verbose_name_plural = gettext_lazy('foos')
```

and you can instead have models like:

```py
class Foo(Model):
    user = ForeignKey(User)
```

You can still write them out explicitly if you need them to differ from the defaults.


## Elm

There's a built-in regex pattern for ML-style languages in Okrand that makes it quite easy to collect strings from Elm code. 


## Menu translations

I use the iommi `MainMenu` system which looks something like this:

```py
menu = MainMenu(
    items=dict(
        albums=M(view=albums_view),
        artists=M(view=artists_view),
    ),
)
```

Since Okrand has a plugin system, I can build a little function that loops over this menu and collects these identifiers into translation strings. In the example above this would be "albums" and "artists". I enjoy not having to write the English base string that is 99% the exact same as the identifier (after replacing `_` with space), which keeps the business logic clean.


## Stick to lowercase as far as possible

I was frustrated by the translation files ending up with translations for "album" and "Album", "artist" and "Artist" over and over. The solution I came up with was to define two simple functions:

```py
def Trans(s):
    return capfirst(gettext_lazy(s))

def trans(s):
    return gettext_lazy(s)
```

I like the semantic weight of having `Trans("album")` mean that the word should start with uppercase in that place while `trans("album")` meaning that it should stay as lowercase. One could also add `TRANS("album")` if one wants all uppercase of a string for example. 

---

title:	"RefinableObject — Object Orientation Refined"
subtitle: OOP with deep customization but optional inheritance
date:	2018-06-25
---
 
 I think Object Oriented Programming is over used but I have to admit it is unrivaled for certain tasks, the most significant to my line of work being GUIs. But OOP as normally practiced in languages like Python, Java, and C++ have some clear drawbacks even for this use case. One problem for GUIs is that you need to create lots of classes even for trivial things: when you have an object that contains another object you must often create two new classes just to customize the nested object. Often there is also an asymmetry between customizing methods (you must subclass) and member variables (pass a value in the constructor).

We (Johan Lübcke and me) have developed a style and library to fix these issues: tri.declarative. This is the basis of our libraries tri.token, tri.form, tri.query, and tri.table.

The basic philosophy is:

1. Ability to customize methods and member variables through the constructor.
2. Pass through to nested objects with double underscore as path separator.
3. Inheritance creates defaults not hard coded values/behavior.
4. Strong defaults with gradual customization opportunities.
5. Package common or useful defaults into shortcuts.

Let's look at an example:

```python
from tri.declarative import *


class Bar(RefinableObject):
    c = Refinable()

class Foo(RefinableObject):
    a = Refinable()

    @staticmethod
    @refinable
    def b():
        return 'b'

    @dispatch(
        a=Bar,
        a__c=1,
    )
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

Foo.quux = Shortcut(call_target=Foo, a__c=7, b=lambda: 'z')


print(Foo().a.c)               # -> 1
print(Foo().b())               # -> b
print(Foo(a__c=4).a.c)         # -> 4
print(Foo(b=lambda: 'q').b())  # -> 'q'
print(Foo.quux().a.c)          # -> 7
print(Foo.quux().b())          # -> 'z'
```

This design enables tri.table to have exactly one Column class while comparable libraries like django_tables2 has 13 (with less flexibility and less built in functionality in our opinion).

Because we use this style in tri.table we are able to do things like:

```python
table = Table(
   data=User.objects.all(),
   column__username__cell__attrs__class__foo=True,
)
```
This creates a table of all users where the columns are derived automatically from the django model definition, and all the username cells have the CSS class "foo". In a traditional inheritance based system this kind of customization would have required at least two classes, maybe three and a template :P

### Downsides

The downsides to this system are

* Lack of tooling. For example: PyCharm doesn't understand and can't suggest or check a lot of this stuff.
* It's different. We think it's a good different but it takes a while to get used to.

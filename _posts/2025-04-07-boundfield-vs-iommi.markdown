---
title: BoundField vs iommi
date: 2025-02-15
tags: [programming, python, django, iommi]
author: Anders Hovmöller
---

In Django 5.2 we got a way to easier customize attributes of forms. Adam Johnson [posted an example on mastodon](https://mastodon.social/@adamchainz@fosstodon.org/114296389528826640), which I've slightly abbreviated below:

```py
class WideLabelBoundField(BoundField):
    def label_tag(self, contents=None, attrs=None, label_suffix=None):
        if attrs is None:
            attrs = {}
        attrs['class'] = 'wide'
        return super().label_tag(contents, attrs, label_suffix)


class NebulaForm(Form):
    name = CharField(
        bound_field_class=WideLabelBoundField,
    )
```

To set a single CSS class on a single label, you have to create an entire class. Let's look at the same thing in iommi: 

```py
class NebulaForm(Form):
    name = Field.text(
        label__attrs__class__wide=True,
    )
```

But, you might object, what if you need to run some code to customize it? Like if the example didn't just set `"wide"` as the value, but set it to `"wide"` only for staff? 

Not only is this also easy in iommi, I would argue it's even easier and cleaner than in the `BoundField` case above:

```py
class NebulaForm(Form):
    name = Field.text(
        label__attrs__class__wide=lambda user, **_: user.is_staff,
    )
```

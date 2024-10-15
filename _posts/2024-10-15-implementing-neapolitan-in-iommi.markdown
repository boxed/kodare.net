---
title: Implementing Neapolitan in iommi
date: 2024-10-15
tags: [programming, python, django, iommi]
---

Carlton Gibson has released a package called Neapolitan to make it easier to do CRUD stuff in your app. The short description: 

> Neapolitan's CRUDView provides the standard list, detail, create, edit, and delete views for a model, as well as the hooks you need to be able to customise any part of that.

Neapolitan's `views.py` is 513 lines, plus `template_tags/neapolitan.py` 71 lines, a management command to code gen templates 111 lines, and 24+16+13+21+40+9=123 lines of templates, for a total of 818 lines.

Here's the full implementation of that goal in [iommi](https://docs.iommi.rocks):

```py
@dispatch(
    table=EMPTY,
    create=EMPTY,
    edit=EMPTY,
    delete=EMPTY,
    detail=EMPTY,
)
def crud_views(*, model, table, create, edit, delete, detail):
    table = setdefaults_path(
        table,
        auto__model=model,
        columns__edit=Column.edit(
            after=0,
            cell__url=lambda row, **_: f'{row.pk}/edit/',
        ),
        columns__delete=Column.delete(
            cell__url=lambda row, **_: f'{row.pk}/delete/',
        ),
    )
    detail = setdefaults_path(
        detail,
        auto__model=model,
        editable=False,
        instance=lambda params, **_: model.objects.get(pk=params.pk),
        title=lambda form, **_: (form.model or form.instance)._meta.verbose_name,
    )
    create = setdefaults_path(
        create,
        auto__model=model,
    )
    edit = setdefaults_path(
        edit,
        auto__model=model,
        instance=lambda params, **_: model.objects.get(pk=params.pk),
    )
    delete = setdefaults_path(
        delete,
        auto__model=model,
        instance=lambda params, **_: model.objects.get(pk=params.pk),
    )

    return include([
        path('', Table(**table).as_view()),
        path('create/', Form.create(**create).as_view()),
        path('<pk>/', Form(**detail).as_view()),
        path('<pk>/edit/', Form.edit(**edit).as_view()),
        path('<pk>/delete/', Form.delete(**delete).as_view()),
    ])
```


## Comparing usages

Neapolitan:

```py
from neapolitan.views import CRUDView
from .models import Bookmark

class BookmarkView(CRUDView):
    model = Bookmark
    fields = ["url", "title", "note"]
    filterset_fields = [
        "favourite",
    ]

urlpatterns = [
    *BookmarkView.get_urls(),
]
```

If you need to customize anything, I believe you need to run the management command to duplicate the template files to your own project and then edit those by hand.

With iommi, using `crud_views` from above:

```py
path('', crud_views(model=Bookmark))
```

Since it's iommi, we can customize deeply with [zero boilerplate customization](https://docs.iommi.rocks/en/latest/philosophy.html#single-point-customization-with-no-boilerplate). An example is to change the `<label>` text for the `url` field on the create form:   

```py
path(
    '', 
    crud_views(
        model=Bookmark,
        create__fields__url__label__display_name='URL goes here',
    )
)
```

No template needed.

`crud_views` is now a part of iommi 7.6.0.

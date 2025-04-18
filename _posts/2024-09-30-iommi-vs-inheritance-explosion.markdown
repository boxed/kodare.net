---
title: "iommi vs inheritance explosion"
date: 2024-09-30
last_modified_at: 2024-09-30T00:00:01
tags: [programming, python, django, iommi]
author: Anders Hovmöller
---

A common pattern in OOP when you need to customize some libraries functionality is that you get an inheritance explosion. Let's look at an [example from the django-tables2 documentation](https://django-tables2.readthedocs.io/en/latest/pages/filtering.html) with a slight addition:

```py
from django_filters.views import FilterView
from django_tables2.views import SingleTableMixin
from django_filters import FilterSet, CharFilter
from django.forms import Widget
from .models import Person


class PersonTable(tables.Table):
    class Meta:
        model = Person


class PersonNumberWidget(Widget):
    def format_value(self, value):
        return f'{value[:-4]}-{value[-4:]}'


class PersonFilter(FilterSet):
    class Meta:
        model = Person
        fields = {
            "name": ["contains"], 
            "country": ["contains"],
        }
    		
    person_number = CharFilter(
        widget=PersonNumberWidget(),
    )   		

    def __init__(self, *args, **kwargs):
       super(SaleFilter, self).__init__(*args, **kwargs)
       self.filters['name'].label = "Name of the person"
        

class FilteredPersonListView(SingleTableMixin, FilterView):
    table_class = PersonTable
    model = Person
    template_name = "template.html"

    filterset_class = PersonFilter
```

(The code for `template.html` omitted for brevity.)

This code creates a table for the model `Person` and turns on filtering for the `name` and `country` fields. it also formats the person number with a dash before the last four digits as expected for Sweden. Three classes for a very simple view. 

In iommi the same functionality looks like this:

```py
class PersonTable(Table):
    class Meta:
        auto__model = Person
        columns = dict(
            name__filter__include=True,
            name__display_name='Name of the person',
            country__filter__include=True,
            person_number__cell__format=lambda value, **_: 
                f'{value[:-4]}-{value[-4:]}'
        )
```

This is accomplished via [Refinable objects](https://kodare.net/2018/06/25/refinableobject-object-orientation-refined.html), and [Transparent APIs](https://kodare.net/2020/09/14/transparent_apis.html).

---
title: How iommi avoids inheritance explosion
---

A common pattern in OOP when you need to customize some libraries functionality is that you get an inheritance explosion. Let's look at an [example from the django-tables2 documentation](https://django-tables2.readthedocs.io/en/latest/pages/filtering.html):

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

This code create a table for the model `Person` and turns on filtering for the `name` and `country` fields. it also formats the person number with a dash before the last four digits as expected for Sweden. Three classes for a very simple view. 

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

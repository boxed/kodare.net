---

title:	"iommi vs django-tables2+django-filters"
date:	2024-09-17
---

{% raw %}

Someone asked on the [Unofficial Django Discord](https://unofficial-django-discord.github.io/) about a performance problem with django-tables2 + django-filters. It's a pretty clear example of what [iommi](https://github.com/iommirocks/iommi) can give you.

### Model
```python
class Assembly(BaseModel):
    status = models.CharField(max_length=20)
    id_number = models.IntegerField(unique=True)
    location = models.ForeignKey(Location, ...)
```

### Table definition
```python
class AssemblyTable(tables.Table):
    id_number = tables.columns.LinkColumn(
        "dashboard:assembly-update", args=[A("id")])

    class Meta:
        model = Assembly
        fields = [
            "id_number",
            "status",
            "location",
        ]
```

### Filter definition
```python
class AssemblyFilter(FilterSet):
    class Meta:
        model = Assembly
        fields = {
            "id_number": ["exact"],
        }
```

### View
```python
class AssemblyListView(
        LoginRequiredMixin, 
        SingleTableMixin, 
        FilterView):
    model = Assembly
    table_class = AssemblyTable
    filter_class = AssemblyFilter
    template_name = "dashboard/assembly_list.html"
```

### Template
```django
{% block content %}
  <div class="mb-2">
    <div class="d-flex text-center"></div>
    <div class="row">
      <div class="col-lg-10 col-xs-12 p-2 pt-0">
        {% render_table table %}
      </div>
      <div class="filters col-lg-2 col-xs-12">
        <div class="card text-bg-light">
          <div class="card-body p-2">
            <form method="get">
              {{ filter.form.as_p }}
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
{% endblock %}
```


The problem was that the code has an N+1 issue, which is fixed by overriding `get_queryset` on `AssemblyListView` and doing `select_related('location')`.


### iommi version
The corresponding code in iommi looks like this:

```python
assembly_table = Table(
    auto__model=Assembly,
    auto__include=[
        "id_number",
        "status",
        "location",
    ],
    columns__id_number=dict(
         cell__url=lambda row, **_: 
            reverse('dashboard:assembly-update', row.id),
         filter__include=True,
    )
)
```

This code does not have the N+1 issue as the trivial cases where you need `select_related` or `prefetch_related` are handled automatically for you.

Maybe the biggest difference is that there no need for a template.

You might have seen such demos before, but when you've tried to use the library you have noticed that you have to rewrite everything from scratch if you want any customization, almost no matter how trivial. This is not the case for iommi. We have customization on every level, from the entire table, to the row, to the cell; and for forms, the entire form, the field, the input, the label, etc. You can customize by inserting or removing individual CSS classes, attributes, style definitions, and if that all fails you can fall back to rendering the cell/row/table/field/whatever with a custom template.

But maybe more than that: we consider it a serious bug if a customization you need to do is not easy to do. I think this attitude is what really sets us apart in the long run.

{% endraw %}

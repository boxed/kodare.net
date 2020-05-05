---

title:	"Django comefrom considered harmful"
date:	2017-05-17
---

Forms in Django have a feature which is essentially [comefrom](https://en.wikipedia.org/wiki/COMEFROM). It might not be obvious until you have gotten bitten a few times though. Let's take a very simple example:

```python
class MyForm(forms.Form):  
    foo = forms.CharField() 
    
    def clean_foo(self):  
        if self.cleaned_data['foo'] == 'bar':  
            raise forms.ValidationError('bar is an invalid value')
```

Just because the name of the method matches the pattern clean_<field_name> it gets called. There's nothing in the definition of foo to couple it to the clean method. This is error prone because if you rename the field and forget to rename the clean method, it won't be called. If only Django validated that all methods matching the pattern clean_<name>corresponded to a name of a field that actually existed, this wouldn't have been so brittle.

This was one of many reasons we ended up writing a replacement form library. Look at the same example in [tri.form](https://github.com/TriOptima/tri.form):

```python
class MyForm(Form):  
    foo = Field.text(is_valid=lambda value, **_: (value != 'bar', "bar is an invalid value"))
```

The risk of breaking things by having your stringly typed stuff not line up is gone (and we get rid of a lot of boilerplate as a bonus).

Update: the next generation of tri.form is now a part of [iommi](http://iommi.rocks). Don't use tri.form, it's end of life. iommi is where new development happens. 
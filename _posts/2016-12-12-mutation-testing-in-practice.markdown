---

title:	"Mutation testing in practice"
date:	2016-12-12
---

I've been told that the coverage numbers on your test suite don't really mean much and that the solution to this is mutation testing (maybe also property based testing). I started, as one does by definition, not understanding what it was, then I was a skeptic and after much debate I was finally converted into "ok, I need to check it out"-status. Not a believer, but I could see the point and I could see how it could find problems in theory.

In order to see how this works in practice [I ended up writing my own](https://hackernoon.com/mutmut-a-python-mutation-testing-system-9b9639356c78#.p9qtf0ruz) mutation testing library: [mutmut](https://github.com/boxed/mutmut). We tried it on some open source libraries we've developed at TriOptima that have quite good test suites with 100% coverage. I'll go through one in this article.

### Mutmut workflow

1: First run mutmut (you can ctrl+c out of it at any time if you don't want to wait for the entire run). You'll get output that looks something like this (the very verbose output format has a point that I'll explain shortly):

> mutmut lib/tri/  
--- starting mutation ---  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 0 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 3 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 7 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 11 --apply  
[... a bunch more like this...]  
170 out of 1702

Mutate the code on disk: The output of mutmut is optimized for easy application of mutations: just copy paste and run the command after "FAILURE:" and mutmut will change the file on disk. (EDIT: this next part is no longer true with the latest version of mutmut) It is best to start from the bottom because whitelisting lines or otherwise changing the code might change the indexes of everything below which would require you to rerun to get correct indexes.

3: At this stage you have a test suite that passes, but you're *not running your code *but some changed thing that is almost the code you wrote but not quite. So either fix the code or (more probably) write a test that fails.

4: Revert the mutation and make sure your tests pass.

Then start over at point 2 until there are no more surviving mutants.

### Mutating [tri.declarative](https://github.com/trioptima/tri.declarative/)

Several of our other libraries are based on this so it's very important that this lib is rock solid. It also follows that we should have found most bugs since we've used this lib extensively. So how did mutation testing do on this task? It exposed several issues with the test suite, two lines of dead/useless code (that we had coverage on! sneaky!) and a very minor bug in the plural form of an error message.

The dead/useless code was code that transformed data that was transformed in the same way later so mutating that code didn't break anything. We could just delete those two lines.

(If you want you can follow along by checking out revision 4a634cdda316e2641cff3ab0172bc5f97d2ef4bc of tri.declarative.)

Running mutmut gave us this output:

```
(venv)**➜ tri.declarative** mutmut lib/tri/  
--- starting mutation ---  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 0 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 3 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 7 --apply  
FAILED: mutmut lib/tri/declarative/__init__.py --mutation 11 --apply  
[... a bunch more like this...]  
170 out of 170
```

In total 27 mutants survived. I'm going to go through some of them from the top. So, first mutant:

```
-__version__ = '0.29.0'  
+__version__ = 'XX0.29.0XX'
```

Ok, so that's not interesting! Obviously we don't care about this string and having a test for it is useless. There are two ways to fix this:

1. mutmut treats triple-quoted strings as documentation and doesn't try to mutate them, so we could change it to that or
2. mark this line as whitelisted with a pragma. This is what we went for. It's more explicit we think. So just add `# pragma: no mutate` to the end of the line.
Next mutant:

```
 if add_init_kwargs:  
 def get_extra_args_function(self):  
- return {k: v for k, v in self.get_meta().items() if not k.startswith('_')}  
+ return {k: v for k, v in self.get_meta().items() if not k.startswith('XX_XX')}  
 add_args_to_init_call(class_to_decorate, get_extra_args_function)
```

This shows that we have no test that checks that this function skips over attributes that starts with underscore. Clearly we're lacking a test here! Turns out the very next mutant is a variant of the same pattern too, so two good tests already.

Next we have three mutants that look very much like this:

```
- raise TypeError('Too many positional argument')  
+ raise TypeError('XXToo many positional argumentXX')
```
Turns out our tests checked for these error messages not by comparing the message but by doing `x in y` so adding prefix and suffix didn't make the tests fail. Silly mistake, fixed.

The next 7 mutants show holes in our test suite. We added and expanded tests to fix these.

Now we come to an interesting type of mutant, namely performance optimizations. We have quite a few but I'll take one in particular that is interesting:

```
 for [..something..]:  
 if [..something..]:  
- break  
+ continue
```
We use `break` in `sort_after()` because when we find what we're looking for we can stop looking. Changing to `continue` will still work though, we're just going through the list a bit extra. We have three mutants like this that are performance optimizations. We mark all these with `# pragma: no mutate`.

### Conclusion

All in all: quite successful. We didn't find any real bugs but we are now much more confident in our test suite. It's quite cool to have a tool that can make sure your test suite is fairly complete.


---

title:	"A quick performance comparison of Python code formatters"
date:	2019-01-13
---

We've been talking about code formatters for Python at work since we're using Elm and we've been super happy about how code formatting works with elm-format. I tried Black a bit to see how it looks and my initial impression is that I like it (except " for quotes, what's up with that?) but it felt slow. So obviously it's benchmark time!

The three big Python code formatters seem to be yapf, autopep8 and black. From what I understand autopep8 does the least formatting, so we should take its speed with that in mind.

I benchmarked against the code base I work on professionally. It's 240k dry lines of code, i.e. not counting blank lines or lines that just contain comments.

### Results

* Black: 1.6 minutes
* autopep8: 2.2 minutes
* yapf: 9.9 minutes… or rather that's how long until it *crashed*

Score one for Black!

Both yapf and autopep8 have some annoying behaviors:

* they output to stdout by default
* they don't do recursive processing by default when you give them a folder

And the kicker is that Black has a `--fast` option that skips some internal checks that runs in 48 seconds on this test. That's pretty much check mate as far as I'm concerned.

Update: I did some digging for another article and it turns out Black cheats a bit here: it runs in parallel. If I turn that off it takes 2.8m on the same benchmark. Still ok though I think.


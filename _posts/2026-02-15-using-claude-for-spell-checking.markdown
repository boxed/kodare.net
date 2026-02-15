title: Using Claude for spellchecking and grammar
date: 2026-02-15
tags: [programming, python, django, iommi, documentation]
author: Anders Hovmöller
---

On the pytest discord channel [Sviatoslav](https://github.com/webknjaz) mentioned a pull request with a bunch of spelling and grammar fixes. We had a discussion about the morality of not disclosing that it was an AI driven pull request up front, but what was pretty clear was that the quality was surprisingly high.
 
Since I have [a project with extensive documentation](https://github.com/iommirocks/iommi) that I've spelled checked thoroughly this interested me. I write all the documentation with PyCharm which has built in spelling and grammar checks, so I was thinking it would be hard to find many errors.

I sent this prompt to Claude:

> Go through the docs directory. Strings marked with `# language: rst` will be visible as normal text in the documentation. Suggest spelling, grammar, and language clarity improvements.

Claude fires up ~8 sub agents and found a surprising amount of things. Every single change was good: https://github.com/iommirocks/iommi/commit/781c2521c101c78619a2a445939f06b54e7ed003 

A funny detail was that Claude ignored my request to only check the docs directory and found some issues in docstrings in the main source code. I can't be angry about that :P

The funniest mistake was that the docs had the word "underling" instead of "underlying" in one place ("feature set of the underling `Query` and `Form` classes"). Perfectly fine spelling *and* grammar, but Claude correctly spots that this is mistake.
 
If you have some documentation, you definitely should give this a shot.

---
title: Static data definitions
date: 
---


Defining static data structures and business rules must follow these rules, or else you're gonna get bitten later:

1. There must be one and only one place (DRY)

2. It must be a table-ish
	- define how one row looks, then define a bunch of those rows
	
3. You must be able to add "rows" without pain.
	1. If a row MUST have a value for a column, it MUST fail if you didn't supply one.
	2. If there's a reasonable default, you must be able to set that up and not have to supply the default at each row. This is just DRY for the defaults.
	3. Values must be able to be of any type.
	4. Code that must handle all rows must adapt automatically when changing the "table", or fail in some way (preferably import/compile time).
	
4. You must be able to programmatically access all the data
	- Loop through rows
	- Loop through columns
	- Access the values
	
5. If you have a library with a fixed row format you must supply a way for the user to tack on arbitrary data
	- we use a member called "extra" that is a non-checked dict

I've used the word "must" above. That sounds pretty harsh! What happens when you don't follow these rules? Let's go through the consequences of ignoring the rules:

## Violating 1. There must be one and only one place (DRY) 

DRY violations always results in code that is hard to change: making a change and then quickly getting bugs because you forgot to change all places.

## Violating 2. It must be a table-ish

If your data structures can't handle expanding what a row looks like you will quickly need extra lists/dicts/etc somewhere else to tack of this data later. This turns into the same mess you were trying to avoid in the first place. I'm looking at you enums.

## Violating 3.  You must be able to add "rows" without pain.

### Subrule a: If a row MUST have a value for a column, it MUST fail if you didn't supply one.

You shouldn't get "undefined" or "null" bombs all over your code when trying to update these definitions. Again: import/compile time is when it should fail.

### Subrule b: If there's a reasonable default, you must be able to set that up and not have to supply the default at each row. This is just DRY for the defaults.

Defaults make it easier to define some piece of data that is only valid for one special case without making the rest of the code ugly. We should show what is special, not repeating what is the same so the special stuff is hidden in the noise.

### Subrule c Values must be able to be of any type.

Limiting the properties to certain types ahead of time and not being able to change it later inevitibly makes you angry when it turns out the limit was incorrect. Murphy will guarantee it was.

### Subrule d: Code that must handle all rows must adapt automatically when changing the "table", or fail in some way (preferably import/compile time).

If you break this rule you will have runtime errors.

4. Without this you can't even write tests to make sure you've covered all cases. And you can't generate documentation based on your definitions.

5. This is the old "there must always be a way out" rule. If you break it users will be frustrated with your lib and will be forced to write ugly and hacky instead of simple code.

## Examples:

1. You define your data structure as an SQL table and then you need to define your REST API so you have another list of the same columns. Then you juggle those in code so you end up with another list. Maybe the ORM has the same list all over. 

2. You have some code where, to add a new type of thing to it, you must edit more than one place.

## Some cases where you often see violations of these rules 

- export some data into JSON, CSV, Excel, etc
- forms
- HTML tables (header and columns separate)
- SQL/noSQL table definitions
- business logic
- user facing labels


## Python 3s enums fail in some basic ways

- you can't define keyword argument constructors, creating brittle tables
- because you can't have keyword arguments you can't have a wide variety of defaults where you can specify just the one you want without specifying the others (rule #3)


## Elm union types fail pretty badly

- Can't be DRY (rule #1)
- Can't define how a row looks (rule #2)
- Can't enumerate the cases of the union (rule #4)

The other rules are violated indirectly because it fails on these points :P

## Stringly typed dicts fail

Because they're a pain to validate. Mostly because people just don't validate them. If you do you might be ok.


## What if I need to have duplicated lists?

I don't believe you do need it, but if you do, you MUST reconcile the lists.

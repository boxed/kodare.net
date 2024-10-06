---
title: So you want to load a file?
date: 2021-01-20
tags: [programming]
---

A guide for reading Excel, CSV, XML and JSON in a batch process.


## 1 - File -> dataset

The first step is to abstract away the file format. This abstract view of files is what we call a "dataset". You want a system that produces a flat structure. If you get a CSV as input this transformation is almost non-existant: you just have to abstract away the specific delimiter used, quotation marks and other details. Other file formats can be more complex, here are some examples:

- a zip file with CSVs in it produces one dataset per CSV
- an Excel file produces one dataset per sheet
- structured data like XML and JSON is flattened so that you remove all the nesting

For CSVs you have to try to figure out what the delimiter is. The C in CSV is for "comma", but that's not what customers actually have all the time. Popular alternatives include semicolon, tab, and colon. You'll get very far with just these.

The algorithm we use to find the delimiter is:

- First grab the first 60 lines and count how many of each of these delimiter characters we have on each line (we needed to go fast so we didn't bother parsing quotation correctly, it didn't matter in practice)
- Now grab the delimiter that is most stable across these rows. Zero and one doesn't count, you don't want to end up with a delimiter that means the entire file always have one column! You don't want to guess a delimiter where you end up with 12 columns on one row and 34 on another, you are aiming for one where it's always the same number of columns.

## 2 - Find header

We have a very simple heuristic for this:

- Look only at the first 80 rows.
- For each row calculate a "header-like" score:
    - Each cell that is non-empty and does not start with plus, minus or a number gives one point.
- If no row has a score above 0 then we didn't find a row.
- The header is the line with the highest score, take the first one if multiple rows have the same score.

## 3 - Normalize header

For each cell in the header, normalize it:

```python
cell = re.sub(r'[-:;/\\,. \(\)#\[\]{}\$\^\n\r\xa0*><&!"\'+=%]', '_', cell)
cell = re.sub('__+', '_', cell)
cell = cell.strip('_')
cell = cell.upper()
cell = cell or 'BLANK'
```

You might get away with being more aggressive than this, but you might also lose some important data if you're too aggressive. This code has worked for us for many years and it's been through some difficult times.

## 4 - Unique-ify headers

We have a lot of cases where we end up with multiple columns with the same name, especially "BLANK" (from the normalization step above), so we make sure we make all these unique by appending an underscore and number, so

    BLANK, BLANK, BLANK

becomes

    BLANK, BLANK_2, BLANK_3

There is an obvious limitation to this approach in that if they reorder columns with non-unique headers we can't detect that, but we've found in practice that this hasn't been a problem.

## 5 - Rule sets

From this point forward you might need one set of rules per customer, or even multiple rule sets per customer depending on how the data looks. In our product we have heavily optimized code to match the header row against requirements in the rule set to know which rule sets are applicable for a specific dataset. We don't allow more than one rule set to match at a time, but that might be different for your application.

This matching has to be very fast. The reason is that we have many active rule sets per customer and we need to give feedback quickly to our internal users regarding which rule sets will apply. We show an error if more than one matches, and a warning of no rule set matches.

## 6 - Map customer headers to your headers

You must have a canonical set of headers that are valid for your system. Step one of the mapping is to map the customers normalized headers to your internal headers.

## 7 - Map customer data

This is the messiest part. We do some smart things like autodetect date formats by looking at the data, but ultimately this step largely depends on humans looking at the data and applying simple transformation rules to get to your own internal canonical data format. Scaling this step is largely dependent on how effectively you can reuse the mapping between dataset and customer. Or in other words: if the data is similar the same mappings could work for multiple datasets, thereby reducing the amount of work required on each dataset.

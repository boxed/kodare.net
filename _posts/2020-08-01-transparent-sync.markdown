---
title: Transparent sync
date: 2020-08-01
render_with_liquid: false
---

Syncing in apps almost never work well, or to be specific: it works great until it doesn't anymore and then it's terrible. The problem is that the systems think it's their job to hide all implementation details, to make it "just work". They think you shouldn't need to worry about it as a user. But to create this illusion, the programs have to hide information. Information we users need to make informed decisions when the system doesn't work perfectly.

I think it would be better if sync was transparent:

- Show if items are only local
- Clearly mark the items that are in progress 
- Show if sync is old
- Show progress of sync (ideally with enough detail so the user can be sure that it hasn't stalled)
- Don't hide errors (and allow user to access error messages)
- Allow user to initiate sync manually
- If the app is for sharing data with others, show which other users aren't up to date

These changes would make it possible for users to switch to another system when it fails (like writing a paper note for grocery shopping when the app didn't sync), report bugs that developers could understand, let users fix some problems themselves (forcing a full sync, switch to/from wifi and trying again), and generally make users feel in control instead of feeling helpless and frustrated. 

([And please make sure the sync engine can detect when things go wrong and run a full reconciliation when it happens.](https://kodare.net/2019/10/17/when_dry_fails.html))


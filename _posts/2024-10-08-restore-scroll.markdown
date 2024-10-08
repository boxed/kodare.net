---
title: 80% of a fancy SPA in 21 lines of code
date: 2024-10-08
tags: [programming]
---

The most annoying thing with traditional server rendered HTML is that saving forms scrolls to the top. This brings the user out of flow when there are validation errors. The most common solution is to go full Single Page Application, but that loses the correct reload-for-POST behavior of the browser. There is a much easier way. 

Restore scroll position and focus (if there wasn't a redirect):

```js
document.addEventListener('readystatechange', (event) => {
    if (document.readyState === 'complete') {
        let prev_focused = sessionStorage.getItem('focused_element');
        if (prev_focused) {
            $(`#${prev_focused}`).trigger("focus");
        } else {
            $('.auto_focus').trigger("focus");
        }

        if (document.querySelector('.secondary_menu')) {
            document.querySelector('body').classList.add('has_secondary_menu');
        } else if (document.querySelector('.dryft-menu')) {
            document.querySelector('body').classList.add('has_primary_menu');
        }

        window.addEventListener("beforeunload", function (e) {
            sessionStorage.setItem('scroll_pos', window.scrollY);
            sessionStorage.setItem('scroll_url', window.location.href);
            sessionStorage.setItem('focused_element', document.activeElement.id);
        });
    }
});

document.addEventListener("DOMContentLoaded", function (event) {
    let scroll_pos = sessionStorage.getItem('scroll_pos');
    if (scroll_pos) {
        if (sessionStorage.getItem('scroll_url') === window.location.href) {
            window.scrollTo(0, scroll_pos);
        }
        sessionStorage.removeItem('scroll_pos');
    }
});
```

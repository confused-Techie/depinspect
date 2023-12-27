# DepInspect

WIP

Use `node ./bin/depinspect.js --inpsect` in a directory you'd like to scan.

As of now, it should return a list of dependency objects containing all dependencies found.

Such as a `manifest` entry containing a manifest file object, as well as several `app` entries, listed by filename containing dependencies found within the file itself. Wherever a `require` is found. Currently supports JavaScript only.

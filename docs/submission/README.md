# The document that gets handed in

Two files, the same document in two formats, generated from one source so they cannot
drift apart.

| File | What it is |
|---|---|
| `CHOWLY-submission.pdf` | Thirteen pages. Table of contents with real page numbers, page numbers in the footer, the ERD as an image. |
| `CHOWLY-submission.docx` | The same document as a Word file, with Word heading styles, a live table of contents field and a page number field in the footer. |
| `assets/erd.png` | The entity relationship diagram, rendered from the Mermaid source in the root README. Neither PDF nor Word renders Mermaid, so it is an image in both. |

It answers the assignment brief in the brief's own order: the git repository, the URL of
the deployed application, and then the document, whose four required parts are headed
"1. How it was built", "2. How AI was used", "3. The specific behaviour of the
application, from menu to payment" and "4. How to use it: a walkthrough a stranger can
follow". The five features the brief names are each covered under their own heading, and
a table at the end maps each of the eight requirements to where it is answered.

`docs/SUBMISSION.md` is the longer working document and is unchanged. This one is written
to be read cold, by someone with no other document open.

## How they are generated

Both come from one content file and two renderers, committed at `build/`, run in a
throwaway virtualenv so nothing is added to this project's dependencies. The PDF is built
with reportlab and the Word file with python-docx: real document objects with real heading
styles, not a printed web page. The ERD is rendered by Mermaid in a headless browser and
saved as a PNG. `build/README.md` has the commands.

If the document changes, both are regenerated together. Editing one of them by hand would
make the two disagree.

The diagram they carry is kept honest by a test rather than by attention:
`lib/schema-diagram.test.mts` fails if an entity, an enum value or a field introduced by
one of the fifteen deltas is missing from the Mermaid source in the root README. It exists
because the diagram had already gone three schema changes stale once.

## What was verified, and how

The PDF was rendered to images page by page and read, all thirteen pages. The Word file
was verified structurally rather than visually: its headings, tables, image, table of
contents field and footer page-number field were read back out of the file, and every
block of the source content was confirmed present. **It was not opened in Word**, because
there is no copy of Word or LibreOffice on the machine it was built on. The table of
contents is a real field, so Word fills it with page numbers when the document opens; the
section list is cached inside the field as well, so a viewer that does not recompute
fields still shows the contents rather than a blank space.

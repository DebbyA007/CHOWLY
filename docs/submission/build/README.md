# How the two documents are generated

`content.py` is the document. `make_pdf.py` and `make_docx.py` are two renderers over it,
so the PDF and the Word file cannot say different things. Editing either output by hand
would make them disagree; edit `content.py` and rebuild both.

Nothing here is a dependency of the application. It runs in a throwaway virtualenv:

```
python3 -m venv .venv
.venv/bin/pip install python-docx reportlab
.venv/bin/python content.py            # syntax check only, it defines DOC
.venv/bin/python make_pdf.py  ../CHOWLY-submission.pdf  ../assets/erd.png
.venv/bin/python make_docx.py ../CHOWLY-submission.docx ../assets/erd.png
```

`render-erd.cjs` redraws `../assets/erd.png` from the Mermaid source in the root README,
using Mermaid in a headless browser, because neither PDF nor Word renders Mermaid:

```
PWL=<path to playwright-core> PW_EXE=<path to Chromium> OUT=../assets/erd.png node render-erd.cjs
```

It reads `/tmp/erd.mmd`, so extract the ```mermaid block from `README.md` into that file
first. `lib/schema-diagram.test.mts` fails if that diagram falls behind the schema.

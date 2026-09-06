import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content as C
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Image, Table, TableStyle, PageBreak, KeepTogether)
from reportlab.platypus.tableofcontents import TableOfContents

OUT = sys.argv[1]
ERD = sys.argv[2]
INK = colors.HexColor("#1a1a1a")
MUTED = colors.HexColor("#5a5a5a")
RULE = colors.HexColor("#c8c8c8")
ACCENT = colors.HexColor("#8a6417")

ss = getSampleStyleSheet()
def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=INK, spaceAfter=7)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_BODY = st("body", alignment=TA_JUSTIFY)
S_H1 = st("h1", fontName="Helvetica-Bold", fontSize=17, leading=21, spaceBefore=20, spaceAfter=10, textColor=INK, keepWithNext=1)
S_H2 = st("h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17, spaceBefore=16, spaceAfter=7, keepWithNext=1)
S_H3 = st("h3", fontName="Helvetica-Bold", fontSize=11.5, leading=15, spaceBefore=12, spaceAfter=5, keepWithNext=1)
S_BUL = st("bul", leftIndent=13, bulletIndent=3, spaceAfter=5)
S_NUM = st("num", leftIndent=17, bulletIndent=3, spaceAfter=5)
S_CELL = st("cell", fontSize=9, leading=12.5, spaceAfter=0)
S_CELLH = st("cellh", fontName="Helvetica-Bold", fontSize=9, leading=12.5, spaceAfter=0)
S_CAP = st("cap", fontSize=8.5, leading=12, textColor=MUTED, spaceBefore=4)
S_TITLE = st("title", fontName="Helvetica-Bold", fontSize=30, leading=34, spaceAfter=6)
S_SUB = st("sub", fontSize=13, leading=18, textColor=MUTED, spaceAfter=3)

class Doc(BaseDocTemplate):
    def __init__(self, path, **kw):
        BaseDocTemplate.__init__(self, path, pagesize=A4,
                                 leftMargin=22*mm, rightMargin=22*mm,
                                 topMargin=20*mm, bottomMargin=18*mm,
                                 title="CHOWLY: submission document", author=C.AUTHOR, **kw)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="f")
        self.addPageTemplates([PageTemplate(id="plain", frames=[frame], onPage=self.decorate)])
        self.seen = set()

    def decorate(self, canvas, doc):
        canvas.saveState()
        n = canvas.getPageNumber()
        if n > 1:
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(MUTED)
            canvas.drawString(self.leftMargin, 12*mm, "CHOWLY: submission document")
            canvas.drawRightString(A4[0] - self.rightMargin, 12*mm, str(n))
            canvas.setStrokeColor(RULE)
            canvas.setLineWidth(0.4)
            canvas.line(self.leftMargin, 15*mm, A4[0] - self.rightMargin, 15*mm)
        canvas.restoreState()

    # feeds the table of contents its real page numbers
    def afterFlowable(self, flowable):
        if not hasattr(flowable, "style"):
            return
        name = flowable.style.name
        if name in ("h1", "h2", "h3"):
            level = {"h1": 0, "h2": 1, "h3": 2}[name]
            text = flowable.getPlainText()
            self.notify("TOCEntry", (level, text, self.page))

story = []
story.append(Spacer(1, 34*mm))
story.append(Paragraph(C.TITLE, S_TITLE))
story.append(Paragraph(C.SUBTITLE, S_SUB))
story.append(Spacer(1, 8*mm))
story.append(Paragraph(f"<b>{C.AUTHOR}</b>", st("a", fontSize=11, spaceAfter=3)))
story.append(Paragraph(f'Repository &nbsp;<font color="#8a6417">{C.REPO}</font>', st("b", fontSize=10, textColor=MUTED, spaceAfter=2)))
story.append(Paragraph(f'Deployed &nbsp;&nbsp;<font color="#8a6417">{C.LIVE}</font>', st("c", fontSize=10, textColor=MUTED)))
story.append(Spacer(1, 12*mm))
story.append(Paragraph("This document answers the three deliverables of the CHOWLY build assignment in the order the brief lists them. It is written to be read without any other document open.", st("lead", fontSize=10.5, leading=15.5, textColor=MUTED)))
story.append(PageBreak())

toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("t0", fontName="Helvetica-Bold", fontSize=11, leading=17, spaceBefore=8, textColor=INK),
    ParagraphStyle("t1", fontName="Helvetica", fontSize=10, leading=15, leftIndent=12, textColor=INK),
    ParagraphStyle("t2", fontName="Helvetica", fontSize=9.5, leading=14, leftIndent=26, textColor=MUTED),
]
story.append(Paragraph("Contents", st("contents_title", fontName="Helvetica-Bold", fontSize=17, leading=21, spaceAfter=10)))
story.append(toc)
story.append(PageBreak())

import re as _re

# **bold** in the content becomes bold in the document, in both renderers.
def rich(text):
    return _re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", str(text))

def cell(txt, header=False):
    return Paragraph(rich(txt), S_CELLH if header else S_CELL)

count = {"num": 0}
for kind, val in C.DOC:
    if kind == "h1":
        story.append(Paragraph(val, S_H1)); count["num"] = 0
    elif kind == "h2":
        story.append(Paragraph(val, S_H2)); count["num"] = 0
    elif kind == "h3":
        story.append(Paragraph(val, S_H3)); count["num"] = 0
    elif kind == "p":
        story.append(Paragraph(rich(val), S_BODY)); count["num"] = 0
    elif kind == "bullet":
        story.append(Paragraph(rich(val), S_BUL, bulletText="•"))
    elif kind == "num":
        count["num"] += 1
        story.append(Paragraph(rich(val), S_NUM, bulletText=f'{count["num"]}.'))
    elif kind == "image":
        from reportlab.lib.utils import ImageReader
        iw, ih = ImageReader(ERD).getSize()
        w = 166*mm
        story.append(Spacer(1, 3))
        story.append(Image(ERD, width=w, height=w*ih/iw))
        story.append(Paragraph("The data model as implemented. Every entity of the engineered model is present; the fields added or changed by the fifteen deltas are visible on Menu, MenuItem and Order.", S_CAP))
        story.append(Spacer(1, 6))
    elif kind == "table":
        head, rows = val[0], val[1]
        given = val[2] if len(val) > 2 else None
        data = [[cell(h, True) for h in head]] + [[cell(c) for c in r] for r in rows]
        widths = [166*mm * w for w in (given or ([0.20, 0.34, 0.46] if len(head) == 3 else [0.46, 0.54]))]
        t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.4, RULE),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f2f0ec")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(Spacer(1, 3)); story.append(t); story.append(Spacer(1, 9))

Doc(OUT).multiBuild(story)
print("wrote", OUT)

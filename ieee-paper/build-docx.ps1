$ErrorActionPreference = "Stop"

$outPath = "C:\Users\keert\Downloads\main_proj\main_proj\ieee-paper\SmartLayoutAI_IEEE_Paper.docx"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()
$sel = $word.Selection

# ── Page setup: IEEE conference margins ──
$doc.PageSetup.TopMargin = 54      # 0.75 in
$doc.PageSetup.BottomMargin = 72   # 1 in
$doc.PageSetup.LeftMargin = 72
$doc.PageSetup.RightMargin = 72
$doc.PageSetup.TextColumns.SetCount(1)

# ── Default font ──
$sel.Font.Name = "Times New Roman"
$sel.Font.Size = 10
$sel.Font.Bold = $false
$sel.Font.Italic = $false

# Alignment constants
$alLeft = 0; $alCenter = 1; $alRight = 2; $alJustify = 3

function PStyle($align, $size, $bold, $italic, $sb, $sa) {
    $sel.ParagraphFormat.Alignment = $align
    $sel.ParagraphFormat.SpaceBefore = $sb
    $sel.ParagraphFormat.SpaceAfter = $sa
    $sel.ParagraphFormat.LeftIndent = 0
    $sel.ParagraphFormat.RightIndent = 0
    $sel.ParagraphFormat.FirstLineIndent = 0
    $sel.Font.Size = $size
    $sel.Font.Bold = $bold
    $sel.Font.Italic = $italic
    $sel.Font.Subscript = $false
}

function Txt($s) { $sel.TypeText($s) }

# ── Title (single column, centered, 24 pt bold) ──
PStyle $alCenter 24 $true $false 0 4
Txt "SmartLayout AI: A Pre-Render Explainable AI Engine for Predicting Responsive Web Layout Failures Before They Render"
$sel.TypeParagraph()

# ── Authors ──
PStyle $alCenter 11 $false $false 10 0
Txt "First Author, Second Author"
$sel.TypeParagraph()
PStyle $alCenter 9 $false $false 0 0
Txt "Department of Computer Science and Engineering, Example University, City, Country"
$sel.TypeParagraph()
Txt "Department of Software Engineering, Example Institute, City, Country"
$sel.TypeParagraph()
Txt "Email: first.author@example.edu, second.author@example.edu"
$sel.TypeParagraph()

# ── Abstract ──
PStyle $alJustify 9 $false $false 8 6
$sel.Font.Bold = $true
Txt "Abstract—"
$sel.Font.Bold = $false
Txt "Responsive web design is the dominant paradigm for delivering interfaces across the continuous spectrum of device viewports, yet layout failures—horizontal overflow, broken flex and grid systems, image bleed, and text clipping—are typically discovered only after rendering, by human inspection or post-hoc browser tooling. This paper presents SmartLayout AI, a client-side engine that predicts responsive layout failures before rendering by statically analyzing the HTML/CSS AST, extracting a compact interpretable feature vector, and applying a hybrid rule-based and weight-activated prediction model over sixteen failure targets across six canonical viewports. The engine augments every prediction with structured explainable AI (XAI) output—confidence scores clamped through a deterministic boosting function, per-property blame analysis with quantitative contribution weights, and natural-language explanations that reproduce viewport arithmetic (e.g., a 1200 px locked element vs. a 375 px viewport, 825 px overflow). Automatic code remediation generates targeted patches that are applied with a transparent, undoable fix stack. We describe the system architecture, the feature extraction and prediction pipeline, an integrated IDE with a real-time audit loop, a differential output workspace supporting five comparison modes, and an in-browser component playground that transpiles and renders JSX inside isolated shadow-DOM frames using the Babel/standalone runtime. An evaluation over a benchmark suite of ten tagged responsive-failure test cases demonstrates that all predicted failures are detected before rendering with sub-millisecond average analysis times, and that the fix pipeline resolves 100% of benchmark cases without introducing regressions."
$sel.TypeParagraph()

# ── Index Terms ──
PStyle $alJustify 9 $false $false 0 8
$sel.Font.Bold = $true
Txt "Index Terms—"
$sel.Font.Bold = $false
Txt "Responsive web design, explainable AI (XAI), static layout analysis, pre-render prediction, automated code repair, feature engineering."
$sel.TypeParagraph()

# ── Continuous section break → two-column body ──
$sel.InsertBreak(2)
$sel.PageSetup.TextColumns.SetCount(2)

# ══════════════ I. INTRODUCTION ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "I. INTRODUCTION"
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 0 6
$sel.Font.Bold = $true
Txt "R"
$sel.Font.Bold = $false
Txt "esponsive web design [1] has become the de-facto standard for building interfaces that must adapt to viewports ranging from 320 px feature phones to 1440 px desktop panels and beyond. Despite mature engineering practices—fluid grids, flexible images, and media queries—responsive layout failures remain among the most frequently reported front-end defects [2]. Empirically these failures share a small set of mechanical root causes: fixed pixel widths that exceed narrow viewports, flex or grid containers without wrapping or fluid track functions, images without maximum-width constraints, and text forced onto a single line by white-space: nowrap."
$sel.TypeParagraph()

Txt "A fundamental limitation of current tooling is a matter of timing. Browser DevTools, visual regression suites, and runtime performance auditors such as Lighthouse [3] observe failures after paint. This delays feedback to the developer, fragments the debugging session across emulators, and forces the entire render–inspect–patch–verify cycle to be executed manually. Meanwhile, data-driven approaches that learn failure classifiers from render logs require labeled datasets that are expensive to construct and difficult to keep current with evolving layout standards."
$sel.TypeParagraph()

Txt "This paper presents SmartLayout AI, a pre-render, client-side engine that addresses these gaps with three contributions:"
$sel.TypeParagraph()

Txt "(1) A static prediction pipeline. The engine parses the HTML/CSS source into a semantic AST, computes a ten-dimensional interpretable feature vector, and predicts responsive failures across sixteen failure targets and six canonical viewports before a single pixel is rendered. A deterministic boost function calibrates prediction confidence from feature density (e.g., absence of media queries and high fixed-width ratios raise confidence)."
$sel.TypeParagraph()

Txt "(2) Structured explainable AI (XAI). Every prediction carries a confidence score, per-property blame analysis with quantified contribution weights, and a natural-language explanation that performs and states explicit viewport arithmetic. This makes predictions auditable by developers rather than black-box assertions."
$sel.TypeParagraph()

Txt "(3) Automated, undoable remediation. A recommendation engine synthesizes targeted CSS/HTML patches that are applied directly to the user's code through an undoable fix stack, closing the predict–explain–repair loop within the editor itself."
$sel.TypeParagraph()

Txt "We additionally report on three integrated developer-facing surfaces: an IDE with a real-time audit loop (Monaco-based), a differential output workspace supporting single, side-by-side, slider, fade, and split comparison modes between original and fixed layouts, and a component playground that transpiles arbitrary JSX at runtime via Babel/standalone and renders it in isolated shadow-DOM iframes across configurable breakpoints."
$sel.TypeParagraph()

Txt "The remainder of this paper is organized as follows. Section II reviews related work. Section III describes the system architecture. Section IV details the prediction methodology. Section V presents the explainability layer. Section VI describes automatic remediation and the developer tools. Section VII reports the evaluation. Section VIII concludes and discusses future work."
$sel.TypeParagraph()

# ══════════════ II. RELATED WORK ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "II. RELATED WORK"
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Runtime Auditing and Cross-Browser Testing"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Modern browsers ship comprehensive DevTools, and automated platforms such as Playwright [4] and Lighthouse [3] capture layout metrics only after rendering. Cross-browser tooling likewise executes pages first: Mesbah and Prasad formalize compatibility as a functional-consistency check between browser behavior models [5]; X-PERT localizes cross-browser issues by differencing DOM states [6]; and X-Check applies record/replay with incremental checking of DOM-mutated nodes to JavaScript applications, reaching 83% precision and 93% recall [7]. All of these share a render-then-detect paradigm: a failure is observable only once the page has executed."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "B. Static Analysis of Styles and Scripts"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Static checks of markup, such as WCAG conformance tools [8], evaluate attribute-level properties but do not reason about box geometry across viewports. Mesbah and Mirshokraie's Cilla analyzes live CSS rules to flag unused selectors, overridden properties, and undefined classes [9]; JSNose detects thirteen JavaScript code smells with a metric-based static-plus-dynamic pipeline [10]; and Saboury et al. empirically relate such smells to fault-proneness in JavaScript projects [11]. Recent work also applies machine learning to these checks, but with limitations: Di Nucci et al. find that current ML-based code smell detectors incur misleading accuracy gains over simple baselines [12], and Gupta et al. train a model to classify and optimize CSS quality [13]; neither reports confidence, blame, or explanations, and none projects geometry onto canonical viewports."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "C. Responsive Layout Failure Detection and Repair"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "As surveyed recently in IEEE Access [14], research on responsive layout failures largely assumes a rendered page. Walsh et al. detect potential layout faults introduced by edits to responsive pages [15] and later detect layout failures without an explicit oracle by checking consistency across viewport widths [16]. Althomali et al. perform automated visual verification of layout failures [17] and automated repair of responsive layouts [18]; Mahajan et al. repair mobile-friendliness problems through search-based techniques [19]. Most recently, Zerin et al. use retrieval-augmented generation to repair responsive layout failures from Stack Overflow knowledge [20], building on mining of Stack Overflow for repair templates [21]. These approaches are effective but require a browser, screenshots, execution traces, or a large language model, so a failure is established only after paint (or via an opaque model), and neither detection nor repair is accompanied by a feature-grounded explanation. SmartLayout AI differs by predicting failures before rendering from static analysis and by generating each repair from the same interpretable feature vector that explains it."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "D. Explainable AI in Software Engineering"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Explainable AI has become an established concern across software engineering tasks, as surveyed in IEEE Access [24]. Most existing practice, however, applies post-hoc frameworks such as LIME and SHAP [22], [23], which approximate black-box model behavior after training. SmartLayout AI instead designs interpretability into the model: confidence, per-property blame, and natural-language explanations are computed deterministically from the feature vector, so every number presented to the developer is exact and reproducible."
$sel.TypeParagraph()

# ══════════════ III. SYSTEM ARCHITECTURE ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "III. SYSTEM ARCHITECTURE"
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 0 6
Txt "Fig. 1 shows the layered architecture. The front end is a React 19 / TypeScript single-page application compiled with Vite [25], running entirely in the browser with no server component; all analysis, prediction, explanation, and patching happens locally."
$sel.TypeParagraph()

# Figure 1 (text pipeline diagram)
PStyle $alCenter 10 $false $false 8 0
Txt "HTML + CSS + JS  →  DOM/CSS Parser  →  Feature Extraction  →  Prediction Engine  →  XAI Layer  →  Recommendation Engine  →  Fix Stack (Undo)"
$sel.TypeParagraph()
PStyle $alCenter 9 $false $false 0 0
Txt "(real-time audit loop and shadow-DOM renderer feed back into the pipeline; patches return to the source)"
$sel.TypeParagraph()
PStyle $alCenter 9 $false $true 4 8
Txt "Fig. 1. SmartLayout AI layered architecture: static analysis, prediction, explanation, and remediation run entirely client-side."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Analysis Pipeline"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A recursive-descent HTML parser builds a semantic node tree (HTMLNode) preserving source line ranges; a CSS parser produces rule objects with selectors, declarations, and optional media query context. A box-model simulator computes, for every node at every canonical viewport (320, 375, 425, 768, 1024, 1440 px), the computed width, parent width, overflow flags, wrapping behavior, and presence of responsive constraints (fluid widths, max-width: 100%, auto-height images)."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "B. Real-Time Audit Loop"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "The IDE app runs the audit automatically on every code change after a 300 ms debounce, so the issue panel, editor diagnostics (Monaco markers), and health score stay synchronous with keystrokes. A resolved-issue set suppresses already-fixed findings until the developer edits the affected file again, preventing the detection of stale or previously repaired failures."
$sel.TypeParagraph()

# ══════════════ IV. PREDICTION METHODOLOGY ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "IV. PREDICTION METHODOLOGY"
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Feature Extraction"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Ten interpretable features (Table I) are computed from the AST in a single pass. Each feature names a known responsive anti-pattern and is directly attributable to source constructs; this design constraint is what later enables exact XAI narratives."
$sel.TypeParagraph()

# Table I: Feature vector
PStyle $alLeft 8 $true $false 6 2
Txt "TABLE I"
$sel.TypeParagraph()
PStyle $alLeft 8 $false $false 0 2
Txt "FEATURE VECTOR EXTRACTED STATICALLY FROM THE HTML/CSS AST"
$sel.TypeParagraph()

$tbl = $doc.Tables.Add($sel.Range, 11, 2)
$tbl.Range.Font.Name = "Times New Roman"
$tbl.Range.Font.Size = 8
$tbl.Range.ParagraphFormat.SpaceAfter = 2
$tbl.Range.ParagraphFormat.SpaceBefore = 2
$tbl.Cell(1,1).Range.Text = "Feature"
$tbl.Cell(1,2).Range.Text = "Meaning"
$tbl.Rows.Item(1).Range.Font.Bold = $true
$tbl.Rows.Item(1).Range.ParagraphFormat.Alignment = $alCenter
$featRows = @(
  @("fixedWidthRatio", "fraction of width declarations in px"),
  @("flexWrapMissing", "containers lacking flex-wrap"),
  @("gridTrackOverflowRatio", "fixed grid track width vs. viewport"),
  @("mediaQueryCount", "number of @media rules"),
  @("unresponsiveImageCount", "images without max-width"),
  @("absolutePositionCount", "absolutely positioned nodes"),
  @("negativeMarginCount", "nodes with negative margins"),
  @("zIndexConflictCount", "stacked nodes with competing z-index"),
  @("nowrapTextCount", "nodes with white-space: nowrap"),
  @("viewportUnitMisuseCount", "misapplied vw units")
)
for ($r = 0; $r -lt $featRows.Count; $r++) {
  $tbl.Cell($r + 2, 1).Range.Text = $featRows[$r][0]
  $tbl.Cell($r + 2, 2).Range.Text = $featRows[$r][1]
}
$tbl.Columns.Item(1).Width = 100
$tbl.Columns.Item(2).Width = 125
$tbl.Borders.Enable = $false
$tbl.Borders.OutsideLineStyle = 1
$tbl.Borders.OutsideLineWidth = 6
$tbl.Rows.Item(1).Borders.Item(-3).LineStyle = 1
$sel.SetRange($tbl.Range.End, $tbl.Range.End)
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6

# ── B. Rule-Based Prediction ──
PStyle $alLeft 10 $true $true 6 4
Txt "B. Rule-Based Prediction"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A rule engine matches structural anti-patterns against the computed boxes. Sixteen failure targets are covered (Table II); each fired rule yields an issue record with severity, affected element, offending CSS property, source line range, the set of failing viewports, and a root-cause sentence."
$sel.TypeParagraph()

# Table II: failure targets
PStyle $alLeft 8 $true $false 6 2
Txt "TABLE II"
$sel.TypeParagraph()
PStyle $alLeft 8 $false $false 0 2
Txt "THE SIXTEEN SUPPORTED RESPONSIVE FAILURE TARGETS"
$sel.TypeParagraph()
$tbl2 = $doc.Tables.Add($sel.Range, 4, 1)
$tbl2.Range.Font.Name = "Times New Roman"
$tbl2.Range.Font.Size = 8
$tbl2.Range.ParagraphFormat.SpaceAfter = 2
$tbl2.Range.ParagraphFormat.SpaceBefore = 2
$tbl2.Cell(1,1).Range.Text = "Failure targets"
$tbl2.Rows.Item(1).Range.Font.Bold = $true
$tbl2.Rows.Item(1).Range.ParagraphFormat.Alignment = $alCenter
$tbl2.Cell(2,1).Range.Text = "Horizontal Overflow; Viewport Overflow; Broken Flexbox; Broken Grid; Image Overflow; Navbar Collapse; Text Overflow; Button Overflow"
$tbl2.Cell(3,1).Range.Text = "Hidden Components; Element Collision; Layout Shift; Absolute Position Conflict; Z-index Conflict; Negative Margin Collision"
$tbl2.Cell(4,1).Range.Text = "Missing Media Queries; Accessibility Issues"
$tbl2.Columns.Item(1).Width = 225
$tbl2.Borders.Enable = $false
$tbl2.Borders.OutsideLineStyle = 1
$tbl2.Borders.OutsideLineWidth = 6
$tbl2.Rows.Item(1).Borders.Item(-3).LineStyle = 1
$sel.SetRange($tbl2.Range.End, $tbl2.Range.End)
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6

# ── C. Confidence Calibration ──
PStyle $alLeft 10 $true $true 6 4
Txt "C. Confidence Calibration"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Each rule emits a base confidence that is subsequently calibrated by a deterministic boost function (Table III). The boost encodes domain knowledge: a stylesheet without any media queries amplifies confidence in every prediction, as does a high fixed-width ratio or the presence of unresponsive images. The resulting score is clamped to [80, 99], mapping to a probability score in [0.80, 0.99]. This guarantees that displayed confidence is order-consistent with the code features while remaining conservative against overstatement."
$sel.TypeParagraph()

# Table III: confidence boosts
PStyle $alLeft 8 $true $false 6 2
Txt "TABLE III"
$sel.TypeParagraph()
PStyle $alLeft 8 $false $false 0 2
Txt "CONFIDENCE BOOST RULES APPLIED BY THE PREDICTION ENGINE"
$sel.TypeParagraph()
$tbl3 = $doc.Tables.Add($sel.Range, 5, 2)
$tbl3.Range.Font.Name = "Times New Roman"
$tbl3.Range.Font.Size = 8
$tbl3.Range.ParagraphFormat.SpaceAfter = 2
$tbl3.Range.ParagraphFormat.SpaceBefore = 2
$tbl3.Cell(1,1).Range.Text = "Feature condition"
$tbl3.Cell(1,2).Range.Text = "Boost"
$tbl3.Rows.Item(1).Range.Font.Bold = $true
$tbl3.Rows.Item(1).Range.ParagraphFormat.Alignment = $alCenter
$tbl3.Cell(2,1).Range.Text = "fixedWidthRatio > 0.3"
$tbl3.Cell(2,2).Range.Text = "+2"
$tbl3.Cell(3,1).Range.Text = "mediaQueryCount = 0"
$tbl3.Cell(3,2).Range.Text = "+3"
$tbl3.Cell(4,1).Range.Text = "unresponsiveImageCount > 0"
$tbl3.Cell(4,2).Range.Text = "+2"
$tbl3.Cell(5,1).Range.Text = "Final score"
$tbl3.Cell(5,2).Range.Text = "min(99, max(80, base + sum of boosts))"
$tbl3.Rows.Item(5).Range.Font.Bold = $true
$tbl3.Columns.Item(1).Width = 125
$tbl3.Columns.Item(2).Width = 100
$tbl3.Borders.Enable = $false
$tbl3.Borders.OutsideLineStyle = 1
$tbl3.Borders.OutsideLineWidth = 6
$tbl3.Rows.Item(1).Borders.Item(-3).LineStyle = 1
$sel.SetRange($tbl3.Range.End, $tbl3.Range.End)
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6

# ── D. Health Score ──
PStyle $alLeft 10 $true $true 6 4
Txt "D. Health Score"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A single explainable health score summarizes code quality:"
$sel.TypeParagraph()

# Equation (centered) with subscripts
PStyle $alCenter 10 $false $false 4 0
Txt "H = max(0, 100 − (25·N"
$sel.Font.Subscript = $true; Txt "High"; $sel.Font.Subscript = $false
Txt " + 12·N"
$sel.Font.Subscript = $true; Txt "Med"; $sel.Font.Subscript = $false
Txt " + 5·N"
$sel.Font.Subscript = $true; Txt "Low"; $sel.Font.Subscript = $false
Txt "))"
$sel.TypeParagraph()
PStyle $alRight 10 $false $false 0 0
Txt "(1)"
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 6 6
Txt "with severity counts taken over live (unresolved) issues. The same severity-weighted penalty is recomputed in the UI as issues are applied or manually edited, keeping the score a truthful function of current source."
$sel.TypeParagraph()

# ══════════════ V. EXPLAINABLE AI LAYER ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "V. EXPLAINABLE AI LAYER"
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 0 6
Txt "The engine commits to the principle that every number shown to the developer must be derivable from the source by hand."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Blame Analysis"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Each issue carries a structured blameAnalysis list of (property, impact) pairs with quantitative contribution weights, e.g., for horizontal overflow the offending fixed-width declaration is credited with `"+(fixedWidthRatio × 100 + 45)% fixed pixel width contribution`" and, when no media queries exist, media-query coverage contributes `"+35% missing responsive breakpoint rules`". Weights are feature-derived, not trained, so they cannot hallucinate."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "B. Natural-Language Explanation with Viewport Arithmetic"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A template-driven generator produces a paragraph for the worst failing viewport of the issue. It extracts the numeric width from the offending declaration or the original snippet and reports explicit arithmetic:"
$sel.TypeParagraph()

# Quote block
PStyle $alJustify 9 $false $true 4 6
$sel.ParagraphFormat.LeftIndent = 36
$sel.ParagraphFormat.RightIndent = 36
Txt "At 375 px the viewport is only 375 px wide, but div.hero-banner is locked to 1200 px by `"width: 1200px`", exceeding the viewport by 825 px. The underlying cause: the element uses fixed sizing that does not adapt to narrow screens. Applying the recommended fix—switching the fixed rule to a fluid value—lets the element scale with the viewport instead of overflowing."
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 0 6
Txt "Sixteen per-target templates handle overflow, flex, grid, image, text, navbar, hidden-element, collision, shift, positioning, z-index, and negative-margin scenarios, each with a fallback path when no numeric width can be located. Because the text is generated from the same feature vector and rules that produced the issue, explanation and prediction can never diverge."
$sel.TypeParagraph()

# ══════════════ VI. AUTOMATIC REMEDIATION AND DEVELOPER TOOLS ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "VI. AUTOMATIC REMEDIATION AND DEVELOPER TOOLS"
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Recommendation Engine"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Each issue's recommendedFix comprises a patch target (HTML or CSS), the original snippet, the replacement snippet, and a human-readable description. An applyAutoFix function performs line-anchored replacement of the offending declaration. Patches are pushed onto a fix stack; undoLastFix reverts the last patch and un-hides the corresponding issue in the diagnostics panel, providing a one-click rollback of any automatic repair."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "B. AI Output Workspace"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A differential workspace renders the original document (with animated AI hotspots over every predicted failure) and the fixed variant in sandboxed iframes, supporting five comparison modes: single, side-by-side, draggable slider, cross-fade, and stacked split. An explainable inspector card drills into root cause, affected rule, recommended patch, and expected improvement for the selected issue."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "C. Component Playground"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A playground validates the pipeline on reusable components. Arbitrary props and JSX/CSS are transpiled at runtime through Babel/standalone [26] and mounted inside isolated shadow-DOM frames at six canonical breakpoints with configurable custom widths, dark-mode, and right-to-left stress previews. A custom component library persists user-authored components to local storage, and a diagnostics sidebar applies the full prediction pipeline to the composed component."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "D. Accessibility Screening"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "A lightweight WCAG 2.1 screen [8] scans markup for missing image alternative text, unnamed empty buttons, and missing document language attributes, surfacing accessibility issues alongside layout predictions."
$sel.TypeParagraph()

# ══════════════ VII. EVALUATION ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "VII. EVALUATION"
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "A. Benchmark Suite"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "The evaluation uses a benchmark suite of ten tagged test cases (Table IV) spanning eight distinct failure targets, including compound cases (e.g., a fixed-width hero combined with a non-wrapping flex row). Each fixture contains deliberately buggy markup and CSS matching real-world patterns encountered in the wild."
$sel.TypeParagraph()

# Table IV: benchmark suite
PStyle $alLeft 8 $true $false 6 2
Txt "TABLE IV"
$sel.TypeParagraph()
PStyle $alLeft 8 $false $false 0 2
Txt "TEN-CASE BENCHMARK SUITE WITH EXPECTED FAILURE TARGETS"
$sel.TypeParagraph()
$tbl4 = $doc.Tables.Add($sel.Range, 11, 2)
$tbl4.Range.Font.Name = "Times New Roman"
$tbl4.Range.Font.Size = 8
$tbl4.Range.ParagraphFormat.SpaceAfter = 2
$tbl4.Range.ParagraphFormat.SpaceBefore = 2
$tbl4.Cell(1,1).Range.Text = "Test case"
$tbl4.Cell(1,2).Range.Text = "Expected target"
$tbl4.Rows.Item(1).Range.Font.Bold = $true
$tbl4.Rows.Item(1).Range.ParagraphFormat.Alignment = $alCenter
$benchRows = @(
  @("1. Fixed-width hero", "Horizontal Overflow"),
  @("2. Flex row missing wrap", "Broken Flexbox"),
  @("3. Fixed grid tracks", "Broken Grid"),
  @("4. Unresponsive image", "Image Overflow"),
  @("5. Desktop navbar links", "Navbar Collapse"),
  @("6. nowrap text block", "Text Overflow"),
  @("7. Fixed-px button", "Button Overflow"),
  @("8. Hidden mobile CTA", "Hidden Components"),
  @("9. Colliding fixed elements", "Element Collision"),
  @("10. Missing media queries", "Missing Media Queries")
)
for ($r = 0; $r -lt $benchRows.Count; $r++) {
  $tbl4.Cell($r + 2, 1).Range.Text = $benchRows[$r][0]
  $tbl4.Cell($r + 2, 2).Range.Text = $benchRows[$r][1]
}
$tbl4.Columns.Item(1).Width = 100
$tbl4.Columns.Item(2).Width = 125
$tbl4.Borders.Enable = $false
$tbl4.Borders.OutsideLineStyle = 1
$tbl4.Borders.OutsideLineWidth = 6
$tbl4.Rows.Item(1).Borders.Item(-3).LineStyle = 1
$sel.SetRange($tbl4.Range.End, $tbl4.Range.End)
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6

PStyle $alLeft 10 $true $true 6 4
Txt "B. Detection"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Across all ten fixtures the audit loop raised the expected failure target as the top-severity issue at the earliest failing viewport, i.e., precision and recall of 1.0 on the benchmark. Confidence scores fell in the calibrated band [80, 99]; fixtures combining multiple aggravating features (no media queries, fixed widths, unresponsive assets) received the highest scores (≥ 94), confirming that the boost function orders predictions consistently with feature severity."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "C. Performance"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "The full pipeline (parse + feature extraction + rule engine + XAI generation) completes in well under one millisecond on a representative fixture (sub-100-node documents), far below the 300 ms debounce budget of the real-time audit loop, and adds no perceptible latency to normal editor typing. The in-browser rendering path (Babel transpilation of component JSX into a shadow-DOM frame) takes a few milliseconds per frame and is acceptable for interactive preview, albeit at a bundle-size cost of approximately 3.3 MB with Babel/standalone included."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $true 6 4
Txt "D. Remediation"
$sel.TypeParagraph()
PStyle $alJustify 10 $false $false 0 6
Txt "Applying the auto-fix pipeline to all ten fixtures removed every predicted failure; re-running the audit reported a clean health score of 100 with no residual findings. The fix stack correctly reverted patches message-by-message, and re-introducing a fixed-width declaration after undo promptly re-flagged the issue."
$sel.TypeParagraph()

# ══════════════ VIII. CONCLUSION AND FUTURE WORK ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "VIII. CONCLUSION AND FUTURE WORK"
$sel.TypeParagraph()

PStyle $alJustify 10 $false $false 0 6
Txt "SmartLayout AI demonstrates that responsive layout failures can be predicted, explained, and repaired before rendering, entirely client-side, with deterministic explainability and sub-millisecond analysis. The combination of a compact interpretable feature vector, structurally-derived confidence, generation of exact viewport arithmetic in natural language, and an undoable patch stack forms a closed audit loop that keeps the developer in control."
$sel.TypeParagraph()

Txt "Future work includes: (i) an optional hybrid statistical layer that learns boost weights from user accept/reject telemetry while keeping explanations feature-groundable; (ii) differential-explanation UX studies comparing blame-analysis narratives against LIME/SHAP baselines; (iii) expansion of the failure-target taxonomy to container queries, scroll-driven layouts, and sub-grid; and (iv) server-side CI integration in which the same engine gates pull requests with predicted failure summaries. The architecture is deliberately model-agnostic at the confidence layer, allowing its prediction heads to be swapped without altering the XAI contract."
$sel.TypeParagraph()

# ══════════════ REFERENCES ══════════════
PStyle $alLeft 10 $true $false 10 6
Txt "REFERENCES"
$sel.TypeParagraph()

$refs = @(
  "[1] E. Marcotte, Responsive Web Design. New York, NY, USA: A Book Apart, 2011.",
  "[2] `"The Web Almanac,`" HTTP Archive, 2022. [Online]. Available: https://almanac.httparchive.org/",
  "[3] `"Lighthouse: Auditing for web performance and accessibility,`" Google, 2022. [Online]. Available: https://developer.chrome.com/docs/lighthouse/",
  "[4] Microsoft, `"Playwright: Reliable cross-browser automation,`" 2024. [Online]. Available: https://playwright.dev/",
  "[5] A. Mesbah and M. R. Prasad, `"Automated cross-browser compatibility testing of web applications,`" in Proc. 33rd Int. Conf. Software Engineering (ICSE), 2011, pp. 561–570.",
  "[6] S. R. Choudhary, M. R. Prasad, and A. Orso, `"X-PERT: Accurate identification of cross-browser issues in web applications,`" in Proc. 35th Int. Conf. Software Engineering (ICSE), 2013, pp. 702–711.",
  "[7] G. Wu, M. He, W. Chen, J. Wei, and H. Zhong, `"X-Check: Improving effectiveness and efficiency of cross-browser issues detection for JavaScript-based web applications,`" IEEE Trans. Services Computing, vol. 14, no. 4, pp. 1123–1137, 2021.",
  "[8] World Wide Web Consortium, `"Web Content Accessibility Guidelines (WCAG) 2.1,`" W3C Recommendation, Jun. 2018.",
  "[9] A. Mesbah and S. Mirshokraie, `"Automated analysis of CSS rules to support style maintenance,`" in Proc. 34th Int. Conf. Software Engineering (ICSE), 2012, pp. 408–418.",
  "[10] A. M. Fard and A. Mesbah, `"JSNose: Detecting JavaScript code smells,`" in Proc. 13th IEEE Int. Working Conf. Source Code Analysis and Manipulation (SCAM), 2013, pp. 116–125.",
  "[11] A. Saboury, P. Musavi, F. Khomh, and G. Antoniol, `"An empirical study of code smells in JavaScript projects,`" in Proc. IEEE 24th Int. Conf. Software Analysis, Evolution and Reengineering (SANER), 2017, pp. 294–305.",
  "[12] D. Di Nucci, F. Palomba, D. A. Tamburri, A. Serebrenik, and A. De Lucia, `"Detecting code smells using machine learning techniques: Are we there yet?,`" in Proc. IEEE 25th Int. Conf. Software Analysis, Evolution and Reengineering (SANER), 2018, pp. 612–621, doi: 10.1109/SANER.2018.8330266.",
  "[13] A. K. Gupta, G. G. Venkatesha, K. Singh, S. Shah, O. Goel, and S. Jain, `"Enhancing cascading style sheets efficiency and performance through AI-based code optimization,`" in Proc. 13th IEEE Int. Symp. Machine Transformation (SMART), 2024, pp. 306–311, doi: 10.1109/SMART63812.2024.10882504.",
  "[14] I. Prazina, S. Becirovic, E. Cogo, and V. Okanovic, `"Methods for automatic web page layout testing and analysis: A review,`" IEEE Access, vol. 11, pp. 13948–13964, 2023.",
  "[15] T. A. Walsh, P. McMinn, and G. M. Kapfhammer, `"Automatic detection of potential layout faults following changes to responsive web pages,`" in Proc. 30th IEEE/ACM Int. Conf. Automated Software Engineering (ASE), 2015, pp. 709–714.",
  "[16] T. A. Walsh, G. M. Kapfhammer, and P. McMinn, `"Automated layout failure detection for responsive web pages without an explicit oracle,`" in Proc. 26th ACM SIGSOFT Int. Symp. Software Testing and Analysis (ISSTA), 2017, pp. 192–202.",
  "[17] I. Althomali, G. M. Kapfhammer, and P. McMinn, `"Automatic visual verification of layout failures in responsively designed web pages,`" in Proc. 12th IEEE Conf. Software Testing, Validation and Verification (ICST), 2019, pp. 183–193.",
  "[18] I. Althomali, G. M. Kapfhammer, and P. McMinn, `"Automated repair of responsive web page layouts,`" in Proc. 15th IEEE Conf. Software Testing, Validation and Verification (ICST), 2022, pp. 140–150.",
  "[19] S. Mahajan, N. Abolhassani, P. McMinn, and W. G. J. Halfond, `"Automated repair of mobile friendly problems in web pages,`" in Proc. 40th Int. Conf. Software Engineering (ICSE), 2018, pp. 140–150.",
  "[20] T. Zerin, M. Asad, B. M. M. Hossain, and K. Sakib, `"Repairing responsive layout failures using retrieval augmented generation,`" in Proc. 41st IEEE Int. Conf. Software Maintenance and Evolution (ICSME), 2025. [Online]. Available: https://doi.org/10.1109/ICSME57585.2025.11185877",
  "[21] X. Liu and H. Zhong, `"Mining Stack Overflow for program repair,`" in Proc. IEEE 25th Int. Conf. Software Analysis, Evolution and Reengineering (SANER), 2018, pp. 118–129.",
  "[22] M. T. Ribeiro, S. Singh, and C. Guestrin, `"Why should I trust you? Explaining the predictions of any classifier,`" in Proc. 22nd ACM SIGKDD Int. Conf. Knowledge Discovery and Data Mining, 2016, pp. 1135–1144.",
  "[23] S. M. Lundberg and S.-I. Lee, `"A unified approach to interpreting model predictions,`" in Advances in Neural Information Processing Systems 30 (NeurIPS), 2017, pp. 4765–4774.",
  "[24] A. Khan, A. Ali, M. I. Mohmand, M. Zareei, and R. R. Biswal, `"Explainable artificial intelligence in software engineering: Current trends, gaps, and future directions,`" IEEE Access, vol. 14, pp. 56947–56972, 2026, doi: 10.1109/ACCESS.2026.3679576.",
  "[25] VoidZero, `"Vite: Next generation frontend tooling,`" 2024. [Online]. Available: https://vite.dev/",
  "[26] Babel Team, `"Babel: A compiler for writing next generation JavaScript,`" 2015. [Online]. Available: https://babeljs.io/",
  "[27] U. Kaushal, G. Singh, and T. Parashar, `"Responsive webpage using HTML CSS,`" in Proc. Int. Conf. Cyber Resilience (ICCR), 2022, pp. 1–4.",
  "[28] T. Le-Khanh, C. Bui-The, A. Pham-Hoang, Q. Hoang-Van, T. Cao-Thi-Minh, and P. N. Hung, `"A novel method for high-fidelity web element identification,`" in Proc. 16th Int. Conf. Knowledge and System Engineering (KSE), 2024, pp. 25–30.",
  "[29] D. Mazinanian and N. Tsantalis, `"An empirical study on the use of CSS preprocessors,`" in Proc. IEEE 23rd Int. Conf. Software Analysis, Evolution, and Reengineering (SANER), vol. 1, 2016, pp. 168–178.",
  "[30] S. Mechtaev, J. Yi, and A. Roychoudhury, `"Angelix: Scalable multiline program patch synthesis via symbolic analysis,`" in Proc. 38th Int. Conf. Software Engineering (ICSE), 2016, pp. 691–701.",
  "[31] S. Mahajan, A. Alameer, P. McMinn, and W. G. J. Halfond, `"Automated repair of layout cross browser issues using search-based techniques,`" in Proc. 26th ACM SIGSOFT Int. Symp. Software Testing and Analysis (ISSTA), 2017, pp. 249–260.",
  "[32] R. Aditya, A. J. Advaith, S. R. Rahul, and T. Anjali, `"An ensemble approach for visual testing of web applications,`" in Proc. 3rd Int. Conf. Emerging Frontiers in Electrical and Electronic Technologies (ICEFEET), 2023, pp. 1–5.",
  "[33] H. V. Nguyen, H. A. Nguyen, T. T. Nguyen, and T. N. Nguyen, `"Auto-locating and fix-propagating for HTML validation errors to PHP server-side code,`" in Proc. 26th IEEE/ACM Int. Conf. Automated Software Engineering (ASE), 2011, pp. 13–22.",
  "[34] H. Samimi, M. Schafer, S. Artzi, T. Millstein, F. Tip, and L. Hendren, `"Automated repair of HTML generation errors in PHP applications using string constraint solving,`" in Proc. 34th Int. Conf. Software Engineering (ICSE), 2012, pp. 277–287.",
  "[35] A. Sanoja and S. Gancarski, `"Block-o-matic: A web page segmentation framework,`" in Proc. Int. Conf. Multimedia Computing and Systems (ICMCS), 2014, pp. 595–600.",
  "[36] C. Zhou, Q. Zhang, B. Qian, and Y. Jiang, `"Janus: Detecting rendering bugs in web browsers via visual delta consistency,`" in Proc. 47th IEEE/ACM Int. Conf. Software Engineering (ICSE), 2025, pp. 2702–2713."
)
foreach ($r in $refs) {
  PStyle $alJustify 9 $false $false 0 2
  $sel.ParagraphFormat.LeftIndent = 24
  $sel.ParagraphFormat.FirstLineIndent = -24
  Txt $r
  $sel.TypeParagraph()
}

# ══════════════ AUTHOR BIOGRAPHIES ══════════════
PStyle $alLeft 10 $true $false 10 4
Txt "First Author"
$sel.TypeParagraph()
PStyle $alJustify 9 $false $false 0 6
Txt "received the B.Tech. degree in computer science and engineering from Example University. His research interests include web engineering, human–computer interaction, and explainable AI for developer tools."
$sel.TypeParagraph()

PStyle $alLeft 10 $true $false 10 4
Txt "Second Author"
$sel.TypeParagraph()
PStyle $alJustify 9 $false $false 0 6
Txt "received the M.S. degree in software engineering from Example Institute. His research focuses on responsive design automation and static program analysis for the web platform."
$sel.TypeParagraph()

# ── Save as .docx and close ──
$doc.SaveAs2($outPath, 16)
$doc.Close(0)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($sel) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
"DOCX saved: $outPath"
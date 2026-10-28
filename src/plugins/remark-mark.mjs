/**
 * ==text== in Markdown becomes <mark>text</mark>, which the post styles
 * draw as a highlighter stroke.
 *
 * The rule follows **bold**: the marks have to hug the text, so
 * "==a note==" is marked and "x == y" is left as written. A mark can hold
 * other inline formatting (==a **bold** word==) but can't cross into the
 * next paragraph. Code blocks, inline code and math are their own nodes by
 * the time this runs, so an "==" inside them is never touched.
 */

// One mark: "==", then text that neither starts nor ends with a space or
// "=", then "==". OBJECT stands in for any inline node between text runs.
const MARK = /==(?=[^\s=])[^]*?[^\s=]==/g;
const OBJECT = '￼';

export default function remarkMark() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!node.children || node.type === 'mark') return;
  markChildren(node);
  node.children.forEach(walk);
}

function markChildren(parent) {
  const kids = parent.children;
  if (!kids.some((k) => k.type === 'text' && k.value.includes('=='))) return;

  // The children as one string: text as itself, anything else as OBJECT.
  let flat = '';
  const starts = kids.map((k) => {
    const start = flat.length;
    flat += k.type === 'text' ? k.value : OBJECT;
    return start;
  });

  const spans = [...flat.matchAll(MARK)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  if (spans.length === 0) return;

  // Rebuild the children, cutting text nodes at each "==" and collecting
  // everything between a pair into a mark node.
  const out = [];
  let mark = null;
  const emit = (node) => (mark ? mark.children : out).push(node);

  kids.forEach((kid, i) => {
    if (kid.type !== 'text') {
      emit(kid);
      return;
    }
    const text = kid.value;
    const from = starts[i];
    const to = from + text.length;
    const cuts = [];
    for (const [open, close] of spans) {
      if (open >= from && open < to) cuts.push({ at: open - from, open: true });
      if (close - 2 >= from && close - 2 < to) {
        cuts.push({ at: close - 2 - from, open: false });
      }
    }
    cuts.sort((a, b) => a.at - b.at);

    let pos = 0;
    for (const cut of cuts) {
      if (cut.at > pos) emit({ type: 'text', value: text.slice(pos, cut.at) });
      if (cut.open) {
        mark = { type: 'mark', data: { hName: 'mark' }, children: [] };
      } else {
        out.push(mark);
        mark = null;
      }
      pos = cut.at + 2;
    }
    if (pos < text.length) emit({ type: 'text', value: text.slice(pos) });
  });

  parent.children = out;
}

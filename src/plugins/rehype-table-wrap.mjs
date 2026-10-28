/**
 * Wraps Markdown tables in <div class="table-wrap">. The table can then fill
 * the column, and the wrapper scrolls sideways when the table is wider than
 * a narrow screen. CSS on the table alone can't do both.
 */
export default function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      const isWrap =
        node.type === 'element' &&
        node.tagName === 'div' &&
        node.properties?.className?.includes?.('table-wrap');

      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table' && !isWrap) {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

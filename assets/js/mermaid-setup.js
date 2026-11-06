/* Mermaid: render without zoom or pan, always inside its box.
   - The source code block stays hidden (.unloaded) and is reused to re-render when the
     light/dark theme changes (theme.js calls renderMermaid).
   - Renders run one after another (never overlapping) and wait for the fonts.
   - No d3 zoom: wrapping the rendered SVG broke its viewBox and let the diagram be dragged
     out of the box.
   - After each render, the viewBox is recomputed from what was actually drawn: Mermaid 10
     sometimes leaves it shifted and part of the diagram falls outside the box. */
let mermaidQueue = Promise.resolve();

let fitMermaidSvgs = () => {
  const pad = 8;
  document.querySelectorAll(".mermaid > svg").forEach((svg) => {
    let bb;
    try {
      bb = svg.getBBox();
    } catch (e) {
      return; // SVG not visible (e.g. inside a closed <details>): leave it as it is
    }
    if (!bb.width || !bb.height) return;
    const w = bb.width + 2 * pad;
    svg.setAttribute("viewBox", `${bb.x - pad} ${bb.y - pad} ${w} ${bb.height + 2 * pad}`);
    svg.style.maxWidth = `min(100%, ${w}px)`;
    svg.removeAttribute("height");
  });
};

let renderMermaid = (theme) => {
  mermaidQueue = mermaidQueue.then(async () => {
    const nodes = document.querySelectorAll(".mermaid");
    if (nodes.length === 0) return;
    nodes.forEach((elem) => {
      // The Mermaid source is the hidden code block right before the diagram
      elem.removeAttribute("data-processed");
      elem.textContent = elem.previousElementSibling.textContent;
    });
    // light theme name in mermaid is 'default': https://mermaid.js.org/config/theming.html#available-themes
    mermaid.initialize({ startOnLoad: false, theme: theme == "light" ? "default" : theme });
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    try {
      await mermaid.run({ nodes: nodes });
    } catch (e) {
      // A broken diagram must not prevent fitting the others
      console.error(e);
    }
    fitMermaidSvgs();
  });
  return mermaidQueue;
};

document.addEventListener("readystatechange", () => {
  if (document.readyState !== "complete") return;

  document.querySelectorAll("pre>code.language-mermaid").forEach((elem) => {
    const backup = elem.parentElement;
    backup.classList.add("unloaded");
    let node = document.createElement("pre");
    node.classList.add("mermaid");
    backup.after(node);
  });

  renderMermaid(determineComputedTheme());
});

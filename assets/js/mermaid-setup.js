/* Mermaid: one render per page, without zoom or pan.
   - The source code block stays hidden (.unloaded) and is reused to re-render when the
     light/dark theme changes (setMermaidTheme in theme.js).
   - Rendering waits for the fonts: measuring with fallback fonts leaves the diagram
     offset and cut off inside its box.
   - No d3 zoom: wrapping the rendered SVG broke its viewBox and let the diagram be dragged
     out of the box. */
let mermaidThemeName = (theme) => (theme == "light" ? "default" : theme);

/* Mermaid 10 sometimes computes the viewBox before the nodes are in place and leaves it shifted,
   so part of the diagram falls outside the box. After each render, the viewBox is recomputed
   from what was actually drawn. */
let fitMermaidSvgs = () => {
  const pad = 8;
  document.querySelectorAll(".mermaid svg").forEach((svg) => {
    const bb = svg.getBBox();
    if (!bb.width || !bb.height) return;
    const w = bb.width + 2 * pad;
    svg.setAttribute("viewBox", `${bb.x - pad} ${bb.y - pad} ${w} ${bb.height + 2 * pad}`);
    svg.style.maxWidth = `${w}px`;
    svg.removeAttribute("height");
  });
};

document.addEventListener("readystatechange", async () => {
  if (document.readyState !== "complete") return;

  document.querySelectorAll("pre>code.language-mermaid").forEach((elem) => {
    const backup = elem.parentElement;
    backup.classList.add("unloaded");
    let node = document.createElement("pre");
    node.classList.add("mermaid");
    node.appendChild(document.createTextNode(elem.textContent));
    backup.after(node);
  });

  const nodes = document.querySelectorAll(".mermaid");
  if (nodes.length === 0) return;

  mermaid.initialize({ startOnLoad: false, theme: mermaidThemeName(determineComputedTheme()) });
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await mermaid.run({ nodes: nodes });
  fitMermaidSvgs();
});

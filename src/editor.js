import React, { useState } from "react";

function Editor() {
  const [html, setHtml] = useState("<h1>Hello World</h1>");
  const [css, setCss] = useState("h1 { color: red; }");
  const [js, setJs] = useState("console.log('Hello');");

  const output = `
    <html>
      <style>${css}</style>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
    </html>
  `;

  return (
    <div>
      <div className="editor-container">
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} />
        <textarea value={css} onChange={(e) => setCss(e.target.value)} />
        <textarea value={js} onChange={(e) => setJs(e.target.value)} />
      </div>

      <h2>Output:</h2>

      <iframe
        srcDoc={output}
        title="output"
        sandbox="allow-scripts"
        frameBorder="0"
        width="100%"
        height="250px"
      />
    </div>
  );
}

export default Editor;
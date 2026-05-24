import React, { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript as jsLang } from "@codemirror/lang-javascript";
import "./App.css";

const defaultProject = {
  projectName: "My CodeSnip Project",
  codeMap: {
    html: "<h1>Hello World</h1>\n<p>Write your code here...</p>",
    css: "body { font-family: Arial; padding: 24px; }\nh1 { color: #22c55e; }",
    js: "console.log('Hello CodeSnip');",
  },
};

function App() {
  const [projectName, setProjectName] = useState(defaultProject.projectName);
  const [codeMap, setCodeMap] = useState(defaultProject.codeMap);
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [runEnabled, setRunEnabled] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

  const [appBg, setAppBg] = useState("#020617");
  const [panelBg, setPanelBg] = useState("#0b1220");
  const [editorBg, setEditorBg] = useState("#020617");
  const [editorText, setEditorText] = useState("#e2e8f0");
  const [accent, setAccent] = useState("#38bdf8");
  const [previewBg, setPreviewBg] = useState("#ffffff");

  const flashStatus = (msg, delay = 1200) => {
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(""), delay);
  };

  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem("codesnip_projects")) || [];
      const savedTheme = JSON.parse(localStorage.getItem("codesnip_theme")) || null;
      const savedCurrent = JSON.parse(localStorage.getItem("codesnip_current")) || null;

      setProjects(Array.isArray(savedProjects) ? savedProjects : []);

      if (savedCurrent) {
        setProjectName(savedCurrent.projectName ?? defaultProject.projectName);
        setCodeMap(savedCurrent.codeMap ?? defaultProject.codeMap);
        setCurrentIndex(
          typeof savedCurrent.currentIndex === "number" ? savedCurrent.currentIndex : null
        );
      }

      if (savedTheme) {
        setAppBg(savedTheme.appBg || "#020617");
        setPanelBg(savedTheme.panelBg || "#0b1220");
        setEditorBg(savedTheme.editorBg || "#020617");
        setEditorText(savedTheme.editorText || "#e2e8f0");
        setAccent(savedTheme.accent || "#38bdf8");
        setPreviewBg(savedTheme.previewBg || "#ffffff");
      }
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("codesnip_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(
      "codesnip_current",
      JSON.stringify({
        projectName,
        codeMap,
        currentIndex,
      })
    );
  }, [projectName, codeMap, currentIndex]);

  useEffect(() => {
    localStorage.setItem(
      "codesnip_theme",
      JSON.stringify({
        appBg,
        panelBg,
        editorBg,
        editorText,
        accent,
        previewBg,
      })
    );
  }, [appBg, panelBg, editorBg, editorText, accent, previewBg]);

  const safeJs = (codeMap.js || "").replace(/<\/script>/gi, "<\\/script>");

  const previewDoc = useMemo(() => {
    const htmlCode = codeMap.html || "";
    const cssCode = codeMap.css || "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            ${cssCode}
            body {
              margin: 0;
              background: ${previewBg};
              color: #111827;
              font-family: Arial, sans-serif;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            window.onerror = function (msg) {
              document.body.insertAdjacentHTML(
                "beforeend",
                "<pre style='color:red;white-space:pre-wrap;padding:12px;background:#fee2e2;border-radius:12px;'>" +
                  msg +
                  "</pre>"
              );
            };
            try {
              ${safeJs}
            } catch (e) {
              document.body.insertAdjacentHTML(
                "beforeend",
                "<pre style='color:red;white-space:pre-wrap;padding:12px;background:#fee2e2;border-radius:12px;'>" +
                  e.message +
                  "</pre>"
              );
            }
          <\\/script>
        </body>
      </html>
    `;
  }, [codeMap.html, codeMap.css, safeJs, previewBg]);

  const newProject = () => {
    const next = {
      projectName: `Project ${projects.length + 1}`,
      codeMap: { html: "", css: "", js: "" },
    };

    const updated = [...projects, next];
    setProjects(updated);
    setCurrentIndex(updated.length - 1);
    setProjectName(next.projectName);
    setCodeMap(next.codeMap);
    setRunEnabled(true);
    setPreviewVersion((v) => v + 1);
    flashStatus("New project created");
  };

  const loadProject = (index) => {
    const p = projects[index];
    if (!p) return;

    setCurrentIndex(index);
    setProjectName(p.projectName ?? `Project ${index + 1}`);
    setCodeMap(p.codeMap ?? defaultProject.codeMap);
    setRunEnabled(true);
    setPreviewVersion((v) => v + 1);
    flashStatus(`Loaded ${p.projectName ?? `Project ${index + 1}`}`);
  };

  const saveProject = () => {
    const payload = {
      projectName,
      codeMap,
    };

    const updated = [...projects];

    if (currentIndex === null) {
      updated.push(payload);
      setCurrentIndex(updated.length - 1);
    } else {
      updated[currentIndex] = payload;
    }

    setProjects(updated);
    flashStatus("Saved");
  };

  const clearCode = () => {
    setCodeMap({ html: "", css: "", js: "" });
    setRunEnabled(true);
    setPreviewVersion((v) => v + 1);
    flashStatus("Code cleared");
  };

  const copyCode = async () => {
    try {
      const bundle = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
${codeMap.css || ""}
</style>
</head>
<body>
${codeMap.html || ""}
<script>
${safeJs}
<\/script>
</body>
</html>`;

      await navigator.clipboard.writeText(bundle);
      flashStatus("Copied", 1000);
    } catch {
      flashStatus("Copy failed");
    }
  };

  const downloadCode = () => {
    const bundle = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
${codeMap.css || ""}
</style>
</head>
<body>
${codeMap.html || ""}
<script>
${safeJs}
<\/script>
</body>
</html>`;

    const blob = new Blob([bundle], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);

    a.href = url;
    a.download = `${projectName || "project"}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    flashStatus("Downloaded", 1000);
  };

  const clearOutput = () => {
    setRunEnabled(false);
    setPreviewVersion((v) => v + 1);
    flashStatus("Preview cleared", 1000);
  };

  const handleGo = () => {
    setRunEnabled(true);
    setPreviewVersion((v) => v + 1);
    flashStatus("Preview running", 1000);
  };

  const themeVars = {
    "--app-bg": appBg,
    "--panel-bg": panelBg,
    "--editor-bg": editorBg,
    "--editor-fg": editorText,
    "--accent": accent,
  };

  const editorPaneStyle = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1f2937",
  };

  const editorBodyStyle = {
    flex: 1,
    minHeight: 0,
  };

  return (
    <div className="app" style={themeVars}>
      <aside className="sidebar">
        <div className="sidebarHead">
          <h3>Projects</h3>
          <button className="newBtn" onClick={newProject}>
            + New
          </button>
        </div>

        <div className="projectList">
          {projects.length === 0 ? (
            <div className="emptyProject">No saved projects yet</div>
          ) : (
            projects.map((p, i) => (
              <button
                key={i}
                className={`projectItem ${currentIndex === i ? "active" : ""}`}
                onClick={() => loadProject(i)}
              >
                {p.projectName || `Project ${i + 1}`}
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="brandArea">
            <div className="logo">C</div>
            <div>
              <h1>CodeSnip</h1>
              <p>Write, style, preview, and save your code in one place</p>
            </div>
          </div>

          <div className="topActions">
            <input
              className="projectNameInput"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
            />
            <button onClick={saveProject}>Save</button>
            <button onClick={copyCode}>Copy</button>
            <button onClick={downloadCode}>Download</button>
            <button onClick={clearCode}>Clear Code</button>
          </div>
        </header>

        <section className="themeBar">
          <div className="themeGroup">
            <label>
              App BG
              <input type="color" value={appBg} onChange={(e) => setAppBg(e.target.value)} />
            </label>
            <label>
              Panel BG
              <input type="color" value={panelBg} onChange={(e) => setPanelBg(e.target.value)} />
            </label>
            <label>
              Editor BG
              <input type="color" value={editorBg} onChange={(e) => setEditorBg(e.target.value)} />
            </label>
            <label>
              Text
              <input
                type="color"
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
              />
            </label>
            <label>
              Accent
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            </label>
            <label>
              Preview BG
              <input
                type="color"
                value={previewBg}
                onChange={(e) => setPreviewBg(e.target.value)}
              />
            </label>
          </div>

          <div className="statusMsg">{statusMsg || "Auto saved in browser"}</div>
        </section>

        <div className="container">
          <section className="editorPanel">
            <div className="panelHeader">
              <div>
                <span>CodeSnip Editor</span>
                <p>HTML | CSS | JS</p>
              </div>

              <div className="miniControls">
                <button onClick={handleGo} className="goBtn">
                  Go
                </button>
                <button onClick={clearOutput} className="clearBtn">
                  Clear Preview
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              <div style={editorPaneStyle}>
                <div className="suggestionBar">HTML</div>
                <div style={editorBodyStyle}>
                  <CodeMirror
                    value={codeMap.html}
                    height="100%"
                    extensions={[htmlLang()]}
                    onChange={(value) => setCodeMap((prev) => ({ ...prev, html: value }))}
                    theme="dark"
                  />
                </div>
              </div>

              <div style={editorPaneStyle}>
                <div className="suggestionBar">CSS</div>
                <div style={editorBodyStyle}>
                  <CodeMirror
                    value={codeMap.css}
                    height="100%"
                    extensions={[cssLang()]}
                    onChange={(value) => setCodeMap((prev) => ({ ...prev, css: value }))}
                    theme="dark"
                  />
                </div>
              </div>

              <div style={{ ...editorPaneStyle, borderRight: "0" }}>
                <div className="suggestionBar">JS</div>
                <div style={editorBodyStyle}>
                  <CodeMirror
                    value={codeMap.js}
                    height="100%"
                    extensions={[jsLang()]}
                    onChange={(value) => setCodeMap((prev) => ({ ...prev, js: value }))}
                    theme="dark"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="previewPanel">
            <div className="panelHeader">
              <div>
                <span>Live Preview</span>
                <p>Runs in browser</p>
              </div>
            </div>

            <div className="previewWrap" style={{ background: previewBg }}>
              {runEnabled ? (
                <iframe
                  key={`${previewVersion}-${previewBg}`}
                  srcDoc={previewDoc}
                  title="preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ background: previewBg }}
                />
              ) : (
                <div className="emptyOutput">
                  <div>
                    <h3>Preview cleared</h3>
                    <p>Go दबाकर preview wapas chalao.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
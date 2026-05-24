import React, { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript as jsLang } from "@codemirror/lang-javascript";
import { json as jsonLang } from "@codemirror/lang-json";
import { xml as xmlLang } from "@codemirror/lang-xml";
import { yaml as yamlLang } from "@codemirror/lang-yaml";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { python as pythonLang } from "@codemirror/lang-python";
import { java as javaLang } from "@codemirror/lang-java";
import { cpp as cppLang } from "@codemirror/lang-cpp";
import { go as goLang } from "@codemirror/lang-go";
import "./App.css";

const defaultProject = {
  projectName: "My CodeSnip Project",
  tab: "html",
  codeMap: {
    html: "<h1>Hello World</h1>\n<p>Write your code here...</p>",
    css: "body { font-family: Arial; padding: 24px; }\nh1 { color: #22c55e; }",
    js: "console.log('Hello CodeSnip');",
    json: '{\n  "name": "CodeSnip"\n}',
    xml: "<note>\n  <to>You</to>\n  <body>Hello</body>\n</note>",
    yaml: "name: CodeSnip\ntype: editor",
    sql: "SELECT * FROM users;",
    python: "print('Python needs backend to execute')",
    java: "class Main { public static void main(String[] args) { System.out.println(\"Java needs backend to execute\"); } }",
    c: '#include <stdio.h>\nint main(){ printf("Hello C\\n"); return 0; }',
    cpp: '#include <iostream>\nusing namespace std;\nint main(){ cout << "Hello C++" << endl; return 0; }',
    go: 'package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello Go") }',
  },
};

const languageInfo = {
  html: {
    label: "HTML",
    tip: "Use semantic tags and keep structure clean.",
    runType: "web",
  },
  css: {
    label: "CSS",
    tip: "Use flexbox/grid and keep colors readable.",
    runType: "web",
  },
  js: {
    label: "JavaScript",
    tip: "Use console.log for debugging and keep DOM selectors simple.",
    runType: "web",
  },
  json: {
    label: "JSON",
    tip: "Perfect for configs and data. Keep keys in double quotes.",
    runType: "editor",
  },
  xml: {
    label: "XML",
    tip: "Keep tags properly nested and close every element.",
    runType: "editor",
  },
  yaml: {
    label: "YAML",
    tip: "Use spaces only. Avoid tabs.",
    runType: "editor",
  },
  sql: {
    label: "SQL",
    tip: "Start with SELECT, then add WHERE and ORDER BY.",
    runType: "editor",
  },
  python: {
    label: "Python",
    tip: "Indentation matters. Backend needed for real execution.",
    runType: "editor",
  },
  java: {
    label: "Java",
    tip: "Class name and file name should match. Backend needed for execution.",
    runType: "editor",
  },
  c: {
    label: "C",
    tip: "Use stdio.h for basic input/output. Backend needed for execution.",
    runType: "editor",
  },
  cpp: {
    label: "C++",
    tip: "Use iostream and namespace std for quick programs. Backend needed for execution.",
    runType: "editor",
  },
  go: {
    label: "Go",
    tip: "Keep the main function small and clear. Backend needed for execution.",
    runType: "editor",
  },
};

function App() {
  const [tab, setTab] = useState(defaultProject.tab);
  const [projectName, setProjectName] = useState(defaultProject.projectName);
  const [codeMap, setCodeMap] = useState(defaultProject.codeMap);
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [runEnabled, setRunEnabled] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const [appBg, setAppBg] = useState("#020617");
  const [panelBg, setPanelBg] = useState("#0b1220");
  const [editorBg, setEditorBg] = useState("#020617");
  const [editorText, setEditorText] = useState("#e2e8f0");
  const [accent, setAccent] = useState("#38bdf8");

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("codesnip_projects")) || [];
    const savedTheme = JSON.parse(localStorage.getItem("codesnip_theme")) || null;

    setProjects(savedProjects);

    const savedCurrent = JSON.parse(localStorage.getItem("codesnip_current")) || null;
    if (savedCurrent) {
      setProjectName(savedCurrent.projectName ?? defaultProject.projectName);
      setTab(savedCurrent.tab ?? defaultProject.tab);
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
        tab,
        codeMap,
        currentIndex,
      })
    );
  }, [projectName, tab, codeMap, currentIndex]);

  useEffect(() => {
    localStorage.setItem(
      "codesnip_theme",
      JSON.stringify({ appBg, panelBg, editorBg, editorText, accent })
    );
  }, [appBg, panelBg, editorBg, editorText, accent]);

  const activeCode = useMemo(() => codeMap[tab] || "", [tab, codeMap]);

  const setActiveCode = (value) => {
    setCodeMap((prev) => ({
      ...prev,
      [tab]: value,
    }));
  };

  const getLang = () => {
    if (tab === "html") return htmlLang();
    if (tab === "css") return cssLang();
    if (tab === "js") return jsLang();
    if (tab === "json") return jsonLang();
    if (tab === "xml") return xmlLang();
    if (tab === "yaml") return yamlLang();
    if (tab === "sql") return sqlLang();
    if (tab === "python") return pythonLang();
    if (tab === "java") return javaLang();
    if (tab === "c" || tab === "cpp") return cppLang();
    if (tab === "go") return goLang();
    return jsLang();
  };

  const getFileExt = () => {
    return tab;
  };

  const makePreview = () => {
    if (!runEnabled) return "";

    if (!["html", "css", "js"].includes(tab)) {
      return `
        <html>
          <body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#ffffff;color:#0f172a;padding:24px;">
            <div style="max-width:860px;margin:auto;border:1px solid #cbd5e1;border-radius:18px;padding:24px;box-shadow:0 10px 30px rgba(15,23,42,.08);">
              <h2 style="margin:0 0 10px;">${languageInfo[tab].label} Editor</h2>
              <p style="line-height:1.7;margin:0 0 16px;">
                This language is shown in the editor with syntax highlighting.
                Real execution needs a backend compiler or API.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:16px;">
                <strong>Suggestion:</strong> ${languageInfo[tab].tip}
              </div>
              <pre style="margin:0;background:#0f172a;color:#e2e8f0;padding:16px;border-radius:14px;overflow:auto;white-space:pre-wrap;">${activeCode.replace(
                /</g,
                "&lt;"
              )}</pre>
            </div>
          </body>
        </html>
      `;
    }

    const htmlCode = tab === "html" ? activeCode : "<div class='box'>Write your code here</div>";
    const cssCode = tab === "css" ? activeCode : codeMap.css || "";
    const jsCode = tab === "js" ? activeCode : codeMap.js || "";

    return `
      <html>
        <head>
          <style>
            ${cssCode}
            body {
              margin: 0;
              background: #ffffff;
              color: #111827;
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .box {
              border: 2px dashed #94a3b8;
              border-radius: 16px;
              padding: 24px;
              background: #f8fafc;
            }
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
            } catch (e) {
              document.body.insertAdjacentHTML(
                "beforeend",
                "<pre style='color:red;white-space:pre-wrap;padding:12px;background:#fee2e2;border-radius:12px;'>" + e.message + "</pre>"
              );
            }
          </script>
        </body>
      </html>
    `;
  };

  const previewDoc = useMemo(
    makePreview,
    [runEnabled, tab, codeMap, activeCode]
  );

  const newProject = () => {
    const next = {
      projectName: `Project ${projects.length + 1}`,
      tab: "html",
      codeMap: { ...defaultProject.codeMap, html: "", css: "", js: "", json: "", xml: "", yaml: "", sql: "", python: "", java: "", c: "", cpp: "", go: "" },
    };

    const updated = [...projects, next];
    setProjects(updated);
    setCurrentIndex(updated.length - 1);
    setProjectName(next.projectName);
    setTab(next.tab);
    setCodeMap(next.codeMap);
    setRunEnabled(true);
    setStatusMsg("New project created");
    setTimeout(() => setStatusMsg(""), 1200);
  };

  const loadProject = (index) => {
    const p = projects[index];
    if (!p) return;

    setCurrentIndex(index);
    setProjectName(p.projectName ?? `Project ${index + 1}`);
    setTab(p.tab ?? "html");
    setCodeMap(p.codeMap ?? defaultProject.codeMap);
    setRunEnabled(true);
    setStatusMsg(`Loaded ${p.projectName ?? `Project ${index + 1}`}`);
    setTimeout(() => setStatusMsg(""), 1200);
  };

  const saveProject = () => {
    const payload = {
      projectName,
      tab,
      codeMap,
    };

    let updated = [...projects];

    if (currentIndex === null) {
      updated.push(payload);
      setCurrentIndex(updated.length - 1);
    } else {
      updated[currentIndex] = payload;
    }

    setProjects(updated);
    setStatusMsg("Saved");
    setTimeout(() => setStatusMsg(""), 1200);
  };

  const clearCode = () => {
    setCodeMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = "";
      });
      return next;
    });
    setStatusMsg("Code cleared");
    setTimeout(() => setStatusMsg(""), 1200);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setStatusMsg("Copied");
      setTimeout(() => setStatusMsg(""), 1000);
    } catch {
      setStatusMsg("Copy failed");
      setTimeout(() => setStatusMsg(""), 1200);
    }
  };

  const downloadCode = () => {
    const ext = getFileExt();
    const blob = new Blob([activeCode], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${projectName || "project"}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearOutput = () => {
    setRunEnabled(false);
    setStatusMsg("Output cleared");
    setTimeout(() => setStatusMsg(""), 1000);
  };

  const themeVars = {
    "--app-bg": appBg,
    "--panel-bg": panelBg,
    "--editor-bg": editorBg,
    "--editor-fg": editorText,
    "--accent": accent,
  };

  const tabs = ["html", "css", "js", "json", "xml", "yaml", "sql", "python", "java", "c", "cpp", "go"];

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
              <input type="color" value={editorText} onChange={(e) => setEditorText(e.target.value)} />
            </label>
            <label>
              Accent
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            </label>
          </div>

          <div className="statusMsg">{statusMsg || "Auto saved in browser"}</div>
        </section>

        <nav className="tabs">
          {tabs.map((key) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
              {key === "cpp" ? "C++" : key.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="container">
          <section className="editorPanel">
            <div className="panelHeader">
              <div>
                <span>{languageInfo[tab].label} Editor</span>
                <p>Write your code here</p>
              </div>

              <div className="miniControls">
                <button onClick={() => setRunEnabled(true)} className="goBtn">
                  Go
                </button>
                <button onClick={clearOutput} className="clearBtn">
                  Clear Output
                </button>
              </div>
            </div>

            <div className="suggestionBar">
              <strong>Suggestion:</strong> {languageInfo[tab].tip}
            </div>

            <div className="editorShell">
              <CodeMirror
                value={activeCode}
                height="100%"
                extensions={[getLang()]}
                placeholder="Write your code here..."
                onChange={(value) => setActiveCode(value)}
                theme="dark"
              />
            </div>
          </section>

          <section className="previewPanel">
            <div className="panelHeader">
              <div>
                <span>Live Preview</span>
                <p>{languageInfo[tab].runType === "web" ? "Runs in browser" : "Editor mode only"}</p>
              </div>
            </div>

            <div className="previewWrap">
              {languageInfo[tab].runType === "editor" ? (
                <div className="noticeBox">
                  <h3>{languageInfo[tab].label} editor ready</h3>
                  <p>
                    {languageInfo[tab].tip}
                  </p>
                  <pre>{activeCode}</pre>
                </div>
              ) : runEnabled ? (
                <iframe
                  key={`${tab}-${projectName}-${runEnabled}`}
                  srcDoc={previewDoc}
                  title="preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="emptyOutput">
                  <div>
                    <h3>Output cleared</h3>
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
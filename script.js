pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// DARK MODE
function toggleMode() {
  document.body.classList.toggle("dark");

  let btn = document.getElementById("modeBtn");
  btn.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Upload
async function handleUpload() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Upload PDF");

  document.getElementById("loader").classList.remove("hidden");

  const text = await extractTextFromPDF(file);
  previewPDF(file);

  setTimeout(() => {
    analyze(text.toLowerCase());
    document.getElementById("loader").classList.add("hidden");
  }, 1000);
}

// Preview
async function previewPDF(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const page = await pdf.getPage(1);

  const canvas = document.getElementById("pdfPreview");
  const ctx = canvas.getContext("2d");

  const viewport = page.getViewport({ scale: 1 });
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: ctx, viewport });
}

// Extract text
async function extractTextFromPDF(file) {
  const reader = new FileReader();

  return new Promise(resolve => {
    reader.onload = async function () {
      const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        let page = await pdf.getPage(i);
        let content = await page.getTextContent();
        text += content.items.map(i => i.str).join(" ");
      }

      resolve(text);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Analysis
function analyze(text) {
  const keywords = ["react","javascript","node","python","java","html","css"];

  let found = keywords.filter(k => text.includes(k));
  let missing = keywords.filter(k => !text.includes(k));

  let ats = Math.floor((found.length / keywords.length) * 100);

  animateScore(ats);

  document.getElementById("result").classList.remove("hidden");

  document.getElementById("matchText").innerText =
    `${found.length}/${keywords.length} keywords matched`;

  document.getElementById("skillBar").style.width =
    text.includes("skill") ? "100%" : "40%";

  document.getElementById("expBar").style.width =
    text.includes("experience") ? "100%" : "40%";

  document.getElementById("projBar").style.width =
    text.includes("project") ? "100%" : "40%";

  document.getElementById("missing").innerHTML =
    missing.map(m => `<span>${m}</span>`).join("");

  // Job Match
  let jobDesc = document.getElementById("jobDesc").value.toLowerCase();
  let words = jobDesc.split(" ").filter(w => w.length > 4);

  let match = words.filter(w => text.includes(w)).length;
  let jobScore = words.length ? Math.floor((match / words.length) * 100) : 0;

  animateJobScore(jobScore);

  let tips = [];
  if (jobScore < 50) tips.push("Low match with job description");
  if (missing.length > 0) tips.push("Add missing keywords");
  if (!text.includes("project")) tips.push("Add projects");

  document.getElementById("aiFeedback").innerHTML =
    tips.map(t => `<li>${t}</li>`).join("");
}

// Animations
function animateScore(score) {
  let i = 0;
  let interval = setInterval(() => {
    if (i >= score) clearInterval(interval);

    document.getElementById("atsText").innerText = i + "%";
    document.getElementById("atsCircle").style.background =
      `conic-gradient(#ff9800 ${i}%, #ccc ${i}%)`;

    i++;
  }, 10);
}

function animateJobScore(score) {
  let i = 0;
  let interval = setInterval(() => {
    if (i >= score) clearInterval(interval);

    document.getElementById("jobText").innerText = i + "%";
    document.getElementById("jobCircle").style.background =
      `conic-gradient(#00ffcc ${i}%, #ccc ${i}%)`;

    i++;
  }, 10);
}

// Download
function downloadReport() {
  const content = document.getElementById("result").innerText;
  const blob = new Blob([content]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.txt";
  a.click();
}
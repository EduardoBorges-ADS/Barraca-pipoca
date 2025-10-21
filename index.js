// ==== CONFIG ====
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwcmb-4ktGZK1plG8FQqbrSRTFwXCfFl-IgTCBPw4Ytds_3c5C5U4by2j21DyXcJI_kaA/exec";
const ADMIN_PIN = "pipoca2025!";

// ==== DOM ====
const form = document.getElementById("reviewForm");
const list = document.getElementById("reviewList");
const adminBtn = document.getElementById("toggleAdmin");
const banner = document.getElementById("adminBanner");

let admin = false;

// ==== UI helpers ====
function cardHTML(r) {
  const rating = Number(r.rating) || 0;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return `
    <div style="background:#fffde7;border:1px solid #ffecb3;border-radius:10px;padding:12px;margin:10px 0;display:grid;gap:6px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${r.name || "Anônimo"}</strong>
        <span style="font-size:.9rem;color:#666">${r.date || ""}</span>
      </div>
      <div><strong style="color:#ff9800">${stars}</strong></div>
      ${r.comment ? `<div>${r.comment}</div>` : ""}
      ${r.suggestion ? `<div style="font-style:italic;color:#555">💡 Sugestão: ${r.suggestion}</div>` : ""}
      ${admin ? `<button disabled style="opacity:.6;background:#d32f2f;color:#fff;border:none;border-radius:8px;padding:6px 10px;cursor:not-allowed">Excluir (somente visual)</button>` : ""}
    </div>
  `;
}

function renderList(reviews) {
  if (!reviews || reviews.length === 0) {
    list.innerHTML = "<p>Nenhuma avaliação ainda 😄</p>";
  } else {
    list.innerHTML = reviews.map(cardHTML).join("");
  }
  adminBtn.textContent = admin ? "Admin (ON)" : "Admin";
  banner.style.display = admin ? "block" : "none";
}

// ==== GET: buscar da planilha ====
async function fetchReviews() {
  try {
    const res = await fetch(SHEET_URL, { method: "GET" });
    const data = await res.json().catch(() => []);
    // mais recentes no topo (o Apps Script já pode mandar nessa ordem, mas garantimos)
    renderList((data || []).reverse());
  } catch (e) {
    console.error("Falha ao carregar avaliações", e);
    list.innerHTML = "<p style='color:#b71c1c'>Falha ao carregar avaliações. Tente novamente.</p>";
  }
}

// ==== POST: enviar para planilha ====
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rating = document.getElementById("rating").value;
  const name = (document.getElementById("name").value || "").trim() || "Anônimo";
  const comment = (document.getElementById("comment").value || "").trim();
  const suggestion = (document.getElementById("suggestion").value || "").trim();

  if (!rating) return alert("Escolha uma nota para sua avaliação!");

  const payload = {
    id: crypto.randomUUID(),
    rating: Number(rating),
    name,
    comment,
    suggestion
  };

  try {
    await fetch(SHEET_URL, { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    alert("Avaliação enviada com sucesso! 🍿");
    await fetchReviews(); // recarrega da planilha
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar. Verifique sua conexão e tente novamente.");
  }
});

// ==== Admin (apenas visual) ====
adminBtn.addEventListener("click", () => {
  if (!admin) {
    const pin = prompt("Digite o PIN de admin:");
    if (pin === ADMIN_PIN) {
      admin = true;
      alert("Modo Admin ativado!");
    } else {
      return alert("PIN incorreto.");
    }
  } else {
    admin = false;
  }
  fetchReviews();
});

// ==== Start ====
fetchReviews();

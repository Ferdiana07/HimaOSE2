const sb = window.supabase.createClient(
  "https://rfrsgveoykdmcyczbkko.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcnNndmVveWtkbWN5Y3pia2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTU1MzgsImV4cCI6MjA4OTU3MTUzOH0.4wqRmCHZjVotig4nOrLTLw0tGpDmysYmOR9H8KLEoz8"
);

// ── Guard: belum login → tendang ke halaman login ───────────────────────────
sb.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = "./index.html";
  } else {
    document.getElementById("admin-email").textContent = data.session.user.email;
  }
});

// ── Logout ───────────────────────────────────────────────────────────────────
document.getElementById("btn-logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.href = "./index.html";
});

// ── Konfigurasi tiap tabel ───────────────────────────────────────────────────
const CONFIG = {
  beasiswa: {
    table: "Beasiswa",
    bucket: "beasiswa-image",   // ← bucket khusus beasiswa
    labelKey: "nama_bsw",
    fields: [
      { key: "nama_bsw",  label: "Nama Beasiswa",   type: "text",     required: true },
      { key: "deskripsi", label: "Deskripsi",        type: "textarea", required: false },
      { key: "tgl_buka",  label: "Tanggal Buka",     type: "date",     required: true },
      { key: "tgl_tutup", label: "Tanggal Tutup",    type: "date",     required: true },
      { key: "link",      label: "Link Pendaftaran", type: "url",      required: true },
      { key: "gambar",    label: "Gambar",           type: "image",    required: false },
    ],
  },
  lomba: {
    table: "Lomba",
    bucket: "Lomba-gambar",     // ← bucket khusus lomba
    labelKey: "nama_lomba",
    fields: [
      { key: "nama_lomba",  label: "Nama Lomba",               type: "text",     required: true },
      { key: "deskripsi",   label: "Deskripsi",                type: "textarea", required: false },
      { key: "tgl_buka",    label: "Tanggal Buka",             type: "date",     required: true },
      { key: "tgl_tutup",   label: "Tanggal Tutup",            type: "date",     required: true },
      { key: "persyaratan", label: "Persyaratan (pisah koma)", type: "textarea", required: false },
      { key: "link",        label: "Link Lomba",               type: "url",      required: false },
      { key: "gambar",      label: "Gambar",                   type: "image",    required: false },
    ],
  },
  proker: {
    table: "Program Kerja",
    bucket: null,               // ← tidak ada gambar untuk proker
    labelKey: "nama_proker",
    fields: [
      { key: "nama_proker", label: "Nama Program Kerja", type: "text",     required: true },
      { key: "divisi",      label: "Divisi",             type: "text",     required: true },
      { key: "deskripsi",   label: "Deskripsi",          type: "textarea", required: false },
      { key: "link",        label: "Link Oprec",         type: "url",      required: false },
      { key: "status",      label: "Status",             type: "text",     required: false },
    ],
  },
};

let activeTab = "beasiswa";

// ── Render tabel data ────────────────────────────────────────────────────────
async function renderTab(tabKey) {
  activeTab = tabKey;
  const cfg       = CONFIG[tabKey];
  const container = document.getElementById("tab-content");

  container.innerHTML = `<div class="loading">Memuat data...</div>`;

  const { data, error } = await sb.from(cfg.table).select("*").order("id");

  if (error) {
    container.innerHTML = `<div class="error-box">❌ Gagal memuat data: ${error.message}</div>`;
    return;
  }

  // Cek apakah tabel punya field gambar
  const hasImage = cfg.fields.some(f => f.type === "image");

  container.innerHTML = `
    <div class="table-wrapper">
      <div class="table-toolbar">
        <span class="data-count">${data.length} data ditemukan</span>
        <button class="btn-add" onclick="openForm(null)">+ Tambah Data</button>
      </div>

      ${data.length === 0 ? `
        <div class="empty-state">
          <p>Belum ada data. Klik <strong>+ Tambah Data</strong> untuk memulai.</p>
        </div>
      ` : `
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th>Nama</th>
              ${tabKey === "beasiswa" ? "<th>Tgl Tutup</th>" : ""}
              ${tabKey === "proker"   ? "<th>Divisi</th>"    : ""}
              ${hasImage ? '<th style="width:80px">Gambar</th>' : ""}
              <th style="width:130px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((row, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${row[cfg.labelKey] || "-"}</td>
                ${tabKey === "beasiswa" ? `<td>${row.tgl_tutup ? formatTgl(row.tgl_tutup) : "-"}</td>` : ""}
                ${tabKey === "proker"   ? `<td>${row.divisi || "-"}</td>` : ""}
                ${hasImage ? `
                  <td>
                    ${row.gambar
                      ? `<span class="has-img">✅ Ada</span>`
                      : `<span class="no-img">–</span>`}
                  </td>` : ""}
                <td>
                  <button class="btn-edit" onclick='openForm(${JSON.stringify(row).replace(/'/g, "&#39;")})'>✏️ Edit</button>
                  <button class="btn-del"  onclick="deleteRow(${row.id})">🗑️ Hapus</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}
    </div>
  `;
}

// ── Format tanggal ───────────────────────────────────────────────────────────
function formatTgl(tgl) {
  return new Date(tgl).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

// ── Render field upload gambar ────────────────────────────────────────────────
function renderImageField(f, existingUrl) {
  return `
    <div class="form-group">
      <label>${f.label}</label>

      <!-- Zona klik upload -->
      <label class="upload-zone" id="upload-zone-${f.key}" for="file-${f.key}">
        <input type="file" id="file-${f.key}" accept="image/*"
               onchange="previewImage('${f.key}')" style="display:none" />

        <!-- Ikon dan teks (tersembunyi saat ada preview) -->
        <div class="upload-placeholder" id="upload-placeholder-${f.key}"
             style="${existingUrl ? "display:none" : ""}">
          <span class="upload-icon">🖼️</span>
          <span class="upload-text">Klik untuk pilih gambar</span>
          <span class="upload-hint">PNG, JPG, WEBP · Maks 2 MB</span>
        </div>

        <!-- Preview gambar -->
        <div class="upload-preview" id="upload-preview-${f.key}"
             style="${existingUrl ? "" : "display:none"}">
          <img id="preview-img-${f.key}" src="${existingUrl || ""}" alt="preview" />
        </div>
      </label>

      <!-- Tombol hapus gambar -->
      <button type="button" class="btn-remove-img"
              id="btn-remove-${f.key}"
              style="${existingUrl ? "" : "display:none"}"
              onclick="removeImage('${f.key}')">
        ✕ Hapus Gambar
      </button>

      <!-- Hidden field simpan URL -->
      <input type="hidden" name="${f.key}" id="val-${f.key}" value="${existingUrl || ""}" />
    </div>
  `;
}

// ── Preview setelah file dipilih ─────────────────────────────────────────────
function previewImage(key) {
  const file = document.getElementById(`file-${key}`).files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("❌ Ukuran gambar maksimal 2 MB.");
    document.getElementById(`file-${key}`).value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById(`preview-img-${key}`).src           = e.target.result;
    document.getElementById(`upload-preview-${key}`).style.display     = "";
    document.getElementById(`upload-placeholder-${key}`).style.display = "none";
    document.getElementById(`btn-remove-${key}`).style.display         = "";
  };
  reader.readAsDataURL(file);
}

// ── Hapus gambar (reset ke kosong) ───────────────────────────────────────────
function removeImage(key) {
  document.getElementById(`upload-preview-${key}`).style.display     = "none";
  document.getElementById(`upload-placeholder-${key}`).style.display = "";
  document.getElementById(`btn-remove-${key}`).style.display         = "none";
  document.getElementById(`file-${key}`).value                       = "";
  document.getElementById(`val-${key}`).value                        = "";
}

// ── Upload gambar ke Supabase Storage ────────────────────────────────────────
async function uploadImage(key) {
  const fileInput = document.getElementById(`file-${key}`);
  const file      = fileInput?.files[0];

  // Tidak ada file baru — kembalikan URL lama
  if (!file) return document.getElementById(`val-${key}`)?.value || null;

  // Ambil nama bucket dari CONFIG tabel yang aktif
  const bucket = CONFIG[activeTab].bucket;
  if (!bucket) throw new Error("Tabel ini tidak punya bucket gambar.");

  const ext      = file.name.split(".").pop().toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from(bucket).upload(filename, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error("Upload gambar gagal: " + error.message);

  const { data } = sb.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

// ── Buka modal form ───────────────────────────────────────────────────────────
function openForm(row) {
  const cfg   = CONFIG[activeTab];
  const modal = document.getElementById("modal");
  const form  = document.getElementById("admin-form");

  document.getElementById("modal-title").textContent = row ? "Edit Data" : "Tambah Data";
  modal.dataset.id = row ? row.id : "";

  form.innerHTML = cfg.fields.map(f => {
    if (f.type === "image") {
      return renderImageField(f, row ? (row[f.key] || "") : "");
    }
    return `
      <div class="form-group">
        <label>${f.label}${f.required ? ' <span class="required">*</span>' : ""}</label>
        ${f.type === "textarea"
          ? `<textarea name="${f.key}" rows="3" ${f.required ? "required" : ""}>${row ? (row[f.key] || "") : ""}</textarea>`
          : `<input type="${f.type}" name="${f.key}"
               value="${row ? (row[f.key] || "") : ""}"
               ${f.required ? "required" : ""} />`
        }
      </div>
    `;
  }).join("");

  document.getElementById("btn-save").onclick = saveForm;
  modal.classList.remove("hidden");
  setTimeout(() => form.querySelector("input:not([type=hidden]), textarea")?.focus(), 100);
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// ── Simpan (insert / update) ──────────────────────────────────────────────────
async function saveForm() {
  const cfg     = CONFIG[activeTab];
  const form    = document.getElementById("admin-form");
  const id      = document.getElementById("modal").dataset.id;
  const btnSave = document.getElementById("btn-save");

  // Validasi required
  for (const el of form.querySelectorAll("[required]")) {
    if (!el.value.trim()) {
      el.focus();
      el.style.borderColor = "#e53e3e";
      setTimeout(() => el.style.borderColor = "", 2000);
      return;
    }
  }

  btnSave.textContent = "Mengupload...";
  btnSave.disabled    = true;

  try {
    const payload = {};

    for (const f of cfg.fields) {
      if (f.type === "image") {
        // Upload ke Storage, dapat URL publik
        payload[f.key] = await uploadImage(f.key);
      } else {
        const el = form.querySelector(`[name="${f.key}"]`);
        payload[f.key] = el?.value.trim() || null;
      }
    }

    let error;
    if (id) {
      ({ error } = await sb.from(cfg.table).update(payload).eq("id", id));
    } else {
      ({ error } = await sb.from(cfg.table).insert(payload));
    }

    if (error) throw error;

    closeModal();
    renderTab(activeTab);

  } catch (err) {
    alert("❌ Gagal menyimpan: " + err.message);
  } finally {
    btnSave.textContent = "Simpan";
    btnSave.disabled    = false;
  }
}

// ── Hapus data ────────────────────────────────────────────────────────────────
async function deleteRow(id) {
  if (!confirm("Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.")) return;
  const cfg = CONFIG[activeTab];
  const { error } = await sb.from(cfg.table).delete().eq("id", id);
  if (error) {
    alert("❌ Gagal hapus: " + error.message);
  } else {
    renderTab(activeTab);
  }
}

// ── Event tab & keyboard ──────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    renderTab(btn.dataset.tab);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderTab("beasiswa");
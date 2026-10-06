// Konfigurasi Tailwind tambahan (Custom Theme Colors)
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                softBlue: {
                    50: '#F0F7FF', 100: '#E0EFFE', 200: '#BAE0FD',
                    300: '#7CC5FC', 400: '#38BDF8', 500: '#0284C7',
                },
                softPink: {
                    50: '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8',
                    300: '#F472B6', 400: '#E11D48',
                }
            }
        }
    }
};

// URL Server Backend Express
// Ganti dengan URL Railway kamu setelah deploy backend
const API_URL = 'https://myides.vercel.app/api/ideas';

// State aplikasi
let ideas = [];
let currentPlatformFilter = 'ALL';
let currentStatusFilter = 'ALL';
let searchQuery = '';

// Ketiak Halaman Pertama Kali Dimuat
window.onload = function() {
    fetchIdeas();
};



// -------------------------------------------------------------
// 1. READ: Ambil Data dari Backend (GET)
// -------------------------------------------------------------
async function fetchIdeas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        ideas = await response.json();
        renderIdeas();
    } catch (error) {
        console.error('Error:', error);
        showToast("Gagal terhubung ke server backend!", "error");
    }
}

// -------------------------------------------------------------
// 2. CREATE / UPDATE: Simpan Data ke Backend (POST / PUT)
// -------------------------------------------------------------
async function saveIdea(event) {
    event.preventDefault();

    const id = document.getElementById('ideaId').value;
    const title = document.getElementById('titleInput').value.trim();
    const status = document.getElementById('statusInput').value;
    const pillar = document.getElementById('pillarInput').value.trim();
    const notes = document.getElementById('notesInput').value.trim();

    const platformCheckboxes = document.querySelectorAll('input[name="platforms"]:checked');
    const platforms = Array.from(platformCheckboxes).map(cb => cb.value);

    if (platforms.length === 0) {
        showToast("Pilih minimal satu target platform!", "error");
        return;
    }

    // Payload data yang dikirim ke Backend
    const ideaData = {
        title,
        platforms,
        status,
        pillar: pillar || 'Umum',
        notes
    };

    try {
        let response;
        if (id) {
            // Edit Data Exisiting (PUT)
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ideaData)
            });
        } else {
            // Tambah Data Baru (POST)
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ideaData)
            });
        }

        if (!response.ok) throw new Error('Gagal menyimpan data');

        showToast(id ? "Ide berhasil diperbarui! ✨" : "Ide baru berhasil disimpan! 💡");
        closeModal();
        fetchIdeas(); // Reload data terbaru dari database
    } catch (error) {
        console.error('Error:', error);
        showToast("Gagal menyimpan ide ke database", "error");
    }
}

// -------------------------------------------------------------
// 3. DELETE: Hapus Data dari Backend (DELETE)
// -------------------------------------------------------------
async function deleteIdea(id) {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;

    if (confirm(`Apakah Anda yakin ingin menghapus ide "${idea.title}"?`)) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Gagal menghapus data');

            showToast("Ide berhasil dihapus dari database", "info");
            fetchIdeas(); // Reload data terbaru dari database
        } catch (error) {
            console.error('Error:', error);
            showToast("Gagal menghapus data", "error");
        }
    }
}

// -------------------------------------------------------------
// Helper UI & Filter Functions
// -------------------------------------------------------------
function setPlatformFilter(platform) {
    currentPlatformFilter = platform;
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.className = 'nav-tab px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all whitespace-nowrap';
    });
    
    const activeTab = document.getElementById(`tab-${platform}`);
    if(activeTab) {
        if(platform === 'ALL') activeTab.className = 'nav-tab px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-blue-500 text-white shadow-sm';
        if(platform === 'YouTube') activeTab.className = 'nav-tab px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-red-500 text-white shadow-sm';
        if(platform === 'TikTok') activeTab.className = 'nav-tab px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-slate-800 text-white shadow-sm';
        if(platform === 'Instagram') activeTab.className = 'nav-tab px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-pink-500 text-white shadow-sm';
    }

    renderIdeas();
}

function handleSearch() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase();
    renderIdeas();
}

function handleStatusFilter() {
    currentStatusFilter = document.getElementById('statusFilter').value;
    renderIdeas();
}

function renderIdeas() {
    const grid = document.getElementById('ideasGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML = '';

    // Pastikan platforms diserialisasi sebagai Array jika dari backend dalam bentuk JSON string
    const processedIdeas = ideas.map(idea => ({
        ...idea,
        platforms: typeof idea.platforms === 'string' ? JSON.parse(idea.platforms) : idea.platforms
    }));

    const filtered = processedIdeas.filter(idea => {
        const matchPlatform = currentPlatformFilter === 'ALL' || (idea.platforms && idea.platforms.includes(currentPlatformFilter));
        const matchStatus = currentStatusFilter === 'ALL' || idea.status === currentStatusFilter;
        const matchSearch = (idea.title || '').toLowerCase().includes(searchQuery) || (idea.notes || '').toLowerCase().includes(searchQuery);
        return matchPlatform && matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');

        filtered.forEach(idea => {
            grid.appendChild(createCardElement(idea));
        });
    }

    updateStats();
}

function createCardElement(idea) {
    const card = document.createElement('div');
    card.className = 'glass-card bg-white/90 rounded-2xl p-5 border border-white/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group';

    let platformBadgesHTML = (idea.platforms || []).map(p => {
        if(p === 'YouTube') return `<span class="px-2 py-0.5 rounded-lg bg-red-50 text-red-500 text-[11px] font-semibold border border-red-100 flex items-center"><i class="fa-brands fa-youtube mr-1"></i> YouTube</span>`;
        if(p === 'TikTok') return `<span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200 flex items-center"><i class="fa-brands fa-tiktok mr-1"></i> TikTok</span>`;
        if(p === 'Instagram') return `<span class="px-2 py-0.5 rounded-lg bg-pink-50 text-pink-500 text-[11px] font-semibold border border-pink-100 flex items-center"><i class="fa-brands fa-instagram mr-1"></i> Instagram</span>`;
        return '';
    }).join(' ');

    let statusBadgeClass = "bg-slate-100 text-slate-600";
    if(idea.status === 'Draft') statusBadgeClass = "bg-amber-50 text-amber-600 border border-amber-200";
    if(idea.status === 'In Progress') statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
    if(idea.status === 'Ready') statusBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if(idea.status === 'Published') statusBadgeClass = "bg-purple-50 text-purple-600 border border-purple-200";

    const formattedDate = idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    card.innerHTML = `
        <div>
            <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex flex-wrap gap-1.5">${platformBadgesHTML}</div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass}">
                    ${idea.status}
                </span>
            </div>

            <h3 onclick="viewIdea('${idea.id}')" class="text-base font-bold text-slate-800 hover:text-softBlue-500 cursor-pointer transition line-clamp-2 mb-2">
                ${escapeHTML(idea.title)}
            </h3>

            <p class="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                ${idea.notes ? escapeHTML(idea.notes) : '<em class="text-slate-300">Belum ada catatan detail...</em>'}
            </p>
        </div>

        <div class="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center text-[11px]">
                <i class="fa-regular fa-clock mr-1 text-slate-400"></i> ${formattedDate}
            </span>

            <div class="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition">
                <button onclick="viewIdea('${idea.id}')" title="Lihat Detail" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center">
                    <i class="fa-solid fa-eye text-xs"></i>
                </button>
                <button onclick="openModal('edit', '${idea.id}')" title="Edit Ide" class="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-500 flex items-center justify-center">
                    <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button onclick="deleteIdea('${idea.id}')" title="Hapus Ide" class="w-7 h-7 rounded-lg hover:bg-pink-50 text-slate-500 hover:text-pink-500 flex items-center justify-center">
                    <i class="fa-solid fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

function openModal(mode, id = null) {
    const modal = document.getElementById('ideaModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('ideaForm');

    form.reset();
    document.getElementById('ideaId').value = '';

    if (mode === 'add') {
        modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle text-softBlue-400 mr-2"></i> Tambah Ide Konten Baru`;
    } else if (mode === 'edit' && id) {
        modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square text-softPink-400 mr-2"></i> Edit Ide Konten`;
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            document.getElementById('ideaId').value = idea.id;
            document.getElementById('titleInput').value = idea.title;
            document.getElementById('statusInput').value = idea.status;
            document.getElementById('pillarInput').value = idea.pillar || '';
            document.getElementById('notesInput').value = idea.notes || '';

            const platformsArray = typeof idea.platforms === 'string' ? JSON.parse(idea.platforms) : idea.platforms;
            const checkboxes = document.querySelectorAll('input[name="platforms"]');
            checkboxes.forEach(cb => {
                cb.checked = platformsArray.includes(cb.value);
            });
        }
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('ideaModal').classList.add('hidden');
}

function viewIdea(id) {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;

    const platformsArray = typeof idea.platforms === 'string' ? JSON.parse(idea.platforms) : idea.platforms;
    const formattedDate = idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    document.getElementById('viewTitle').innerText = idea.title;
    document.getElementById('viewCreatedDate').innerText = formattedDate;
    document.getElementById('viewPillar').innerText = idea.pillar || 'Umum';
    document.getElementById('viewNotes').innerText = idea.notes || 'Tidak ada catatan detail materi.';

    const statusBadge = document.getElementById('viewStatusBadge');
    statusBadge.innerText = idea.status;
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold ' + 
        (idea.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 
         idea.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
         idea.status === 'Published' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600');

    const viewPlatforms = document.getElementById('viewPlatforms');
    viewPlatforms.innerHTML = platformsArray.map(p => `<span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"><i class="fa-solid fa-hashtag text-slate-400 mr-1"></i>${p}</span>`).join(' ');

    document.getElementById('viewModal').classList.remove('hidden');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.add('hidden');
}

function updateStats() {
    document.getElementById('statTotal').innerText = ideas.length;
    
    const countPlatform = (platform) => {
        return ideas.filter(i => {
            const pArr = typeof i.platforms === 'string' ? JSON.parse(i.platforms) : i.platforms;
            return pArr && pArr.includes(platform);
        }).length;
    };

    document.getElementById('statYoutube').innerText = countPlatform('YouTube');
    document.getElementById('statTiktok').innerText = countPlatform('TikTok');
    document.getElementById('statInstagram').innerText = countPlatform('Instagram');
}

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    toastMessage.innerText = message;
    if (type === 'error') {
        toastIcon.className = "fa-solid fa-circle-exclamation text-red-400";
    } else if (type === 'info') {
        toastIcon.className = "fa-solid fa-circle-info text-blue-400";
    } else {
        toastIcon.className = "fa-solid fa-circle-check text-green-400";
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
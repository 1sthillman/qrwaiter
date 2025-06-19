// Supabase bağlantı bilgileri
const SUPABASE_URL = 'https://dhtttamiovdlazacegem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodHR0YW1pb3ZkbGF6YWNlZ2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzg4MTMsImV4cCI6MjA2NTkxNDgxM30.ILp4uQ8un0WBMMH0KmNAQPQ2_Z2swYLOvObYmMInsMA';

// Supabase istemcisini oluştur
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elementleri
const elements = {
    // Çağrı kartı
    callCard: document.getElementById('callCard'),
    tableDisplay: document.getElementById('tableDisplay'),
    callNote: document.getElementById('callNote'),
    callWaiterBtn: document.getElementById('callWaiterBtn'),
    callUrgentBtn: document.getElementById('callUrgentBtn'),
    
    // Durum kartı
    statusCard: document.getElementById('statusCard'),
    statusTableDisplay: document.getElementById('statusTableDisplay'),
    statusDescription: document.getElementById('statusDescription'),
    statusWaiting: document.getElementById('statusWaiting'),
    statusResponded: document.getElementById('statusResponded'),
    waitingTime: document.getElementById('waitingTime'),
    responseNote: document.getElementById('responseNote'),
    newCallBtn: document.getElementById('newCallBtn'),
    
    // Yükleniyor overlay
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Uygulama durumu
const appState = {
    tableNumber: null,
    callId: null,
    waitingStartTime: null,
    waitingInterval: null,
    realtimeSubscribed: false
};

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Uygulama başlatma
async function initApp() {
    // URL'den masa numarasını al
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = parseInt(urlParams.get('table'));
    
    if (isNaN(tableNumber) || tableNumber <= 0) {
        showError('Geçersiz masa numarası. Lütfen QR kodu tekrar tarayın.');
        return;
    }
    
    // Masa numarasını sakla ve göster
    appState.tableNumber = tableNumber;
    elements.tableDisplay.textContent = `Masa ${tableNumber}`;
    elements.statusTableDisplay.textContent = `Masa ${tableNumber}`;
    
    // Yükleniyor göstergesini kapat
    elements.loadingOverlay.style.display = 'none';
    
    // Olay dinleyicilerini ayarla
    setupEventListeners();
    
    // Masanın mevcut çağrılarını kontrol et
    await checkExistingCalls();
}

// Olay dinleyicilerini ayarla
function setupEventListeners() {
    // Normal çağrı butonu
    elements.callWaiterBtn.addEventListener('click', () => {
        createCall(false);
    });
    
    // Acil çağrı butonu
    elements.callUrgentBtn.addEventListener('click', () => {
        createCall(true);
    });
    
    // Yeni çağrı butonu
    elements.newCallBtn.addEventListener('click', () => {
        elements.statusCard.style.display = 'none';
        elements.callCard.style.display = 'block';
        appState.callId = null;
        
        if (appState.waitingInterval) {
            clearInterval(appState.waitingInterval);
            appState.waitingInterval = null;
        }
        
        if (appState.realtimeSubscribed) {
            supabase.removeChannel('call_status_channel');
            appState.realtimeSubscribed = false;
        }
    });
}

// Mevcut çağrıları kontrol et
async function checkExistingCalls() {
    try {
        elements.loadingOverlay.style.display = 'flex';
        
        const { data, error } = await supabase
            .from('waiter_calls')
            .select('*')
            .eq('table_number', appState.tableNumber)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            const recentCall = data[0];
            
            // Son 30 dakika içinde bir çağrı var mı kontrol et
            const callTime = new Date(recentCall.created_at);
            const now = new Date();
            const diffMinutes = (now - callTime) / (1000 * 60);
            
            if (diffMinutes < 30) {
                // Aktif çağrı var, duruma göre göster
                appState.callId = recentCall.id;
                showCallStatus(recentCall);
            }
        }
        
        elements.loadingOverlay.style.display = 'none';
    } catch (error) {
        console.error('Mevcut çağrılar kontrol edilirken hata:', error);
        elements.loadingOverlay.style.display = 'none';
        showError('Mevcut çağrılar kontrol edilirken bir hata oluştu. Lütfen QR kodu tekrar tarayın.');
    }
}

// Çağrı oluştur
async function createCall(isUrgent) {
    try {
        const callNote = elements.callNote.value.trim();
        
        elements.loadingOverlay.style.display = 'flex';
        
        const { data, error } = await supabase
            .from('waiter_calls')
            .insert({
                table_number: appState.tableNumber,
                is_urgent: isUrgent,
                note: callNote || null,
                status: 'waiting',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (error) throw error;
        
        appState.callId = data.id;
        showCallStatus(data);
        
        elements.loadingOverlay.style.display = 'none';
    } catch (error) {
        console.error('Çağrı oluşturulurken hata:', error);
        elements.loadingOverlay.style.display = 'none';
        showError('Çağrı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Çağrı durumunu göster
function showCallStatus(call) {
    elements.callCard.style.display = 'none';
    elements.statusCard.style.display = 'block';
    
    if (call.status === 'waiting') {
        elements.statusWaiting.classList.remove('d-none');
        elements.statusResponded.classList.add('d-none');
        
        // Bekleme süresini göster
        appState.waitingStartTime = new Date(call.created_at);
        updateWaitingTime();
        
        // Bekleme süresini periyodik olarak güncelle
        appState.waitingInterval = setInterval(updateWaitingTime, 1000);
        
        // Gerçek zamanlı durum takibi
        setupRealtimeSubscription();
    } else if (call.status === 'responded') {
        elements.statusWaiting.classList.add('d-none');
        elements.statusResponded.classList.remove('d-none');
        
        if (call.note) {
            elements.responseNote.textContent = call.note;
        } else {
            elements.responseNote.textContent = '';
        }
        
        if (appState.waitingInterval) {
            clearInterval(appState.waitingInterval);
            appState.waitingInterval = null;
        }
    }
}

// Bekleme süresini güncelle
function updateWaitingTime() {
    if (!appState.waitingStartTime) return;
    
    const now = new Date();
    const diffSecs = Math.floor((now - appState.waitingStartTime) / 1000);
    
    let timeText = '';
    if (diffSecs < 60) {
        timeText = `${diffSecs} saniyedir bekliyorsunuz`;
    } else {
        const minutes = Math.floor(diffSecs / 60);
        const seconds = diffSecs % 60;
        timeText = `${minutes} dakika ${seconds} saniyedir bekliyorsunuz`;
    }
    
    elements.waitingTime.textContent = timeText;
}

// Gerçek zamanlı abonelik ayarla
function setupRealtimeSubscription() {
    if (appState.realtimeSubscribed || !appState.callId) return;
    
    const channel = supabase
        .channel('call_status_channel')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'waiter_calls',
                filter: `id=eq.${appState.callId}`
            },
            handleCallStatusChange
        )
        .subscribe();
        
    appState.realtimeSubscribed = true;
}

// Çağrı durum değişikliğini işle
function handleCallStatusChange(payload) {
    console.log('Çağrı durumu değişti:', payload);
    
    const updatedCall = payload.new;
    
    if (updatedCall.status === 'responded') {
        // Yanıt verildi, durumu göster
        elements.statusWaiting.classList.add('d-none');
        elements.statusResponded.classList.remove('d-none');
        
        if (updatedCall.note) {
            elements.responseNote.textContent = updatedCall.note;
        } else {
            elements.responseNote.textContent = '';
        }
        
        if (appState.waitingInterval) {
            clearInterval(appState.waitingInterval);
            appState.waitingInterval = null;
        }
    }
}

// Hata göster
function showError(message) {
    alert(message);
} 
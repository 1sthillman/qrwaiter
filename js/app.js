// Sabit veriler - Gerçek uygulamada sunucudan alınacak
const TABLES = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    number: index + 1,
    status: 'empty'
}));

const MENU_ITEMS = {
    starters: [
        { id: 1, name: 'Çorba', price: 45, category: 'starters', image: 'https://via.placeholder.com/80' },
        { id: 2, name: 'Salata', price: 55, category: 'starters', image: 'https://via.placeholder.com/80' },
        { id: 3, name: 'Bruschetta', price: 65, category: 'starters', image: 'https://via.placeholder.com/80' },
        { id: 4, name: 'Kalamar', price: 85, category: 'starters', image: 'https://via.placeholder.com/80' }
    ],
    mains: [
        { id: 5, name: 'Izgara Tavuk', price: 120, category: 'mains', image: 'https://via.placeholder.com/80' },
        { id: 6, name: 'Köfte', price: 135, category: 'mains', image: 'https://via.placeholder.com/80' },
        { id: 7, name: 'Mantı', price: 110, category: 'mains', image: 'https://via.placeholder.com/80' },
        { id: 8, name: 'Pizza', price: 145, category: 'mains', image: 'https://via.placeholder.com/80' }
    ],
    drinks: [
        { id: 9, name: 'Kola', price: 25, category: 'drinks', image: 'https://via.placeholder.com/80' },
        { id: 10, name: 'Ayran', price: 20, category: 'drinks', image: 'https://via.placeholder.com/80' },
        { id: 11, name: 'Meyve Suyu', price: 30, category: 'drinks', image: 'https://via.placeholder.com/80' },
        { id: 12, name: 'Su', price: 10, category: 'drinks', image: 'https://via.placeholder.com/80' }
    ],
    desserts: [
        { id: 13, name: 'Sütlaç', price: 55, category: 'desserts', image: 'https://via.placeholder.com/80' },
        { id: 14, name: 'Baklava', price: 75, category: 'desserts', image: 'https://via.placeholder.com/80' },
        { id: 15, name: 'Dondurma', price: 45, category: 'desserts', image: 'https://via.placeholder.com/80' },
        { id: 16, name: 'Profiterol', price: 65, category: 'desserts', image: 'https://via.placeholder.com/80' }
    ]
};

// Uygulama durumu
let appState = {
    tables: [...TABLES],
    orders: [],
    notifications: [],
    currentTable: null,
    currentOrder: {
        items: [],
        note: ''
    },
    currentUser: null
};

// Supabase değişkenleri (Yenilendi)
let supabase;
let channel;
const SUPABASE_URL = 'https://dhtttamiovdlazacegem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodHR0YW1pb3ZkbGF6YWNlZ2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzg4MTMsImV4cCI6MjA2NTkxNDgxM30.ILp4uQ8un0WBMMH0KmNAQPQ2_Z2swYLOvObYmMInsMA';
const rolePrefix = {
    'waiter': 'w',
    'kitchen': 'k',
    'cashier': 'c'
};

// DOM elemanları
const elements = {
    // Giriş ekranı
    loginScreen: document.getElementById('loginScreen'),
    roleSelect: document.getElementById('roleSelect'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginButton: document.getElementById('loginButton'),
    loginError: document.getElementById('loginError'),

    // Ana uygulama
    appContainer: document.getElementById('appContainer'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    logoutButton: document.getElementById('logoutButton'),

    // Garson ekranı
    waiterScreen: document.getElementById('waiterScreen'),
    tableGrid: document.getElementById('tableGrid'),
    refreshTablesButton: document.getElementById('refreshTablesButton'),

    // Mutfak ekranı
    kitchenScreen: document.getElementById('kitchenScreen'),
    kitchenOrdersList: document.getElementById('kitchenOrdersList'),
    refreshKitchenButton: document.getElementById('refreshKitchenButton'),

    // Kasiyer ekranı
    cashierScreen: document.getElementById('cashierScreen'),
    cashierTablesList: document.getElementById('cashierTablesList'),
    refreshCashierButton: document.getElementById('refreshCashierButton'),

    // Sipariş ekranı
    orderScreen: document.getElementById('orderScreen'),
    orderTableTitle: document.getElementById('orderTableTitle'),
    backToTablesButton: document.getElementById('backToTablesButton'),
    categoryButtons: document.querySelectorAll('.category-button'),
    menuItemsGrid: document.getElementById('menuItemsGrid'),
    orderCart: document.getElementById('orderCart'),
    orderNote: document.getElementById('orderNote'),
    submitOrderButton: document.getElementById('submitOrderButton'),

    // Sipariş detay ekranı
    orderDetailScreen: document.getElementById('orderDetailScreen'),
    detailTableTitle: document.getElementById('detailTableTitle'),
    detailTableNumber: document.getElementById('detailTableNumber'),
    detailTableStatus: document.getElementById('detailTableStatus'),
    detailTableTime: document.getElementById('detailTableTime'),
    detailTableWaiter: document.getElementById('detailTableWaiter'),
    orderDetailItems: document.getElementById('orderDetailItems'),
    orderDetailNote: document.getElementById('orderDetailNote'),
    orderDetailActions: document.getElementById('orderDetailActions'),
    backFromDetailButton: document.getElementById('backFromDetailButton'),

    // Ödeme ekranı
    paymentScreen: document.getElementById('paymentScreen'),
    paymentTitle: document.getElementById('paymentTitle'),
    paymentItems: document.getElementById('paymentItems'),
    paymentTotal: document.getElementById('paymentTotal'),
    cashPayment: document.getElementById('cashPayment'),
    cardPayment: document.getElementById('cardPayment'),
    completePaymentButton: document.getElementById('completePaymentButton'),
    backFromPaymentButton: document.getElementById('backFromPaymentButton'),

    // Bildirimler
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    notificationButton: document.getElementById('notificationButton'),
    notificationPanel: document.getElementById('notificationPanel'),
    notificationBadge: document.getElementById('notificationBadge'),
    notificationList: document.getElementById('notificationList'),
    notificationSound: document.getElementById('notificationSound'),
    newOrderSound: document.getElementById('newOrderSound'),
    orderReadySound: document.getElementById('orderReadySound'),
    orderDeliveredSound: document.getElementById('orderDeliveredSound'),
    orderServedSound: document.getElementById('orderServedSound'),
    paymentCompleteSound: document.getElementById('paymentCompleteSound'),

    // Ürün Yönetimi
    productManagementButton: document.getElementById('productManagementButton'),
    productManagementScreen: document.getElementById('productManagementScreen'),
    backFromProductManagementButton: document.getElementById('backFromProductManagementButton'),
    productCategoryButtons: document.querySelectorAll('.product-category-button'),
    productsList: document.getElementById('productsList'),
    addNewProductButton: document.getElementById('addNewProductButton'),
    productFormScreen: document.getElementById('productFormScreen'),
    productFormTitle: document.getElementById('productFormTitle'),
    productCategory: document.getElementById('productCategory'),
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productAvailable: document.getElementById('productAvailable'),
    cancelProductButton: document.getElementById('cancelProductButton'),
    saveProductButton: document.getElementById('saveProductButton'),
    productCategoryButtonsContainer: document.getElementById('productCategoryButtonsContainer'),

    // Garson yönetimi
    callsContainer: document.getElementById('callsContainer'),
    notificationArea: document.getElementById('notificationArea'),
    notificationMessage: document.getElementById('notificationMessage'),
    refreshBtn: document.getElementById('refreshBtn'),
    filterDropdown: document.getElementById('filterDropdown'),

    // İstatistik ekranı
    statisticsContainer: document.getElementById('statisticsContainer'),
    statisticsLink: document.getElementById('statisticsLink'),
    totalCallsCount: document.getElementById('totalCallsCount'),
    avgResponseTime: document.getElementById('avgResponseTime'),
    completedCallsCount: document.getElementById('completedCallsCount'),

    // Ayarlar ekranı
    settingsContainer: document.getElementById('settingsContainer'),
    settingsLink: document.getElementById('settingsLink'),
    enableNotifications: document.getElementById('enableNotifications'),
    enableSound: document.getElementById('enableSound'),
    tableNumber: document.getElementById('tableNumber'),
    qrSize: document.getElementById('qrSize'),
    generateQRBtn: document.getElementById('generateQRBtn'),
    qrCodeContainer: document.getElementById('qrCodeContainer'),
    downloadQRBtn: document.getElementById('downloadQRBtn'),

    // Yanıt modal
    responseModal: document.getElementById('responseModal') ? new bootstrap.Modal(document.getElementById('responseModal')) : null,
    modalTableNumber: document.getElementById('modalTableNumber'),
    modalCallTime: document.getElementById('modalCallTime'),
    modalCallNote: document.getElementById('modalCallNote'),
    responseNote: document.getElementById('responseNote'),
    submitResponseBtn: document.getElementById('submitResponseBtn'),

    // Giriş modal
    loginModal: document.getElementById('loginModal') ? new bootstrap.Modal(document.getElementById('loginModal')) : null,
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Ses
    newCallSound: document.getElementById('newCallSound')
};

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Uygulama başlatma
function initApp() {
    // Supabase istemcisini başlat
    initSupabase();
    
    // Kullanıcı girişi kontrolü
    checkAuth();
    
    // Olay dinleyicilerini ayarla
    setupEventListeners();

    // Garson çağrılarını yükle (garson rolü için)
    if (appState.currentUser && appState.currentUser.role === 'waiter') {
        loadWaiterCalls();
    }
}

// Supabase istemcisini başlat
function initSupabase() {
    try {
        console.log('Supabase bağlantısı kuruluyor...');
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            },
            auth: {
                persistSession: true,
                autoRefreshToken: true
            },
            db: {
                schema: 'public'
            },
            global: {
                fetch: fetch.bind(globalThis)
            }
        });

        // Supabase bağlantısını kontrol et
        supabase.auth.getSession().then(({ data }) => {
            console.log('Supabase bağlantısı başarılı');

            // Gerçek zamanlı senkronizasyon için uygulama verileriyle veritabanını senkronize et
            syncDatabaseWithApp();
        }).catch(error => {
            console.error('Supabase bağlantı hatası:', error);
            showToast('Veritabanı bağlantısı kurulamadı! Lütfen internet bağlantınızı kontrol edin.');
        });
    } catch (err) {
        console.error('Supabase başlatma hatası:', err);
    }
}

// Veritabanı ile uygulama verilerini senkronize et
async function syncDatabaseWithApp() {
    try {
        // Verileri senkronize fonksiyonunu çağır
        const { data, error } = await supabase.rpc('sync_menu_data');

        if (error) {
            console.error('Veri senkronizasyonu hatası:', error);
            // RPC hatası olsa da yükleme adımlarına devam et
        }

        console.log('Veritabanı ile senkronizasyon tamamlandı:', data);

        // Verileri sırayla yükle
        await loadTablesFromSupabase();
        await loadMenuItemsFromSupabase();
        await loadOrdersFromSupabase();

        // Gerçek zamanlı bağlantıyı başlat
        if (appState.currentUser) {
            initRealtimeConnection(appState.currentUser.role, appState.currentUser.fullName);
        }
    } catch (err) {
        console.error('Senkronizasyon hatası:', err);
    }
}

// Supabase'den tabloları yükle
async function loadTablesFromSupabase() {
    try {
        console.log('Masalar yükleniyor...');
        const { data: tables, error } = await supabase
            .from('masalar')
            .select('*')
            .order('masa_no', { ascending: true });

        if (error) {
            console.error('Masalar yüklenirken hata:', error);
            // Hata durumunda varsayılan masaları kullan
            return;
        }

        if (tables && tables.length > 0) {
            console.log('Veritabanından masalar yüklendi:', tables.length);
            // Supabase tablosundan gelen verileri uygulama formatına dönüştür
            appState.tables = tables.map(table => ({
                id: table.id,
                number: table.masa_no,
                status: convertStatusFromDb(table.durum),
                waiterId: table.waiter_id,
                waiterName: table.waiter_name,
                orderId: table.siparis_id || null,
                hasWaiterCall: false // Varsayılan olarak çağrı yok
            }));

            // Aktif garson çağrılarını kontrol et
            if (appState.currentUser && appState.currentUser.role === 'waiter') {
                await checkActiveWaiterCalls();
            }

            // UI'ı güncelle
            refreshUI();
        } else {
            console.log('Veritabanında masa bulunamadı, varsayılan masalar yükleniyor');
            // Eğer veritabanında masa yoksa, varsayılan masaları kullan
            appState.tables = [...TABLES];

            // Ayrıca varsayılan masaları veritabanına ekle
            try {
                // İlk 20 masayı ekle
                const initialTables = Array.from({ length: 20 }, (_, index) => ({
                    masa_no: index + 1,
                    durum: 'bos'
                }));

                const { error: insertError } = await supabase
                    .from('masalar')
                    .insert(initialTables);

                if (insertError) {
                    console.error('Varsayılan masalar eklenirken hata:', insertError);
                } else {
                    console.log('Varsayılan masalar veritabanına eklendi');
                }
            } catch (err) {
                console.error('Masalar eklenirken hata:', err);
            }
        }
    } catch (err) {
        console.error('Masalar yüklenirken hata:', err);
    }
}

// Aktif garson çağrılarını kontrol et
async function checkActiveWaiterCalls() {
    try {
        const { data: calls, error } = await supabase
            .from('waiter_calls')
            .select('*')
            .eq('status', 'waiting');
            
        if (error) {
            console.error('Garson çağrıları kontrol edilirken hata:', error);
            return;
        }
        
        if (calls && calls.length > 0) {
            console.log('Aktif garson çağrıları bulundu:', calls.length);
            // Her bir aktif çağrı için ilgili masayı işaretle
            calls.forEach(call => {
                const table = appState.tables.find(t => t.number === call.table_number);
                if (table) {
                    table.hasWaiterCall = true;
                    console.log(`Masa ${call.table_number} için garson çağrısı işaretlendi`);
                }
            });
            
            // Ses çal (sadece bir kere)
            if (elements.newCallSound && calls.length > 0) {
                elements.newCallSound.play().catch(err => console.log('Ses çalma hatası:', err));
            }
        }
    } catch (err) {
        console.error('Garson çağrıları kontrol edilirken hata:', err);
    }
}

// Menü ürünlerini Supabase'den yükle
async function loadMenuItemsFromSupabase() {
    try {
        console.log('Menü ürünleri yükleniyor...');
        const { data: menuItems, error } = await supabase
            .from('urunler')
            .select('*, kategoriler(id, ad, sira)')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Menü ürünleri yüklenirken hata:', error);
            return;
        }

        if (menuItems && menuItems.length > 0) {
            console.log('Veritabanından menü ürünleri yüklendi:', menuItems.length);

            // Kategori eşleme Sabit olarak
            const categoryMap = {
                'Başlangıçlar': 'starters',
                'Ana Yemekler': 'mains',
                'İçecekler': 'drinks',
                'Tatlılar': 'desserts'
            };
            const categorizedItems = {
                starters: [],
                mains: [],
                drinks: [],
                desserts: []
            };

            menuItems.forEach(item => {
                const turkName = item.kategoriler?.ad;
                const key = categoryMap[turkName] || 'mains';
                categorizedItems[key].push({
                        id: item.id,
                        name: item.ad,
                        price: parseFloat(item.fiyat),
                    category: key,
                        category_id: item.kategori_id,
                    image: item.image_url || 'https://via.placeholder.com/80',
                    image_url: item.image_url || 'https://via.placeholder.com/80',
                        available: item.stok_durumu
                    });
            });

            Object.keys(categorizedItems).forEach(cat => {
                if (categorizedItems[cat].length > 0) {
                    MENU_ITEMS[cat] = categorizedItems[cat];
                }
            });

            console.log('Menü ürünleri güncellendi:', MENU_ITEMS);
        } else {
            console.log('Veritabanında menü ürünü bulunamadı, varsayılan ürünler kullanılıyor');
            // ... existing code for defaults ...
        }
    } catch (err) {
        console.error('Menü ürünleri yüklenirken hata:', err);
    }
}

// Siparişleri Supabase'den yükle
async function loadOrdersFromSupabase() {
    try {
        console.log('Siparişler yükleniyor...');
        const { data: orders, error } = await supabase
            .from('siparisler')
            .select(`
                *,
                siparis_kalemleri(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Siparişler yüklenirken hata:', error);
            return;
        }

        if (orders && orders.length > 0) {
            console.log('Veritabanından siparişler yüklendi:', orders.length);

            // Supabase tablosundan gelen verileri uygulama formatına dönüştür
            appState.orders = orders.map(order => {
                const items = order.siparis_kalemleri ? order.siparis_kalemleri.map(item => ({
                    id: item.urun_id,
                    name: item.urun_adi,
                    price: parseFloat(item.birim_fiyat),
                    quantity: item.miktar,
                    category: 'mains', // Varsayılan kategori
                    total: parseFloat(item.toplam_fiyat)
                })) : [];

                const now = new Date(order.created_at);
                const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const dateString = now.getDate().toString().padStart(2, '0') + '.' + (now.getMonth() + 1).toString().padStart(2, '0') + '.' + now.getFullYear();

                return {
                    id: order.id,
                    tableId: order.masa_id,
                    tableNumber: order.masa_no,
                    status: convertStatusFromDb(order.durum),
                    items: items,
                    note: order.siparis_notu || '',
                    waiter: order.waiter_name,
                    time: timeString,
                    date: dateString,
                    total: parseFloat(order.toplam_fiyat)
                };
            });

            // UI'ı güncelle
            refreshUI();
        }
    } catch (err) {
        console.error('Siparişler yüklenirken hata:', err);
    }
}

// Durum bilgisini veritabanı formatından uygulama formatına dönüştür
function convertStatusFromDb(status) {
    const statusMap = {
        'bos': 'empty',
        'boş': 'empty',
        'dolu': 'active',
        'hazirlanıyor': 'ready',
        'hazırlanıyor': 'ready',
        'hazirlaniyor': 'ready',
        'hazır': 'ready',
        'beklemede': 'new',
        'tamamlandi': 'ready',
        'tamamlandı': 'ready',
        'teslim_edildi': 'delivered',
        'servis_edildi': 'served',
        'empty': 'empty',
        'occupied': 'active',
        'preparing': 'ready',
        'ready': 'ready',
        'delivered': 'delivered',
        'served': 'served',
        'completed': 'completed',
        'payment': 'payment',
        'qr_siparis': 'qr_order',
        'qr_order': 'qr_order'
    };

    console.log('Durum dönüştürülüyor:', status, '->', statusMap[status] || status);
    return statusMap[status] || status;
}

// Durum bilgisini uygulama formatından veritabanı formatına dönüştür
function convertStatusToDb(status) {
    const statusMap = {
        'empty': 'bos',
        'occupied': 'dolu',
        'ready': 'hazır',
        'new': 'beklemede',
        'delivered': 'teslim_edildi',
        'served': 'servis_edildi',
        'completed': 'tamamlandi',
        'active': 'dolu', // Bu önemli - 'active' durumu 'dolu' olarak çevrilmeli
        'payment': 'payment',
        'qr_order': 'qr_siparis'
    };

    console.log('Durum DB formatına dönüştürülüyor:', status, '->', statusMap[status] || status);
    return statusMap[status] || status;
}

// Supabase gerçek zamanlı bağlantısını başlat
function initRealtimeConnection(role, fullName) {
    // Rol ve kullanıcı adına göre benzersiz bir ID oluştur
    const userId = `${rolePrefix[role]}_${fullName.replace(/\s+/g, '_').toLowerCase()}`;

    // Daha önce açık kanalları kapat
    if (channel) {
        try {
            channel.unsubscribe();
        } catch (err) {
            console.log('Kanal kapatma hatası (önemsiz):', err);
        }
    }

    console.log('Supabase Realtime bağlantısı başlatılıyor...');

    // Realtime kanalına bağlan
    try {
        channel = supabase
            .channel('restaurant-app')
            .on('broadcast', { event: 'restaurant-updates' }, (payload) => {
                console.log('Broadcast alındı:', payload);
                handleIncomingData(payload.payload, payload.payload.sender);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Supabase Realtime kanalına bağlandı');

                    // Başlangıç bilgilerini yayınla
                    broadcastData({
                        type: 'initial-connect',
                        userId: userId,
                        role: role,
                        fullName: fullName,
                        sender: userId
                    });

                    // Verileri yükle
                    loadTablesFromSupabase();
                    loadOrdersFromSupabase();
                    loadMenuItemsFromSupabase();
                    
                    // Garson rolü için çağrıları yükle
                    if (role === 'waiter') {
                        loadWaiterCalls();
                    }

                } else if (status === 'CHANNEL_ERROR') {
                    console.log('Kanal bağlantı hatası - yeniden deneniyor...');
                    // Hata durumunda sessizce yeniden dene - kullanıcıya mesaj gösterme
                    setTimeout(() => {
                        initRealtimeConnection(role, fullName);
                    }, 5000);
                }
            });
    } catch (err) {
        console.error('Kanal oluşturma hatası:', err);
    }

    // Veritabanı değişikliklerini dinleyen tüm kanalları tekli bir kanalda birleştir
    try {
        console.log('Veritabanı değişikliklerini izleme başlatılıyor...', role, fullName);

        // Önceki dbChangesChannel'ı temizle
        try {
            const allChannels = supabase.getChannels();
            if (allChannels && allChannels.length > 0) {
                allChannels.forEach(channel => {
                    if (channel.topic === 'realtime:db-changes') {
                        supabase.removeChannel(channel);
                    }
                });
                console.log('Eski veritabanı izleme kanalı temizlendi');
            }
        } catch (err) {
            console.error('Eski kanal temizlenirken hata:', err);
        }

        const dbChangesChannel = supabase
            .channel('db-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'masalar'
            }, (payload) => {
                console.log('Masa değişikliği algılandı:', payload);
                handleTableChange(payload);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'siparisler'
            }, (payload) => {
                console.log('Sipariş durumu değişti:', payload);
                handleOrderChange(payload);
                
                // QR sipariş algılandığında garson ekranında göster
                if (payload.eventType === 'INSERT' || 
                    (payload.eventType === 'UPDATE' && payload.new.musteri_siparis === true && 
                    (payload.new.durum === 'qr_siparis' || payload.new.durum === 'beklemede'))) {
                    
                    if (appState.currentUser && appState.currentUser.role === 'waiter') {
                        // QR Sipariş bildirimi
                        const tableNumber = payload.new.masa_no;
                        const message = `Masa ${tableNumber} QR sipariş oluşturdu`;
                        
                        // Bildirim ekle
                        addNotification(message);
                        
                        // Ses çal
                        if (elements.newOrderSound) {
                            elements.newOrderSound.play().catch(err => console.log('Ses çalma hatası:', err));
                        }
                        
                        // Toast mesajı göster
                        showToast(message);
                        
                        // Siparişi yükle
                        fetchOrderDetails(payload.new.id);
                        
                        // Masa durumunu güncelle
                        const table = appState.tables.find(t => t.number === tableNumber);
                        if (table) {
                            if (payload.new.durum === 'qr_siparis') {
                                table.status = 'qr_order';
                            } else {
                                table.status = 'active';
                            }
                            refreshUI();
                        }
                    }
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'siparis_kalemleri'
            }, (payload) => {
                console.log('Sipariş kalemi değişikliği algılandı:', payload);
                handleOrderItemChange(payload);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'odemeler'
            }, (payload) => {
                console.log('Ödeme değişikliği algılandı:', payload);
                handlePaymentChange(payload);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'waiter_calls'
            }, (payload) => {
                console.log('Garson çağrısı algılandı:', payload);
                handleWaiterCallChange(payload);
                
                // Yeni garson çağrısı geldiğinde ses çal
                if (payload.eventType === 'INSERT' && appState.currentUser && appState.currentUser.role === 'waiter') {
                    // Ses çal
                    if (elements.newCallSound) {
                        elements.newCallSound.play().catch(err => console.log('Ses çalma hatası:', err));
                    }
                    
                    // Masayı işaretle
                    const tableNumber = payload.new.table_number;
                    const table = appState.tables.find(t => t.number === tableNumber);
                    if (table) {
                        table.hasWaiterCall = true;
                        table.status = 'call';
                        refreshUI();
                    }
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Veritabanı değişikliklerini izleme başlatıldı');
                    showToast('Gerçek zamanlı bağlantı kuruldu');
                } else {
                    console.error('Veritabanı izleme kanalı bağlantı hatası:', status);
                }
            });
    } catch (err) {
        console.error('Veritabanı izleme kanalı oluşturma hatası:', err);
        showToast('Gerçek zamanlı bağlantı kurulamadı, lütfen sayfayı yenileyin');
    }

    // Çevrimdışı/Çevrimiçi durumunu yönet
    window.addEventListener('online', () => {
        console.log('Ağ bağlantısı geri geldi, yeniden bağlanılıyor...');
        // Sessizce yeniden bağlan - kullanıcıya mesaj gösterme
        initRealtimeConnection(role, fullName);
    });

    window.addEventListener('offline', () => {
        console.log('Ağ bağlantısı kesildi');
        // Kullanıcıya çevrimdışı olduğunu bildiren bir toast göster, ama sürekli değil
        if (!window._shownOfflineToast) {
            window._shownOfflineToast = true;
            showToast('Çevrimdışı moda geçildi. Bağlantı sağlandığında veriler otomatik senkronize edilecek.');

            // 1 dakika sonra tekrar toast göstermeye izin ver
            setTimeout(() => {
                window._shownOfflineToast = false;
            }, 60000);
        }
    });
}

// Masa değişikliklerini işle
function handleTableChange(payload) {
    console.log('Masa değişikliği işleniyor:', payload);

    // Değişen masa bilgisini uygulama durumuna aktar
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const table = payload.new;

        // Uygulama formatına dönüştür
        const updatedTable = {
            id: table.id,
            number: table.masa_no,
            status: convertStatusFromDb(table.durum),
            waiterId: table.waiter_id,
            waiterName: table.waiter_name,
            orderId: table.siparis_id || null
        };

        console.log('Masa güncelleniyor:', updatedTable);

        // Tabloyu uygulama durumunda güncelle
        updateTableFromRealtime(updatedTable);

        // UI yenile
        refreshUI();

        // Duruma göre bildirim gönder
        if (table.durum === 'hazır' && appState.currentUser.role === 'waiter') {
            addNotification(`Masa ${table.masa_no} siparişi hazır`);
            elements.orderReadySound.play();
        }

        // Sistemdeki diğer masa bağlantılı siparişleri kontrol et ve güncelle
        if (appState.currentUser.role === 'waiter' || appState.currentUser.role === 'kitchen') {
            // Masa durumu değiştiğinde ilgili siparişi bul ve güncelle
            if (table.siparis_id) {
                // Sipariş ID'si varsa direkt o siparişi güncelle
                fetchOrderDetails(table.siparis_id);
            } else {
                // Sipariş ID'si yoksa masa numarasına göre siparişi bul
                const associatedOrder = appState.orders.find(o => o.tableNumber === table.masa_no);
            if (associatedOrder) {
                fetchOrderDetails(associatedOrder.id);
                }
            }
        }
    }
}

// Sipariş değişikliklerini işle
function handleOrderChange(payload) {
    console.log('Sipariş değişikliği işleniyor:', payload);

    // Değişen sipariş bilgisini uygulama durumuna aktar
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const order = payload.new;

        console.log('Sipariş verisi:', order);

        // Siparişi güncellemek için tam sipariş bilgilerini al
        fetchOrderDetails(order.id);

        // İlgili masayı da güncelle
        if (order.masa_no) {
            fetchTableDetails(order.masa_no);

            // Sipariş durumuna göre masa durumunu güncelle
            updateTableStatusFromOrder(order.masa_no, order.durum);
        }

        // Bildirimleri oluştur
        if (order.durum === 'beklemede' && appState.currentUser.role === 'kitchen') {
            // Yeni sipariş
            addNotification(`Yeni sipariş: Masa ${order.masa_no}`);
            elements.newOrderSound.play();
        } else if (order.durum === 'tamamlandi' && appState.currentUser.role === 'waiter') {
            // Sipariş hazır
            addNotification(`Sipariş hazır: Masa ${order.masa_no}`);
            elements.orderReadySound.play();
        } else if (order.durum === 'hazirlaniyor' && appState.currentUser.role === 'waiter') {
            // Sipariş hazırlanıyor
            addNotification(`Sipariş hazırlanıyor: Masa ${order.masa_no}`);
        }

        // QR sipariş durumu kontrolü - özellikle INSERT olayında kontrol et
        if (order.durum === 'qr_siparis' || order.durum === 'qr_order') {
            // Masa durumunu QR sipariş olarak güncelle
            const tableIndex = appState.tables.findIndex(t => t.number === order.masa_no);
            if (tableIndex !== -1) {
                appState.tables[tableIndex].status = 'qr_order';
                console.log(`Masa ${order.masa_no} durumu QR sipariş olarak güncellendi`);
            }

            // Garson rolündeyse bildirim göster
            if (appState.currentUser.role === 'waiter') {
                addNotification(`QR Sipariş: Masa ${order.masa_no}`);
                elements.newOrderSound.play();
                showToast(`QR Sipariş: Masa ${order.masa_no}`);
            }

            // UI'ı güncelle
            refreshUI();
        }
    }
}

// Sipariş durumuna göre masa durumunu güncelle
async function updateTableStatusFromOrder(tableNumber, orderStatus) {
    // Sipariş durumuna göre masa durumunu belirle
    let tableDurum = '';

    switch(orderStatus) {
        case 'beklemede':
            tableDurum = 'dolu';
            break;
        case 'tamamlandi':
            tableDurum = 'hazır';
            break;
        case 'teslim_edildi':
            tableDurum = 'teslim_edildi';
            break;
        case 'servis_edildi':
            tableDurum = 'payment';
            break;
        case 'qr_siparis':
        case 'qr_order':
            tableDurum = 'qr_siparis';
            break;
        default:
            return; // Diğer durumlar için güncelleme yapma
    }

    try {
        // Masa durumunu güncelle
        console.log(`Masa ${tableNumber} durumu güncelleniyor: ${tableDurum}`);
        const { error } = await supabase
            .from('masalar')
            .update({ durum: tableDurum })
            .eq('masa_no', tableNumber);

        if (error) {
            console.error('Masa durumu güncellenirken hata:', error);

            // Alternatif olarak tables tablosunda da deneyelim
            try {
                const statusMap = {
                    'qr_siparis': 'qr_order',
                    'dolu': 'occupied',
                    'hazır': 'ready',
                    'teslim_edildi': 'delivered',
                    'payment': 'payment'
                };

                const englishStatus = statusMap[tableDurum] || tableDurum;

                const { error: tableError } = await supabase
                    .from('tables')
                    .update({ status: englishStatus })
                    .eq('number', tableNumber);

                if (!tableError) {
                    console.log(`Table ${tableNumber} status updated: ${englishStatus}`);
                }
            } catch (err) {
                console.error('Tables tablosunda masa güncellenirken hata:', err);
            }

            return;
        }

        console.log(`Masa ${tableNumber} durumu başarıyla güncellendi: ${tableDurum}`);

        // Uygulama durumunu da güncelle
        const tableIndex = appState.tables.findIndex(t => t.number === tableNumber);
        if (tableIndex !== -1) {
            const newStatus = convertStatusFromDb(tableDurum);
            appState.tables[tableIndex].status = newStatus;
            console.log(`Masa ${tableNumber} durumu uygulamada güncellendi: ${newStatus}`);

            // UI'ı güncelle
            refreshUI();
        }
    } catch (err) {
        console.error('Masa durumu güncelleme hatası:', err);
    }
}

// Sipariş kalemlerindeki değişiklikleri işle
function handleOrderItemChange(payload) {
    console.log('Sipariş kalemi değişikliği:', payload);

    // Sipariş kalemindeki değişikliğe göre siparişi güncelle
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const orderItem = payload.new;

        // İlgili siparişin tam bilgilerini al
        fetchOrderDetails(orderItem.siparis_id);
    }
}

// Ödeme değişikliklerini işle
function handlePaymentChange(payload) {
    console.log('Ödeme değişikliği:', payload);

    // Yeni ödeme eklendiğinde bildirimlere ekle
    if (payload.eventType === 'INSERT') {
        const payment = payload.new;

        if (appState.currentUser.role === 'waiter' || appState.currentUser.role === 'kitchen') {
            addNotification(`Masa ${payment.masa_no} ödemesi tamamlandı`);
            elements.paymentCompleteSound?.play();
        }

        // İlgili masayı güncelle
        fetchTableDetails(payment.masa_no);

        // İlgili siparişi bul ve durumunu güncelle
        const order = appState.orders.find(o => o.id === payment.siparis_id);
        if (order) {
            order.status = 'completed';

            // Tüm cihazlara sipariş güncellemesini gönder
            broadcastData({
                type: 'order-update',
                order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

            // UI yenile
            refreshUI();
        }
    }
}

// Garson çağrılarındaki değişiklikleri işle
function handleWaiterCallChange(payload) {
    console.log('Garson çağrısı değişikliği:', payload);
    
    // Yeni bir çağrı eklendiğinde veya güncellendiğinde
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const call = payload.new;
        
        // Garson rolüne sahip kullanıcılar için bildirim ekle
        if (appState.currentUser && appState.currentUser.role === 'waiter') {
            // Masa numarasını ve çağrı zamanını al
            const tableNumber = call.table_number;
            const callTime = new Date(call.created_at);
            const timeString = callTime.getHours().toString().padStart(2, '0') + ':' + callTime.getMinutes().toString().padStart(2, '0');
            
            // Sadece bekleyen çağrılar için bildirim göster
            if (call.status === 'waiting') {
                // Bildirim oluştur
                const message = `Masa ${tableNumber} garson çağırıyor`;
                addNotification(message);
                
                // Ses çal
                if (elements.newCallSound) {
                    elements.newCallSound.play().catch(err => console.log('Ses çalma hatası:', err));
                } else if (elements.notificationSound) {
                    elements.notificationSound.play().catch(err => console.log('Ses çalma hatası:', err));
                }
                
                // Toast mesajı göster
                showToast(message);
                
                // Garson ekranını yenile
                loadWaiterCalls();
                
                // Masayı kırmızı olarak işaretle (çağrı durumu)
                const table = appState.tables.find(t => t.number === tableNumber);
                if (table) {
                    table.hasWaiterCall = true;
                    table.status = 'call';
                    refreshUI();
                }
            }
        }
    } else if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && payload.new.status === 'responded')) {
        // Çağrı yanıtlandığında veya silindiğinde
        const tableNumber = payload.old.table_number;
        
        // Masanın çağrı durumunu kaldır
        const table = appState.tables.find(t => t.number === tableNumber);
        if (table) {
            table.hasWaiterCall = false;
            
            // Eğer masa durumu çağrı ise, aktif olarak güncelle
            if (table.status === 'call') {
                table.status = 'active';
            }
            
            refreshUI();
        }
    }
}

// Garson çağrılarını yükle
async function loadWaiterCalls() {
    try {
        const { data: calls, error } = await supabase
            .from('waiter_calls')
            .select('*')
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (error) {
            console.error('Garson çağrıları yüklenirken hata:', error);
            return;
        }
        
        // Aktif çağrıları işaretle
        if (calls && calls.length > 0) {
            console.log('Aktif garson çağrıları bulundu:', calls.length);
            
            // Her bir aktif çağrı için masayı işaretle
            calls.forEach(call => {
                const table = appState.tables.find(t => t.number === call.table_number);
                if (table) {
                    table.hasWaiterCall = true;
                    // Masa durumunu çağrı olarak güncelle
                    table.status = 'call';
                }
            });
            
            // UI'ı yenile
            refreshUI();
            
            // Bildirim göster
            if (appState.currentUser && appState.currentUser.role === 'waiter' && !window._shownCallNotification) {
                window._shownCallNotification = true;
                showToast(`${calls.length} aktif garson çağrısı var`);
                
                // Ses çal (sadece bir kere)
                if (elements.newCallSound) {
                    elements.newCallSound.play().catch(err => console.log('Ses çalma hatası:', err));
                }
                
                // 30 saniye sonra tekrar bildirim göstermeye izin ver
                setTimeout(() => {
                    window._shownCallNotification = false;
                }, 30000);
            }
        }
    } catch (err) {
        console.error('Garson çağrıları yüklenirken hata:', err);
    }
}

// Garson çağrısına yanıt ver
async function respondToCall(callId, tableNumber, callTime) {
    try {
        // Çağrı durumunu güncelle
        const { error } = await supabase
            .from('waiter_calls')
            .update({ 
                status: 'responded',
                responded_at: new Date().toISOString(),
                responded_by: appState.currentUser.fullName,
                note: 'Garson geliyor'
            })
            .eq('id', callId);
            
        if (error) {
            console.error('Çağrı yanıtlanırken hata:', error);
            showToast('Çağrı yanıtlanırken bir hata oluştu');
            return;
        }
        
        // Masa durumunu güncelle
        await updateTableStatus(tableNumber, 'active');
        
        // İlgili masanın çağrı durumunu kaldır
        const table = appState.tables.find(t => t.number === parseInt(tableNumber));
        if (table) {
            table.hasWaiterCall = false;
            table.status = 'active';
            refreshUI();
        }
        
        // Gerçek zamanlı bildirim gönder
        await supabase.channel('restaurant-app').send({
            type: 'broadcast',
            event: 'restaurant-updates',
            payload: {
                type: 'waiter-response',
                tableNumber: tableNumber,
                message: `Masa ${tableNumber} çağrısına yanıt verildi`,
                waiterName: appState.currentUser.fullName,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            }
        });
        
        // Bildirimleri yenile
        showToast(`Masa ${tableNumber} çağrısına yanıt verildi`);
        
        // Çağrı listesini yenile
        loadWaiterCalls();
    } catch (err) {
        console.error('Çağrı yanıtlanırken hata:', err);
        showToast('Çağrı yanıtlanırken bir hata oluştu');
    }
}

// Masa durumunu güncelle
async function updateTableStatus(tableNumber, status) {
    try {
        const { error } = await supabase
            .from('masalar')
            .update({ durum: convertStatusToDb(status) })
            .eq('masa_no', tableNumber);
            
        if (error) {
            console.error('Masa durumu güncellenirken hata:', error);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Masa durumu güncellenirken hata:', err);
        return false;
    }
}

// Siparişin detaylarını getir
async function fetchOrderDetails(orderId) {
    try {
        const { data: orderData, error: orderError } = await supabase
            .from('siparisler')
            .select(`
                *,
                siparis_kalemleri(*)
            `)
            .eq('id', orderId)
            .single();

        if (orderError) {
            console.error('Sipariş detayları alınırken hata:', orderError);
            return;
        }

        if (orderData) {
            const now = new Date(orderData.created_at);
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            const dateString = now.getDate().toString().padStart(2, '0') + '.' + (now.getMonth() + 1).toString().padStart(2, '0') + '.' + now.getFullYear();

            // Sipariş kalemlerini düzenle
            const items = orderData.siparis_kalemleri ? orderData.siparis_kalemleri.map(item => ({
                id: item.urun_id,
                name: item.urun_adi,
                price: parseFloat(item.birim_fiyat),
                quantity: item.miktar,
                category: 'mains', // Varsayılan kategori
                total: parseFloat(item.toplam_fiyat)
            })) : [];

            // Siparişi uygulama formatına dönüştür
            const updatedOrder = {
                id: orderData.id,
                tableId: orderData.masa_id,
                tableNumber: orderData.masa_no,
                status: convertStatusFromDb(orderData.durum),
                items: items,
                note: orderData.siparis_notu || '',
                waiter: orderData.waiter_name,
                time: timeString,
                date: dateString,
                total: parseFloat(orderData.toplam_fiyat),
                musteri_siparis: orderData.musteri_siparis || false
            };

            // Siparişi uygulama durumunda güncelle
            updateOrderFromRealtime(updatedOrder);

            // UI yenile
            refreshUI();

            // Duruma göre bildirimler
            if (orderData.durum === 'beklemede' && appState.currentUser.role === 'kitchen') {
                // Yeni sipariş
                addNotification(`Yeni sipariş: Masa ${orderData.masa_no}`);
            } else if (orderData.durum === 'tamamlandi' && appState.currentUser.role === 'waiter') {
                // Sipariş hazır
                addNotification(`Sipariş hazır: Masa ${orderData.masa_no}`);
            }
        }
    } catch (err) {
        console.error('Sipariş detayları alınırken hata:', err);
    }
}

// Masa detaylarını getir
async function fetchTableDetails(tableNumber) {
    try {
        const { data: tableData, error: tableError } = await supabase
            .from('masalar')
            .select('*')
            .eq('masa_no', tableNumber)
            .single();

        if (tableError) {
            console.error('Masa detayları alınırken hata:', tableError);
            return;
        }

        if (tableData) {
            // Masayı uygulama formatına dönüştür
            const updatedTable = {
                id: tableData.id,
                number: tableData.masa_no,
                status: convertStatusFromDb(tableData.durum),
                waiterId: tableData.waiter_id,
                waiterName: tableData.waiter_name,
                orderId: tableData.siparis_id || null
            };

            // Masayı uygulama durumunda güncelle
            updateTableFromRealtime(updatedTable);

            // UI yenile
            refreshUI();
        }
    } catch (err) {
        console.error('Masa detayları alınırken hata:', err);
    }
}

// Gelen veriyi işle
function handleIncomingData(data, senderId) {
    // Eğer veri kendimizden geliyorsa işleme
    if (data.sender === `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`) {
        return;
    }

    console.log('Gelen gerçek zamanlı veri:', data);

    switch (data.type) {
        case 'initial-connect':
            // Yeni bağlanan kullanıcıya güncel durumu gönder
            if (appState.currentUser) {
                const userId = `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`;

                // Masalar ve siparişler için gerçek zamanlı veri gönder
                setTimeout(() => {
                    broadcastData({
                        type: 'app-state',
                        tables: appState.tables,
                        orders: appState.orders,
                        menuItems: MENU_ITEMS,
                        sender: userId
                    });
                }, 1000);
            }
            break;

        case 'app-state':
            // Başka bir kullanıcıdan gelen uygulama durumunu güncelle
            console.log('Güncel app-state alındı:', data);
            mergeAppState(data);
            refreshUI();
            break;

        case 'order-update':
            // Başka bir kullanıcıdan gelen sipariş güncellemesini işle
            console.log('Sipariş güncellemesi alındı:', data.order);
            updateOrderFromRealtime(data.order);

            // Yeni sipariş ise mutfak ve kasiyer rollerine bildirim ekle
            if (data.order.status === 'new' && (appState.currentUser.role === 'kitchen' || appState.currentUser.role === 'cashier')) {
                addNotification(`Yeni sipariş: Masa ${data.order.tableNumber}`);
                elements.newOrderSound.play();
                showToast(`Yeni sipariş: Masa ${data.order.tableNumber}`);
            }

            refreshUI();
            break;

        case 'table-update':
            // Başka bir kullanıcıdan gelen masa güncellemesini işle
            console.log('Masa güncellemesi alındı:', data.table);
            updateTableFromRealtime(data.table);
            refreshUI();
            break;

        case 'product-update':
            // Başka bir kullanıcıdan gelen ürün güncellemesini işle
            console.log('Ürün güncellemesi alındı:', data);

            if (data.action === 'add' || data.action === 'update') {
                // Kategori kontrol et
                const category = data.product.category;
                if (MENU_ITEMS[category]) {
                    // Varolan ürünü güncelle veya yeni ürün ekle
                    const index = MENU_ITEMS[category].findIndex(item => item.id === data.product.id);

                    if (index !== -1) {
                        MENU_ITEMS[category][index] = data.product;
                    } else {
                        MENU_ITEMS[category].push(data.product);
                    }

                    // Şu anda ürün listesi görüntüleniyorsa yenile
                    if (appState.currentUser.role === 'cashier' && !elements.productManagementScreen.classList.contains('hidden')) {
                        renderProducts(category);
                    }

                    addNotification(`Ürün ${data.action === 'add' ? 'eklendi' : 'güncellendi'}: ${data.product.name}`);
                }
            } else if (data.action === 'delete') {
                // Ürünü sil
                const category = data.product.category;
                if (MENU_ITEMS[category]) {
                    const index = MENU_ITEMS[category].findIndex(item => item.id === data.product.id);

                    if (index !== -1) {
                        MENU_ITEMS[category].splice(index, 1);

                        // Şu anda ürün listesi görüntüleniyorsa yenile
                        if (appState.currentUser.role === 'cashier' && !elements.productManagementScreen.classList.contains('hidden')) {
                            renderProducts(category);
                        }

                        addNotification(`Ürün silindi: ${data.product.name}`);
                    }
                }
            }
            break;

        case 'category-update':
            // Başka bir kullanıcıdan gelen kategori güncellemesini işle
            console.log('Kategori güncellemesi alındı:', data);

            if (data.action === 'add') {
                // Kategori kontrol et
                const categoryCode = data.category.code;
                if (!MENU_ITEMS[categoryCode]) {
                    // Yeni kategori ekle
                    MENU_ITEMS[categoryCode] = [];

                    // Kategori butonlarını güncelle
                    updateCategoryButtons();

                    addNotification(`Yeni kategori eklendi: ${data.category.name}`);
                }
            } else if (data.action === 'update') {
                // Kategori güncelleme işlemleri
                // Gerçek durumda buraya kod eklenebilir
                refreshUI();
            } else if (data.action === 'delete') {
                // Kategori silme işlemleri
                const categoryCode = data.category.code;
                if (MENU_ITEMS[categoryCode]) {
                    delete MENU_ITEMS[categoryCode];

                    // Kategori butonlarını güncelle
                    updateCategoryButtons();

                    addNotification(`Kategori silindi: ${data.category.name}`);
                }
            }
            break;

        case 'notification':
            // Başka bir kullanıcıdan gelen bildirimi işle
            addNotification(data.message);
            break;

        default:
            console.log('Bilinmeyen veri tipi:', data.type);
    }
}

// Uygulama durumunu birleştir
function mergeAppState(data) {
    if (data.tables) {
        appState.tables = data.tables;
    }

    if (data.orders) {
        appState.orders = data.orders;
    }

    if (data.menuItems) {
        // Menü öğelerini birleştir
        for (const category in data.menuItems) {
            if (MENU_ITEMS[category]) {
                MENU_ITEMS[category] = data.menuItems[category];
            }
        }
    }
}

// Siparişi gerçek zamanlı güncellemeden güncelle
function updateOrderFromRealtime(order) {
    const existingOrderIndex = appState.orders.findIndex(o => o.id === order.id);

    if (existingOrderIndex !== -1) {
        appState.orders[existingOrderIndex] = order;
    } else {
        appState.orders.push(order);
    }

    // Bildirim sesi çal
    if (order.status === 'new' && appState.currentUser.role === 'kitchen') {
        elements.newOrderSound.play();
        addNotification(`Yeni sipariş: Masa ${order.tableNumber}`);

        // Kapasitör bildirimi gönder (mobil cihazlar için)
        if (window.Capacitor && Capacitor.isPluginAvailable('LocalNotifications')) {
            sendCapacitorNotification(
                'Yeni Sipariş',
                `Masa ${order.tableNumber} için yeni sipariş`
            );
        }
    } else if (order.status === 'ready' && appState.currentUser.role === 'waiter') {
        elements.orderReadySound.play();
        addNotification(`Sipariş hazır: Masa ${order.tableNumber}`);

        // Kapasitör bildirimi gönder (mobil cihazlar için)
        if (window.Capacitor && Capacitor.isPluginAvailable('LocalNotifications')) {
            sendCapacitorNotification(
                'Sipariş Hazır',
                `Masa ${order.tableNumber} siparişi hazır`
            );
        }
    } else if (order.status === 'delivered' && (appState.currentUser.role === 'kitchen' || appState.currentUser.role === 'waiter')) {
        elements.orderDeliveredSound.play();
        addNotification(`Sipariş teslim edildi: Masa ${order.tableNumber}`);
    } else if (order.status === 'served' && appState.currentUser.role === 'cashier') {
        elements.orderServedSound.play();
        addNotification(`Sipariş servis edildi: Masa ${order.tableNumber}`);
    } else if (order.status === 'completed' && (appState.currentUser.role === 'waiter' || appState.currentUser.role === 'kitchen')) {
        elements.paymentCompleteSound.play();
        addNotification(`Ödeme tamamlandı: Masa ${order.tableNumber}`);
    }
}

// Masayı gerçek zamanlı güncellemeden güncelle
function updateTableFromRealtime(table) {
    const existingTableIndex = appState.tables.findIndex(t => t.id === table.id);

    if (existingTableIndex !== -1) {
        appState.tables[existingTableIndex] = table;
    }
}

// Veriyi yayınla
function broadcastData(data) {
    try {
        if (!channel) {
            console.error('Kanal henüz hazır değil, veri gönderilemedi');
            return;
        }

        // Gönderen kimliğini ekle (eğer yoksa)
        if (!data.sender && appState.currentUser) {
            const userId = `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`;
            data.sender = userId;
        }

        console.log('Gerçek zamanlı veri gönderiliyor:', data);

        // Veriyi Supabase Realtime üzerinden yayınla
        channel.send({
            type: 'broadcast',
            event: 'restaurant-updates',
            payload: data
        })
        .then(() => {
            console.log('Veri başarıyla gönderildi');
        })
        .catch(err => {
            console.error('Veri gönderilirken hata:', err);
            // Geçici gecikme ile yeniden dene
            setTimeout(() => {
                console.log('Veri yeniden gönderiliyor...');
                channel.send({
                    type: 'broadcast',
                    event: 'restaurant-updates',
                    payload: data
                });
            }, 2000);
        });
    } catch (err) {
        console.error('Veri yayınlanırken hata:', err);
    }
}

// Arayüzü yenile
function refreshUI() {
    // Kullanıcı rolüne göre ekranı güncelle
    if (appState.currentUser) {
        switch (appState.currentUser.role) {
            case 'waiter':
                renderTables();
                loadWaiterCalls(); // Garson çağrılarını yenile
                break;
            case 'kitchen':
                renderKitchenOrders();
                break;
            case 'cashier':
                renderCashierTables();
                break;
        }
    }

    // Bildirim rozetini güncelle
    updateNotificationBadge();
}

// Çıkış yap
function logout() {
    // Supabase kanalı kapat
    if (channel) {
        channel.unsubscribe();
    }

    // Kullanıcı bilgilerini temizle
    localStorage.removeItem('user');
    appState.currentUser = null;

    // Giriş ekranını göster
    elements.loginScreen.classList.remove('hidden');
    elements.appContainer.classList.add('hidden');

    // Form alanlarını temizle
    elements.username.value = '';
    elements.password.value = '';
    elements.loginError.textContent = '';
    elements.loginError.classList.add('hidden');
}

// Giriş hatası göster
function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.classList.remove('hidden');

    setTimeout(() => {
        elements.loginError.classList.add('hidden');
    }, 3000);
}

// Ana uygulama arayüzünü göster
function showAppInterface() {
    elements.loginScreen.classList.add('hidden');
    elements.appContainer.classList.remove('hidden');

    // Rolüne göre uygun ekranı göster
    const role = appState.currentUser.role;

    if (role === 'waiter') {
        showWaiterScreen();
    } else if (role === 'kitchen') {
        showKitchenScreen();
    } else if (role === 'cashier') {
        showCashierScreen();
    }
}

// Ekranları göster/gizle
function showWaiterScreen() {
    elements.waiterScreen.classList.remove('hidden');
    elements.kitchenScreen.classList.add('hidden');
    elements.cashierScreen.classList.add('hidden');
    
    // Garson çağrılarını yükle
    loadWaiterCalls();
    
    // Aktif çağrıları kontrol et
    checkActiveWaiterCalls();
    
    // Masaları yenile
    renderTables();
}

function showKitchenScreen() {
    elements.waiterScreen.classList.add('hidden');
    elements.kitchenScreen.classList.remove('hidden');
    elements.cashierScreen.classList.add('hidden');

    // Mutfak siparişlerini yükle
    renderKitchenOrders();
}

function showCashierScreen() {
    elements.waiterScreen.classList.add('hidden');
    elements.kitchenScreen.classList.add('hidden');
    elements.cashierScreen.classList.remove('hidden');

    // Kasiyer masalarını yükle
    renderCashierTables();
}

// Olay dinleyicileri kurulumu
function setupEventListeners() {
    // Giriş ve çıkış
    elements.loginButton.addEventListener('click', login);
    elements.logoutButton.addEventListener('click', logout);

    // Enter ile giriş yapabilme
    elements.password.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            login();
        }
    });

    // Garson ekranı
    elements.refreshTablesButton.addEventListener('click', renderTables);

    // Mutfak ekranı
    elements.refreshKitchenButton.addEventListener('click', renderKitchenOrders);

    // Kasiyer ekranı
    elements.refreshCashierButton.addEventListener('click', renderCashierTables);

    // Sipariş ekranı
    elements.backToTablesButton.addEventListener('click', () => {
        hideOrderScreen();
        showWaiterScreen();
    });

    // Kategori butonları
    elements.categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            // Aktif kategori butonunu güncelle
            elements.categoryButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('bg-primary', 'text-white');
                    btn.classList.remove('bg-gray-200', 'text-gray-700');
                } else {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                }
            });

            // Menü öğelerini güncelle
            renderMenuItems(category);
        });
    });

    elements.submitOrderButton.addEventListener('click', submitOrder);

    // Sipariş detay ekranı
    elements.backFromDetailButton.addEventListener('click', () => {
        hideOrderDetailScreen();

        // Rolüne göre geri dön
        const role = appState.currentUser.role;
        if (role === 'waiter') {
            showWaiterScreen();
        } else if (role === 'kitchen') {
            showKitchenScreen();
        } else if (role === 'cashier') {
            showCashierScreen();
        }
    });

    // Ödeme ekranı
    elements.backFromPaymentButton.addEventListener('click', () => {
        hidePaymentScreen();
        showCashierScreen();
    });

    elements.cashPayment.addEventListener('click', () => {
        elements.cashPayment.classList.add('border-primary');
        elements.cardPayment.classList.remove('border-primary');
    });

    elements.cardPayment.addEventListener('click', () => {
        elements.cardPayment.classList.add('border-primary');
        elements.cashPayment.classList.remove('border-primary');
    });

    elements.completePaymentButton.addEventListener('click', async () => {
        try {
            const tableNumber = parseInt(elements.paymentTitle.textContent.replace('Ödeme - Masa ', ''));

            // Masa bilgisini bul
            const table = appState.tables.find(t => t.number === tableNumber);
            if (!table) {
                showToast('Masa bilgisi bulunamadı');
                return;
            }

            // Sipariş bilgisini bul
            const order = appState.orders.find(o => o.tableNumber === tableNumber &&
                (o.status === 'served' || o.status === 'delivered'));
            if (!order) {
                showToast('Sipariş bilgisi bulunamadı');
                return;
            }

            // Ödeme yöntemi seç
            const paymentMethod = elements.cashPayment.checked ? 'nakit' : 'kredi_karti';

            await completePayment(order.id, table.id);

            // Kasiyer ekranına geri dön
            hidePaymentScreen();
            showCashierScreen();

            showToast('Ödeme başarıyla tamamlandı');
        } catch (err) {
            console.error('Ödeme işlemi hatası:', err);
            showToast('Ödeme işlemi sırasında bir hata oluştu');
        }
    });

    // Bildirimler
    elements.notificationButton.addEventListener('click', toggleNotificationPanel);

    // Ürün Yönetimi
    elements.productManagementButton.addEventListener('click', () => {
        showProductManagementScreen();
    });

    elements.backFromProductManagementButton.addEventListener('click', () => {
        hideProductManagementScreen();
        showCashierScreen();
    });

    elements.productCategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            // Aktif kategori butonunu güncelle
            elements.productCategoryButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('bg-primary', 'text-white');
                    btn.classList.remove('bg-gray-200', 'text-gray-700');
                } else {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                }
            });

            // Ürünleri kategoriye göre listele
            renderProducts(category);
        });
    });

    elements.addNewProductButton.addEventListener('click', () => {
        showProductForm();
    });

    elements.cancelProductButton.addEventListener('click', () => {
        hideProductForm();
    });

    elements.saveProductButton.addEventListener('click', saveProduct);

    // Garson ekranı butonları
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            loadWaiterCalls();
            showToast('Çağrılar yenilendi');
        });
    }
}

// Render fonksiyonları
function renderTables() {
    const tableGrid = elements.tableGrid;
    tableGrid.innerHTML = '';

    appState.tables.forEach(table => {
        // Duruma göre arka plan rengi belirleme
        let bgColor = 'bg-white';
        let statusText = 'Bilinmiyor';
        let borderClass = '';

        // Garson çağrısı varsa border rengini değiştir
        if (table.hasWaiterCall) {
            borderClass = 'border-red-500 border-2';
        }

        // Duruma göre renk ve metin belirleme
        switch(table.status) {
            case 'empty':
                bgColor = 'bg-white';
                statusText = 'Boş';
                break;
            case 'active':
            case 'occupied':
            case 'dolu':
                bgColor = 'bg-blue-100';
                statusText = 'Aktif';
                break;
            case 'preparing':
            case 'hazirlaniyor':
                bgColor = 'bg-orange-100';
                statusText = 'Hazırlanıyor';
                break;
            case 'ready':
            case 'hazır':
                bgColor = 'bg-green-100';
                statusText = 'Hazır';
                break;
            case 'delivered':
            case 'teslim_edildi':
                bgColor = 'bg-yellow-100';
                statusText = 'Teslim Alındı';
                break;
            case 'served':
            case 'servis_edildi':
                bgColor = 'bg-purple-100';
                statusText = 'Servis Edildi';
                break;
            case 'payment':
                bgColor = 'bg-pink-100';
                statusText = 'Ödeme Bekliyor';
                break;
            case 'qr_order':
            case 'qr_siparis':
                bgColor = 'bg-gray-800 text-white';
                statusText = 'QR Sipariş';
                borderClass = 'border-black border-2';
                break;
            case 'call':
            case 'çağrı':
                bgColor = 'bg-red-100';
                statusText = 'Garson Çağırıyor';
                borderClass = 'border-red-500 border-2';
                break;
            default:
                // Eğer sipariş ID'si varsa aktif olarak işaretle
                if (table.orderId) {
                    bgColor = 'bg-blue-100';
                    statusText = 'Aktif';
                    table.status = 'active'; // Durum güncelleniyor
                } else {
                    bgColor = 'bg-white';
                    statusText = 'Boş';
                }
                break;
        }

        const tableCard = document.createElement('div');
        tableCard.className = `table-card ${bgColor} ${borderClass} rounded-lg border-2 p-4 flex flex-col items-center justify-center cursor-pointer table-${table.status}`;
        
        // Garson çağrısı varsa ikon ekle
        let statusIcon = '';
        if (table.hasWaiterCall) {
            statusIcon = '<i class="ri-user-voice-line text-red-500 text-xl mb-1 animate-pulse"></i>';
        } else if (table.status === 'qr_order' || table.status === 'qr_siparis') {
            statusIcon = '<div class="bg-black text-white text-xs px-2 py-1 rounded-full mb-1">QR</div>';
        }
        
        tableCard.innerHTML = `
            ${statusIcon}
            <div class="text-lg font-medium mb-1">Masa ${table.number}</div>
            <div class="text-xs ${table.status === 'qr_order' || table.status === 'qr_siparis' ? 'text-white' : 'text-gray-500'}">${statusText}</div>
        `;

        // Masa kart tıklama olayı
        tableCard.addEventListener('click', () => {
            appState.currentTable = table;

            // Masanın durumuna göre işlem yap
            if (table.status === 'empty') {
                showOrderScreen(table);
            } else {
                // İlgili siparişi bul
                const tableOrder = appState.orders.find(order =>
                    (order.tableNumber === table.number || order.id === table.orderId) &&
                    (order.status === 'new' || order.status === 'preparing' || order.status === 'ready' ||
                     order.status === 'delivered' || order.status === 'served' || order.status === 'qr_order')
                );

                if (tableOrder) {
                    showOrderDetailScreen(tableOrder);
                } else {
                    // Sipariş bulunamadıysa ve masa boş değilse durumu kontrol et
                    if (table.orderId) {
                        // Sipariş ID'si var ama sipariş bulunamadı, siparişi yükle
                        fetchOrderDetails(table.orderId);
                        showToast('Sipariş bilgileri yükleniyor...');
                    } else {
                        showOrderScreen(table);
                    }
                }
            }
        });

        tableGrid.appendChild(tableCard);
    });

    // Garson rolünde ise hazır siparişleri de göster
    if (appState.currentUser && appState.currentUser.role === 'waiter') {
        renderReadyOrders();
    }
}

function renderKitchenOrders() {
    const kitchenOrdersList = elements.kitchenOrdersList;
    kitchenOrdersList.innerHTML = '';

    // Aktif siparişleri filtrele
    const pendingOrders = appState.orders.filter(order =>
        order.status === 'new'
    );

    if (pendingOrders.length === 0) {
        kitchenOrdersList.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                Aktif sipariş yok
            </div>
        `;
        return;
    }

    // Siparişleri tarihe göre sırala (en yeniler üstte)
    pendingOrders.sort((a, b) => {
        const dateA = new Date(`${a.date.split('.').reverse().join('-')}T${a.time}`);
        const dateB = new Date(`${b.date.split('.').reverse().join('-')}T${b.time}`);
        return dateB - dateA;
    });

    pendingOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white rounded-lg border border-gray-200 p-4 mb-4';

        let statusBadge = '';
        if (order.status === 'new') {
            statusBadge = '<span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Yeni</span>';
        }

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="flex justify-between py-1 border-b border-gray-100">
                    <div class="flex">
                        <span class="font-medium mr-2">${item.quantity}x</span>
                        <span>${item.name}</span>
                    </div>
                    <span class="text-gray-600">${(item.price * item.quantity).toFixed(2)} ₺</span>
                </div>
            `;
        });

        orderElement.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-lg font-medium">Masa ${order.tableNumber}</h3>
                        ${statusBadge}
                    </div>
                    <p class="text-xs text-gray-500">Sipariş #${order.id} • ${order.time} • ${order.date}</p>
                    <p class="text-xs text-gray-500">Garson: ${order.waiter}</p>
                </div>
            </div>
            <div class="border-t border-gray-200 pt-2 mt-2">
                ${itemsHtml}
            </div>
            ${order.note ? `
                <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span class="font-medium">Not:</span> ${order.note}
                </div>
            ` : ''}
            <div class="mt-4 flex justify-end">
                    <button class="complete-order-button px-4 py-2 bg-green-500 text-white rounded-button" data-order-id="${order.id}">
                        Hazır
                    </button>
            </div>
        `;

        // Sipariş hazır butonu
        const completeButton = orderElement.querySelector('.complete-order-button');
        if (completeButton) {
            completeButton.addEventListener('click', () => {
                completeOrder(order.id);
            });
        }

        kitchenOrdersList.appendChild(orderElement);
    });
}

function renderCashierTables() {
    const cashierTablesList = elements.cashierTablesList;
    cashierTablesList.innerHTML = '';

    console.log('Kasiyer ekranı yenileniyor, tüm masalar:', appState.tables);

    // Ödeme bekleyen masaları göster
    const paymentTables = appState.tables.filter(table =>
        table.status === 'payment' ||
        table.status === 'served' ||
        table.status === 'servis_edildi');

    console.log('Ödeme bekleyen masalar:', paymentTables);

    if (paymentTables.length === 0) {
        cashierTablesList.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                Ödeme bekleyen masa yok
            </div>
        `;
        return;
    }

    // Masaları listele
    paymentTables.forEach(table => {
        // İlgili siparişi bul
        const tableOrder = appState.orders.find(order =>
            (order.tableNumber === table.number || order.id === table.orderId) &&
            (order.status === 'served' || order.status === 'delivered' || order.status === 'ready')
        );

        if (!tableOrder) {
            console.error(`Masa ${table.number} için sipariş bulunamadı!`);
            return;
        }

        const tableCard = document.createElement('div');
        tableCard.className = 'bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden';
        tableCard.innerHTML = `
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-medium">Masa ${table.number}</h3>
                    <p class="text-sm text-gray-500">Garson: ${tableOrder.waiter || 'Bilinmiyor'}</p>
            </div>
                <div class="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                    Ödeme Bekliyor
                </div>
            </div>
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-500">Toplam Tutar:</span>
                    <span class="font-medium">₺${tableOrder.totalAmount ? tableOrder.totalAmount.toFixed(2) : '0.00'}</span>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm text-gray-500">Sipariş Zamanı:</span>
                    <span>${tableOrder.date} ${tableOrder.time}</span>
                </div>
                <button class="w-full py-2 bg-primary text-white rounded-button view-order-button" data-order-id="${tableOrder.id}">
                    Siparişi Görüntüle
            </button>
            </div>
        `;

        const viewOrderButton = tableCard.querySelector('.view-order-button');
        if (viewOrderButton) {
            viewOrderButton.addEventListener('click', () => {
                showOrderDetailScreen(tableOrder);
        });
        }

        cashierTablesList.appendChild(tableCard);
    });
}

function renderMenuItems(category) {
    const menuItemsGrid = elements.menuItemsGrid;
    menuItemsGrid.innerHTML = '';

    const items = MENU_ITEMS[category] || [];

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden fade-in';
        // Ürün görseli için varsayılan veya ürün görseli
        const imageUrl = item.image_url || item.image || 'https://via.placeholder.com/80';

        itemCard.innerHTML = `
            <div class="p-3">
                <div class="flex items-center mb-2">
                    <img src="${imageUrl}" alt="${item.name}" class="w-10 h-10 rounded mr-3 object-cover">
                    <div>
                        <div class="font-medium">${item.name}</div>
                        <div class="text-sm text-gray-500">₺${item.price.toFixed(2)}</div>
                    </div>
                </div>
                <button class="add-to-cart w-full bg-primary text-white py-1 rounded-button text-sm">
                    Ekle
                </button>
            </div>
        `;

        const addButton = itemCard.querySelector('.add-to-cart');
        addButton.addEventListener('click', () => {
            addToCart(item);
        });

        menuItemsGrid.appendChild(itemCard);
    });
}

function renderOrderCart() {
    const orderCart = elements.orderCart;

    if (appState.currentOrder.items.length === 0) {
        orderCart.innerHTML = `
            <div class="p-4 text-center text-sm text-gray-500">
                Sepet boş
            </div>
        `;
        return;
    }

    orderCart.innerHTML = '';

    let totalAmount = 0;

    appState.currentOrder.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'p-3 flex justify-between items-center';
        cartItem.innerHTML = `
            <div class="flex items-center">
                <div class="font-medium">${item.name}</div>
                <div class="text-xs text-gray-500 ml-2">₺${item.price.toFixed(2)}</div>
            </div>
            <div class="flex items-center">
                <button class="decrease-quantity w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                    <i class="ri-subtract-line text-gray-600"></i>
                </button>
                <span class="mx-2 w-6 text-center">${item.quantity}</span>
                <button class="increase-quantity w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                    <i class="ri-add-line text-gray-600"></i>
                </button>
                <button class="remove-item ml-2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                    <i class="ri-delete-bin-line text-red-500"></i>
                </button>
            </div>
        `;

        const decreaseButton = cartItem.querySelector('.decrease-quantity');
        decreaseButton.addEventListener('click', () => {
            decreaseQuantity(item.id);
        });

        const increaseButton = cartItem.querySelector('.increase-quantity');
        increaseButton.addEventListener('click', () => {
            increaseQuantity(item.id);
        });

        const removeButton = cartItem.querySelector('.remove-item');
        removeButton.addEventListener('click', () => {
            removeFromCart(item.id);
        });

        orderCart.appendChild(cartItem);
    });

    // Toplam tutar
    const totalRow = document.createElement('div');
    totalRow.className = 'p-3 flex justify-between items-center font-medium border-t border-gray-200';
    totalRow.innerHTML = `
        <span>Toplam</span>
        <span>₺${totalAmount.toFixed(2)}</span>
    `;

    orderCart.appendChild(totalRow);
}

// Sepet işlemleri
function addToCart(item) {
    const existingItem = appState.currentOrder.items.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        appState.currentOrder.items.push({
            ...item,
            quantity: 1
        });
    }

    renderOrderCart();
    showToast(`${item.name} sepete eklendi`);
}

function decreaseQuantity(itemId) {
    const item = appState.currentOrder.items.find(i => i.id === itemId);

    if (item && item.quantity > 1) {
        item.quantity -= 1;
        renderOrderCart();
    } else if (item && item.quantity === 1) {
        removeFromCart(itemId);
    }
}

function increaseQuantity(itemId) {
    const item = appState.currentOrder.items.find(i => i.id === itemId);

    if (item) {
        item.quantity += 1;
        renderOrderCart();
    }
}

function removeFromCart(itemId) {
    appState.currentOrder.items = appState.currentOrder.items.filter(i => i.id !== itemId);
    renderOrderCart();
}

// Ekran geçişleri
function showOrderScreen(table) {
    elements.waiterScreen.classList.add('hidden');
    elements.orderScreen.classList.remove('hidden');

    // Masa başlığını güncelle
    elements.orderTableTitle.textContent = `Masa ${table.number}`;

    // Sipariş sepetini temizle
    appState.currentOrder.items = [];
    elements.orderNote.value = '';

    // Menü öğelerini yükle
    renderMenuItems('starters');
    renderOrderCart();
}

function hideOrderScreen() {
    elements.orderScreen.classList.add('hidden');
}

function showOrderDetailScreen(order) {
    // İlgili ekranı gizle
    const role = appState.currentUser.role;
    if (role === 'waiter') {
        elements.waiterScreen.classList.add('hidden');
    } else if (role === 'kitchen') {
        elements.kitchenScreen.classList.add('hidden');
    } else if (role === 'cashier') {
        elements.cashierScreen.classList.add('hidden');
    }

    elements.orderDetailScreen.classList.remove('hidden');

    // Detay bilgilerini güncelle
    elements.detailTableTitle.textContent = `Masa ${order.tableNumber} Detayları`;
    elements.detailTableNumber.textContent = `Masa ${order.tableNumber}`;
    elements.detailTableStatus.textContent = `Durum: ${
        order.status === 'preparing' ? 'Hazırlanıyor' :
        order.status === 'ready' ? 'Hazır' :
        order.status === 'delivered' ? 'Teslim Alındı' :
        order.status === 'served' ? 'Servis Edildi' :
        order.status === 'completed' ? 'Tamamlandı' :
        order.status === 'qr_order' ? 'QR Sipariş' : 'Bilinmiyor'
    }`;
    elements.detailTableTime.textContent = `${order.date} ${order.time}`;
    elements.detailTableWaiter.textContent = `Garson: ${order.waiter || 'Atanmamış'}`;

    // Sipariş öğelerini göster
    const orderDetailItems = elements.orderDetailItems;
    orderDetailItems.innerHTML = '';

    let totalAmount = 0;

    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            const detailItem = document.createElement('div');
            detailItem.className = 'p-3 flex justify-between items-center';
            detailItem.innerHTML = `
                <div class="flex items-center">
                    <span class="bg-primary bg-opacity-10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">${item.quantity}</span>
                    <span>${item.name}</span>
                </div>
                <div class="text-sm">
                    ₺${itemTotal.toFixed(2)}
                </div>
            `;

            orderDetailItems.appendChild(detailItem);
        });
    } else {
        orderDetailItems.innerHTML = `
            <div class="p-3 text-center text-gray-500">
                Bu siparişte henüz ürün bulunmuyor.
            </div>
        `;
    }

    // Toplam tutar
    const totalRow = document.createElement('div');
    totalRow.className = 'p-3 flex justify-between items-center font-medium border-t border-gray-200';
    totalRow.innerHTML = `
        <span>Toplam</span>
        <span>₺${totalAmount.toFixed(2)}</span>
    `;

    orderDetailItems.appendChild(totalRow);

    // Sipariş notunu göster
    const noteContainer = elements.orderDetailNote.querySelector('p');
    noteContainer.textContent = order.note || 'Not yok';

    // Rol bazlı aksiyonları göster
    const actions = elements.orderDetailActions;
    actions.innerHTML = '';

    if (role === 'waiter') {
        if (order.status === 'qr_order') {
            const approveButton = document.createElement('button');
            approveButton.className = 'w-full py-3 bg-green-500 text-white rounded-button';
            approveButton.textContent = 'Siparişi Onayla';
            approveButton.addEventListener('click', () => {
                approveQrOrder(order.id);
            });

            actions.appendChild(approveButton);

            const editButton = document.createElement('button');
            editButton.className = 'w-full py-3 mt-2 bg-primary text-white rounded-button';
            editButton.textContent = 'Düzenle';
            editButton.addEventListener('click', () => {
                // QR sipariş düzenleme ekranını göster
                const table = appState.tables.find(t => t.number === order.tableNumber);
                if (table) {
                    showOrderScreen(table);
                    
                    // Mevcut sipariş öğelerini sepete ekle
                    appState.currentOrder.items = order.items && order.items.length > 0 ? 
                        [...order.items] : [];
                    appState.currentOrder.note = order.note || '';
                    
                    // Sepeti güncelle
                    renderOrderCart();
                    
                    // Sipariş ID'sini sakla (düzenleme için)
                    appState.currentOrder.editOrderId = order.id;
                    
                    showToast('Sipariş düzenleniyor...');
                } else {
                    showToast('Masa bilgisi bulunamadı');
                }
            });

            actions.appendChild(editButton);
        } else if (order.status === 'new' || order.status === 'preparing') {
            const editButton = document.createElement('button');
            editButton.className = 'w-full py-3 bg-primary text-white rounded-button';
            editButton.textContent = 'Düzenle';
            editButton.addEventListener('click', () => {
                // QR sipariş düzenleme ekranını göster
                const table = appState.tables.find(t => t.number === order.tableNumber);
                if (table) {
                    showOrderScreen(table);
                    
                    // Mevcut sipariş öğelerini sepete ekle
                    appState.currentOrder.items = order.items && order.items.length > 0 ? 
                        [...order.items] : [];
                    appState.currentOrder.note = order.note || '';
                    
                    // Sepeti güncelle
                    renderOrderCart();
                    
                    // Sipariş ID'sini sakla (düzenleme için)
                    appState.currentOrder.editOrderId = order.id;
                    
                    showToast('Sipariş düzenleniyor...');
                } else {
                    showToast('Masa bilgisi bulunamadı');
                }
            });

            actions.appendChild(editButton);
        } else if (order.status === 'ready') {
            const deliverButton = document.createElement('button');
            deliverButton.className = 'w-full py-3 bg-primary text-white rounded-button';
            deliverButton.textContent = 'Teslim Al';
            deliverButton.addEventListener('click', () => {
                deliverOrder(order.id);
            });

            actions.appendChild(deliverButton);
        } else if (order.status === 'delivered') {
            const serveButton = document.createElement('button');
            serveButton.className = 'w-full py-3 bg-purple-600 text-white rounded-button';
            serveButton.textContent = 'Servis Edildi';
            serveButton.addEventListener('click', () => {
                serveOrder(order.id);
            });

            actions.appendChild(serveButton);
        }
    } else if (role === 'kitchen' && (order.status === 'new' || order.status === 'preparing')) {
        const completeButton = document.createElement('button');
        completeButton.className = 'w-full py-3 bg-green-500 text-white rounded-button';
        completeButton.textContent = 'Hazır';
        completeButton.addEventListener('click', () => {
            completeOrder(order.id);
        });

        actions.appendChild(completeButton);
    } else if (role === 'cashier' && order.status === 'served') {
        const paymentButton = document.createElement('button');
        paymentButton.className = 'w-full py-3 bg-green-500 text-white rounded-button';
        paymentButton.textContent = 'Ödeme Al';
        paymentButton.addEventListener('click', () => {
            const table = appState.tables.find(t => t.number === order.tableNumber);
            showPaymentScreen(table, order);
        });

        actions.appendChild(paymentButton);
    }
}

function hideOrderDetailScreen() {
    elements.orderDetailScreen.classList.add('hidden');
}

function showPaymentScreen(table, order) {
    elements.cashierScreen.classList.add('hidden');
    elements.orderDetailScreen.classList.add('hidden');
    elements.paymentScreen.classList.remove('hidden');

    // Başlığı güncelle
    elements.paymentTitle.textContent = `Ödeme - Masa ${table.number}`;

    console.log('Ödeme ekranı gösteriliyor:', table, order);

    if (!order) {
        console.error('Ödeme için sipariş bulunamadı!');
        showToast('Sipariş bilgisi bulunamadı, lütfen yeniden deneyin');
        elements.paymentItems.innerHTML = `
            <div class="p-4 text-center text-red-500">
                Sipariş bilgisi bulunamadı!
            </div>
        `;
        elements.paymentTotal.textContent = '₺0.00';
        return;
    }

    // Ödeme detaylarını göster
    const paymentItems = elements.paymentItems;
    paymentItems.innerHTML = '';

    let totalAmount = 0;

    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const paymentItem = document.createElement('div');
        paymentItem.className = 'p-3 flex justify-between items-center';
        paymentItem.innerHTML = `
            <div class="flex items-center">
                <span class="bg-primary bg-opacity-10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">${item.quantity}</span>
                <span>${item.name}</span>
            </div>
            <div class="text-sm">
                ₺${itemTotal.toFixed(2)}
            </div>
        `;

        paymentItems.appendChild(paymentItem);
    });

    // Toplam tutarı güncelle
    elements.paymentTotal.textContent = `₺${totalAmount.toFixed(2)}`;

    // Ödeme yöntemlerini sıfırla ve nakit ödemeyi varsayılan olarak seç
    elements.cashPayment.classList.add('border-primary');
    elements.cardPayment.classList.remove('border-primary');
}

function hidePaymentScreen() {
    elements.paymentScreen.classList.add('hidden');
}

// İşlem fonksiyonları
async function submitOrder() {
    if (appState.currentOrder.items.length === 0) {
        showToast('Sepet boş, lütfen ürün ekleyin');
        return;
    }

    try {
        // Sipariş notunu al
        const note = elements.orderNote.value.trim();

        // Toplam tutarı hesapla
        const totalAmount = appState.currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        console.log('Sipariş gönderiliyor:', {
            masaNo: appState.currentTable.number,
            masaId: appState.currentTable.id,
            garson: appState.currentUser.fullName,
            urunler: appState.currentOrder.items,
            toplam: totalAmount
        });

        // Masa bilgisini kontrol et
        if (!appState.currentTable || !appState.currentTable.number) {
            console.error('Masa bilgisi eksik!', appState.currentTable);
            showToast('Masa bilgisi alınamadı, lütfen yeniden deneyin');
            return;
        }

        // Önce masa durumunu güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({
                durum: 'dolu',
                waiter_name: appState.currentUser.fullName,
                waiter_id: appState.currentUser.id || null,
                toplam_tutar: totalAmount
            })
            .eq('id', appState.currentTable.id);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
            showToast('Masa durumu güncellenirken hata oluştu');
            return;
        } else {
            console.log('Masa durumu başarıyla güncellendi');
        }

        // Supabase'e sipariş ekle
        const { data: orderData, error: orderError } = await supabase
            .from('siparisler')
            .insert({
                masa_id: appState.currentTable.id,
                masa_no: appState.currentTable.number,
                waiter_id: appState.currentUser.id || null,
                waiter_name: appState.currentUser.fullName,
                durum: 'beklemede',
                siparis_notu: note,
                toplam_fiyat: totalAmount
            })
            .select('*')
            .single();

        if (orderError) {
            console.error('Sipariş kaydedilirken hata:', orderError);
            showToast(`Sipariş oluşturulurken hata: ${orderError.message}`);
            return;
        }

        console.log('Sipariş başarıyla eklendi:', orderData);

        // Sipariş ID'sini masaya ekle
        const { error: updateTableError } = await supabase
            .from('masalar')
            .update({
                siparis_id: orderData.id
            })
            .eq('id', appState.currentTable.id);

        if (updateTableError) {
            console.error('Masa-sipariş ilişkisi güncellenirken hata:', updateTableError);
        } else {
            console.log('Masa-sipariş ilişkisi başarıyla güncellendi');
        }

        // Sipariş kalemlerini ekle
        const orderItems = appState.currentOrder.items.map(item => ({
            siparis_id: orderData.id,
            urun_id: item.id,
            urun_adi: item.name,
            miktar: item.quantity,
            birim_fiyat: item.price,
            toplam_fiyat: item.price * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('siparis_kalemleri')
            .insert(orderItems);

        if (itemsError) {
            console.error('Sipariş kalemleri kaydedilirken hata:', itemsError);
        } else {
            console.log('Sipariş kalemleri başarıyla eklendi');
        }

        // Yeni sipariş oluştur (uygulama durumu için)
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const dateString = now.getDate().toString().padStart(2, '0') + '.' + (now.getMonth() + 1).toString().padStart(2, '0') + '.' + now.getFullYear();

        const newOrder = {
            id: orderData.id,
            tableId: appState.currentTable.id,
            tableNumber: appState.currentTable.number,
            status: 'new',
            items: [...appState.currentOrder.items],
            note: note,
            waiter: appState.currentUser.fullName,
            time: timeString,
            date: dateString,
            total: totalAmount
        };

        // Siparişi ekle
        appState.orders.push(newOrder);

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === appState.currentTable.number);
        if (table) {
            table.status = 'active'; // 'occupied' yerine 'active' kullanılıyor
            table.waiterId = appState.currentUser.id;
            table.waiterName = appState.currentUser.fullName;
            table.orderId = orderData.id;
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
        broadcastData({
            type: 'order-update',
            order: newOrder,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${appState.currentTable.number} için yeni sipariş`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Siparişi bildirimlere ekle
        addNotification(`Masa ${appState.currentTable.number} için yeni sipariş`);

        // Sepeti temizle
        appState.currentOrder.items = [];
        elements.orderNote.value = '';

        // Ekranı gizle ve garson ekranına dön
        hideOrderScreen();
        showWaiterScreen();

        showToast('Sipariş başarıyla gönderildi');
    } catch (err) {
        console.error('Sipariş oluşturma hatası:', err);
        showToast('Sipariş oluşturulurken bir hata oluştu');
    }
}

async function completeOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Tamamlanacak sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş tamamlanıyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'tamamlandi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş güncellenirken hata oluştu');
            return;
        }

        console.log('Sipariş durumu veritabanında güncellendi');

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'ready';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'ready';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
        broadcastData({
            type: 'order-update',
            order: order,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} siparişi hazır`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi hazır`);
        elements.orderReadySound.play();

        // Kapasitör bildirimi gönder (mobil cihazlar için)
        if (window.Capacitor && Capacitor.isPluginAvailable('LocalNotifications')) {
            sendCapacitorNotification(
                'Sipariş Hazır',
                `Masa ${order.tableNumber} siparişi hazır`
            );
        }

        // İlgili ekranı yenile
        refreshUI();

        showToast(`Masa ${order.tableNumber} siparişi hazırlandı`);
    } catch (err) {
        console.error('Sipariş tamamlama hatası:', err);
        showToast('Sipariş tamamlanırken bir hata oluştu');
    }
}

// QR Sipariş onaylama fonksiyonu
async function approveQrOrder(orderId) {
    try {
        // Siparişi bul
        let order = appState.orders.find(o => o.id === orderId);
        
        if (!order) {
            // Sipariş yerel listede yoksa veritabanından getir
            const { data, error } = await supabase
                .from('siparisler')
                .select('*, siparis_kalemleri(*)')
                .eq('id', orderId)
                .single();
                
            if (error || !data) {
                console.error('Onaylanacak QR sipariş bulunamadı:', orderId, error);
                showToast('Sipariş bulunamadı');
                return;
            }
            
            // Sipariş verilerini düzenle
            let items = [];
            
            // Eğer sipariş kalemleri varsa, sipariş kalemlerinden ürünleri oluştur
            if (data.siparis_kalemleri && data.siparis_kalemleri.length > 0) {
                data.siparis_kalemleri.forEach(item => {
                    items.push({
                        id: item.urun_id,
                        name: item.urun_adi,
                        price: parseFloat(item.birim_fiyat),
                        quantity: item.miktar,
                        total: parseFloat(item.toplam_fiyat)
                    });
                });
            } else if (data.urunler) {
                // Eğer urunler alanı varsa JSON olarak parse et
                try {
                    const parsedItems = JSON.parse(data.urunler);
                    if (Array.isArray(parsedItems)) {
                        items = parsedItems.map(item => ({
                            id: item.id,
                            name: item.name,
                            price: parseFloat(item.price),
                            quantity: item.quantity,
                            total: parseFloat(item.price) * item.quantity
                        }));
                    }
                } catch (e) {
                    console.error('Ürünler JSON parse hatası:', e);
                }
            }
            
            order = {
                id: data.id,
                tableNumber: data.masa_no,
                tableId: data.masa_id,
                status: convertStatusFromDb(data.durum),
                note: data.siparis_notu || '',
                total: parseFloat(data.toplam_fiyat),
                items: items,
                musteri_siparis: data.musteri_siparis || false,
                date: new Date(data.created_at).toLocaleDateString('tr-TR'),
                time: new Date(data.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})
            };
            
            // Siparişi yerel listeye ekle
            appState.orders.unshift(order);
        }

        console.log('QR Sipariş onaylanıyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({
                durum: 'beklemede',
                musteri_siparis: true,
                waiter_id: appState.currentUser.id || null,
                waiter_name: appState.currentUser.fullName
            })
            .eq('id', orderId);

        if (orderError) {
            console.error('QR Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş durumu güncellenirken bir hata oluştu');
            return;
        }

        // Sipariş öğelerini ekle veya güncelle
        if (order.items && order.items.length > 0) {
            // Önce mevcut sipariş kalemlerini kontrol et
            const { data: existingItems } = await supabase
                .from('siparis_kalemleri')
                .select('*')
                .eq('siparis_id', orderId);
                
            if (!existingItems || existingItems.length === 0) {
                // Sipariş öğeleri yoksa ekle
                const orderItems = order.items.map(item => ({
                    siparis_id: orderId,
                    urun_id: item.id,
                    urun_adi: item.name,
                    miktar: item.quantity,
                    birim_fiyat: parseFloat(item.price),
                    toplam_fiyat: parseFloat(item.price) * item.quantity,
                    durum: 'beklemede'
                }));
                
                await supabase
                    .from('siparis_kalemleri')
                    .insert(orderItems);
                    
                console.log('Sipariş kalemleri eklendi');
            }
        }

        console.log('QR Sipariş onaylandı ve mutfağa gönderildi');

        // Masa durumunu veritabanında güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({
                durum: 'dolu',
                siparis_id: orderId,
                waiter_id: appState.currentUser.id || null,
                waiter_name: appState.currentUser.fullName
            })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
        } else {
            console.log('Masa durumu veritabanında güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'new';
        order.waiter = appState.currentUser.fullName;
        order.waiterId = appState.currentUser.id;

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'active';
            table.waiterId = appState.currentUser.id;
            table.waiterName = appState.currentUser.fullName;
            table.orderId = orderId;
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
        broadcastData({
            type: 'order-update',
            order: order,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} QR siparişi onaylandı ve mutfağa gönderildi`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} QR siparişi onaylandı`);
        if (elements.newOrderSound) {
            elements.newOrderSound.play().catch(err => console.log('Ses çalma hatası:', err));
        }

        // Garson ekranına geri dön
        hideOrderDetailScreen();
        showWaiterScreen();

        showToast('QR Sipariş onaylandı ve mutfağa gönderildi');
    } catch (err) {
        console.error('QR Sipariş onaylama hatası:', err);
        showToast('Sipariş onaylanırken bir hata oluştu');
    }
}

// Garson siparişi teslim aldı
async function deliverOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Teslim alınacak sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş teslim alınıyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'teslim_edildi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş durumu güncellenirken bir hata oluştu');
            return;
        }

        console.log('Sipariş teslim alındı olarak güncellendi');

        // Masa durumunu veritabanında güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'teslim_edildi' })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
        } else {
            console.log('Masa durumu veritabanında güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'delivered';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'delivered';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
            broadcastData({
                type: 'order-update',
            order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} siparişi teslim alındı`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi teslim alındı`);
        elements.orderDeliveredSound.play();

        // Garson ekranına geri dön
        hideOrderDetailScreen();
        showWaiterScreen();

            showToast('Sipariş teslim alındı olarak işaretlendi');
    } catch (err) {
        console.error('Sipariş güncelleme hatası:', err);
        showToast('Sipariş güncellenirken bir hata oluştu');
    }
}

// Garson siparişi servis etti
async function serveOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Servis edilecek sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş servis ediliyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'servis_edildi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş güncellenirken hata oluştu');
            return;
        }

        console.log('Sipariş servis edildi olarak güncellendi');

        // Masa durumunu güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'payment' })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
            showToast('Masa durumu güncellenirken hata oluştu');
            return;
        } else {
            console.log('Masa durumu başarıyla güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'served';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'payment';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
            broadcastData({
                type: 'order-update',
            order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} siparişi servis edildi`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi servis edildi`);
        elements.orderServedSound.play();

        // Garson ekranına geri dön
        hideOrderDetailScreen();
        showWaiterScreen();

            showToast('Sipariş servis edildi olarak işaretlendi');
    } catch (err) {
        console.error('Sipariş güncelleme hatası:', err);
        showToast('Sipariş güncellenirken bir hata oluştu');
    }
}

async function completePayment() {
    try {
        const tableNumber = parseInt(elements.paymentTitle.textContent.replace('Ödeme - Masa ', ''));

        // Ödeme yöntemi seç (varsayılan: nakit)
        const paymentMethod = elements.cashPayment.checked ? 'nakit' : 'kredi_karti';

        // Sipariş bilgisini al
        const order = appState.orders.find(o => o.tableNumber === tableNumber && o.status === 'served');
        if (!order) {
            showToast('Sipariş bulunamadı');
            return;
        }

        // Supabase'e ödeme kaydı ekle
        const { error: paymentError } = await supabase
            .from('odemeler')
            .insert({
                siparis_id: order.id,
                masa_id: order.tableId,
                masa_no: tableNumber,
                tutar: order.total,
                odeme_turu: paymentMethod,
                durum: 'tamamlandi'
            });

        if (paymentError) {
            console.error('Ödeme kaydedilirken hata:', paymentError);
            showToast('Ödeme kaydedilirken hata oluştu');
            return;
        }

        // Sipariş durumunu güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'tamamlandi' })
            .eq('id', order.id);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
        }

        // Masa durumunu güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'bos', toplam_tutar: 0 })
            .eq('masa_no', tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'completed';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === tableNumber);
        if (table) {
            table.status = 'empty';
        }

        // Tüm cihazlara sipariş güncellemesini gönder
        if (order) {
            broadcastData({
                type: 'order-update',
                order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });
        }

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${tableNumber} ödemesi tamamlandı`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${tableNumber} ödemesi tamamlandı`);

        // Ekranı gizle ve kasiyer ekranına dön
        hidePaymentScreen();
        showCashierScreen();

        showToast('Ödeme başarıyla tamamlandı');
    } catch (err) {
        console.error('Ödeme işlemi sırasında hata:', err);
        showToast('Ödeme işlemi sırasında bir hata oluştu');
    }
}

// Bildirim fonksiyonları
function addNotification(message) {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    appState.notifications.unshift({
        id: appState.notifications.length + 1,
        message,
        time: timeString,
        read: false
    });

    // Bildirim sayısını güncelle
    updateNotificationBadge();

    // Duruma göre doğru bildirim sesini çal
    if (message.includes('yeni sipariş')) {
        elements.newOrderSound.play();
        sendCapacitorNotification('Yeni Sipariş', message);
    } else if (message.includes('hazır')) {
        elements.orderReadySound.play();
        sendCapacitorNotification('Sipariş Hazır', message);
    } else if (message.includes('teslim alındı')) {
        elements.orderDeliveredSound.play();
        sendCapacitorNotification('Sipariş Alındı', message);
    } else if (message.includes('servis edildi')) {
        elements.orderServedSound.play();
        sendCapacitorNotification('Sipariş Servis Edildi', message);
    } else if (message.includes('tamamlandı')) {
        elements.paymentCompleteSound.play();
        sendCapacitorNotification('Ödeme Tamamlandı', message);
    } else {
        // Varsayılan ses
        elements.notificationSound.play();
        sendCapacitorNotification('Bildirim', message);
    }

    // Kullanıcı rolüne göre otomatik ekran yenileme
    const role = appState.currentUser ? appState.currentUser.role : null;
    if (role === 'waiter' && message.includes('hazır')) {
        // Garson ekranını yenile
        renderTables();
    } else if (role === 'kitchen' && message.includes('yeni sipariş')) {
        // Mutfak ekranını yenile
        renderKitchenOrders();
    } else if (role === 'cashier' && message.includes('servis edildi')) {
        // Kasiyer ekranını yenile
        renderCashierTables();
    }
}

function updateNotificationBadge() {
    const unreadCount = appState.notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        elements.notificationBadge.textContent = unreadCount;
        elements.notificationBadge.classList.remove('hidden');
    } else {
        elements.notificationBadge.classList.add('hidden');
    }
}

function toggleNotificationPanel() {
    const panel = elements.notificationPanel;

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        renderNotifications();

        // Bildirimleri okundu olarak işaretle
        appState.notifications.forEach(n => {
            n.read = true;
        });

        // Bildirim sayısını güncelle
        updateNotificationBadge();
    } else {
        panel.classList.add('hidden');
    }
}

function renderNotifications() {
    const notificationList = elements.notificationList;
    notificationList.innerHTML = '';

    if (appState.notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="p-4 text-center text-sm text-gray-500">
                Bildirim yok
            </div>
        `;
        return;
    }

    appState.notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `p-3 border-b border-gray-100 ${notification.read ? '' : 'bg-blue-50'}`;
        notificationItem.innerHTML = `
            <div class="text-sm">${notification.message}</div>
            <div class="text-xs text-gray-500 mt-1">${notification.time}</div>
        `;

        notificationList.appendChild(notificationItem);
    });
}

// Toast mesajı göster
function showToast(message) {
    const toast = elements.toast;
    const toastMessage = elements.toastMessage;

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Animasyon
    setTimeout(() => {
        toast.classList.remove('opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Hazır siparişleri göster
function renderReadyOrders() {
    // Garson ekranının altına hazır siparişler bölümü ekle
    const waiterScreen = elements.waiterScreen;

    // Mevcut bir hazır siparişler bölümü varsa kaldır
    const existingReadyOrders = document.getElementById('readyOrdersSection');
    if (existingReadyOrders) {
        existingReadyOrders.remove();
    }

    // Hazır siparişleri bul
    const readyOrders = appState.orders.filter(order => order.status === 'ready');

    if (readyOrders.length > 0) {
        const readyOrdersSection = document.createElement('div');
        readyOrdersSection.id = 'readyOrdersSection';
        readyOrdersSection.className = 'mt-6 mb-16';

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'flex justify-between items-center mb-3';
        sectionHeader.innerHTML = `
            <h2 class="text-lg font-medium">Hazır Siparişler</h2>
            <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">${readyOrders.length}</span>
        `;

        const ordersList = document.createElement('div');
        ordersList.className = 'space-y-3';

        readyOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'bg-white rounded-lg border-2 border-green-500 overflow-hidden fade-in';

            const orderHeader = document.createElement('div');
            orderHeader.className = 'bg-green-500 text-white p-3';
            orderHeader.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 class="font-medium">Masa ${order.tableNumber}</h3>
                    <span class="text-xs bg-white text-green-500 px-2 py-1 rounded-full">${order.time}</span>
                </div>
            `;

            const orderBody = document.createElement('div');
            orderBody.className = 'p-3';

            // Sipariş aksiyonları
            const orderActions = document.createElement('div');
            orderActions.className = 'flex space-x-2';

            const viewButton = document.createElement('button');
            viewButton.className = 'flex-1 bg-gray-100 text-gray-700 py-2 rounded-button text-sm';
            viewButton.textContent = 'Detaylar';
            viewButton.addEventListener('click', () => {
                showOrderDetailScreen(order);
            });

            const deliverButton = document.createElement('button');
            deliverButton.className = 'flex-1 bg-primary text-white py-2 rounded-button text-sm';
            deliverButton.textContent = 'Teslim Al';
            deliverButton.addEventListener('click', () => {
                deliverOrder(order.id);
            });

            orderActions.appendChild(viewButton);
            orderActions.appendChild(deliverButton);

            orderBody.appendChild(orderActions);

            orderCard.appendChild(orderHeader);
            orderCard.appendChild(orderBody);

            ordersList.appendChild(orderCard);
        });

        readyOrdersSection.appendChild(sectionHeader);
        readyOrdersSection.appendChild(ordersList);

        waiterScreen.appendChild(readyOrdersSection);
    }
}

// Ürün yönetimi ekranını göster
function showProductManagementScreen() {
    elements.cashierScreen.classList.add('hidden');
    elements.productManagementScreen.classList.remove('hidden');

    // İlk kategorinin ürünlerini göster
    renderProducts('starters');
}

// Ürün yönetimi ekranını gizle
function hideProductManagementScreen() {
    elements.productManagementScreen.classList.add('hidden');
}

// Ürün listesini göster
function renderProducts(category) {
    if (!category) {
        category = 'starters';
    }

    // Kategori butonlarını güncelle
    elements.productCategoryButtons.forEach(button => {
        if (button.dataset.category === category) {
            button.classList.add('bg-primary', 'text-white');
            button.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            button.classList.add('bg-gray-200', 'text-gray-700');
            button.classList.remove('bg-primary', 'text-white');
        }
    });

    // Ürünleri listele
    const productsList = elements.productsList;
    productsList.innerHTML = '';

    if (!MENU_ITEMS[category] || MENU_ITEMS[category].length === 0) {
        productsList.innerHTML = `
            <div class="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                Bu kategoride ürün bulunamadı.
            </div>
        `;
        return;
    }

    MENU_ITEMS[category].forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'bg-white rounded-lg border border-gray-200 p-4 mb-3 relative';

        // Ürün görseli için varsayılan veya ürün görseli
        const imageUrl = product.image_url || product.image || 'https://via.placeholder.com/80';

        productElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <img src="${imageUrl}" alt="${product.name}" class="w-12 h-12 rounded-full object-cover mr-3">
                <div>
                    <h3 class="font-medium">${product.name}</h3>
                    <p class="text-sm text-gray-500">${product.price.toFixed(2)} ₺</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 rounded-full text-xs ${product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${product.available ? 'Satışta' : 'Satış Dışı'}
                    </span>
                    <button class="edit-product p-2 rounded-full hover:bg-gray-100" data-id="${product.id}" data-category="${product.category}">
                        <i class="fas fa-pencil-alt text-gray-600"></i>
                    </button>
                    <button class="toggle-product p-2 rounded-full hover:bg-gray-100" data-id="${product.id}" data-category="${product.category}">
                        <i class="fas fa-${product.available ? 'eye-slash' : 'eye'} text-gray-600"></i>
                    </button>
                    <button class="delete-product p-2 rounded-full hover:bg-gray-100" data-id="${product.id}" data-category="${product.category}">
                        <i class="fas fa-trash text-red-500"></i>
                    </button>
                </div>
            </div>
        `;

        // Düzenleme butonu
        const editButton = productElement.querySelector('.edit-product');
        editButton.addEventListener('click', () => {
            editProduct(product);
        });

        // Görünürlük değiştirme butonu
        const toggleButton = productElement.querySelector('.toggle-product');
        toggleButton.addEventListener('click', async () => {
            try {
                // Ürün durumunu güncelle
                product.available = !product.available;

                // Supabase'de güncelle
                const { error } = await supabase
                    .from('urunler')
                    .update({ stok_durumu: product.available })
                    .eq('id', product.id);

                if (error) {
                    console.error('Ürün durumu güncellenirken hata:', error);
                    showToast('Ürün durumu güncellenirken bir hata oluştu');
                    return;
                }

                // Gerçek zamanlı bildirim gönder
                broadcastData({
                    type: 'product-update',
                    product,
                    action: 'update',
                    sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
                });

                // UI güncelle
                renderProducts(category);
                showToast(`Ürün ${product.available ? 'satışa açıldı' : 'satıştan kaldırıldı'}`);
            } catch (err) {
                console.error('Ürün durumu değiştirme hatası:', err);
                showToast('Ürün durumu değiştirilemedi');
            }
        });

        // Silme butonu
        const deleteButton = productElement.querySelector('.delete-product');
        deleteButton.addEventListener('click', () => {
            deleteProduct(product.id, category);
        });

        productsList.appendChild(productElement);
    });
}

// Ürün düzenleme
function editProduct(product) {
    showProductForm(product);
}

// Kategori ekleme
async function addCategory() {
    const categoryName = prompt('Yeni kategori adını giriniz:');
    if (!categoryName || categoryName.trim() === '') {
        return;
    }

    // Kategori kodu oluştur (küçük harfle, boşluksuz)
    const categoryCode = categoryName.trim().toLowerCase().replace(/\s+/g, '_');

    // Var olan kategorileri kontrol et
    if (MENU_ITEMS[categoryCode]) {
        showToast('Bu kategori zaten mevcut');
        return;
    }

    try {
        // Yeni kategoriyi veritabanına ekle - RPC fonksiyonu kullan
        const { data, error } = await supabase
            .rpc('add_category', {
                p_ad: categoryName.trim()
            });

        if (error) {
            console.error('Kategori eklenirken hata:', error);
            showToast('Kategori eklenirken bir hata oluştu');
            return;
        }

        // Kategori ID'sini al
        const kategoriId = data;
        console.log('Yeni kategori eklendi:', { id: kategoriId, ad: categoryName });

        // Yerel olarak kategoriyi ekle
        MENU_ITEMS[categoryCode] = [];

        // Kategori butonlarını güncelle
        updateCategoryButtons();

        // Gerçek zamanlı bildirim gönder
        broadcastData({
            type: 'category-update',
            category: {
                id: kategoriId,
                code: categoryCode,
                name: categoryName.trim()
            },
            action: 'add',
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Yeni kategori verileri için menüyü yeniden yükle
        loadMenuItemsFromSupabase();

        showToast('Yeni kategori eklendi');
    } catch (err) {
        console.error('Kategori ekleme hatası:', err);
        showToast('Kategori eklenirken bir hata oluştu');
    }
}

// Kategori butonlarını güncelle
function updateCategoryButtons() {
    // Kategori konteynerini temizle
    if (!elements.productCategoryButtonsContainer) {
        console.log('Kategori butonları konteynerı bulunamadı');
        return;
    }

    elements.productCategoryButtonsContainer.innerHTML = '';

    // Her kategori için buton oluştur
    Object.keys(MENU_ITEMS).forEach(category => {
        const categoryName = getCategoryName(category);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-category-button px-4 py-2 rounded-button bg-gray-200 text-gray-700 mr-2 mb-2';
        button.dataset.category = category;
        button.textContent = categoryName;

        button.addEventListener('click', () => {
            renderProducts(category);
        });

        elements.productCategoryButtonsContainer.appendChild(button);
    });

    // Kategori ekle butonu (sadece kasiyer için)
    if (appState.currentUser.role === 'cashier') {
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'add-category-button px-4 py-2 rounded-button bg-green-500 text-white mr-2 mb-2';
        addButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Kategori Ekle';

        addButton.addEventListener('click', () => {
            addCategory();
        });

        elements.productCategoryButtonsContainer.appendChild(addButton);
    }
}

// Kategori adını getir
function getCategoryName(categoryCode) {
    const categoryNames = {
        'starters': 'Başlangıçlar',
        'mains': 'Ana Yemekler',
        'drinks': 'İçecekler',
        'desserts': 'Tatlılar'
    };

    return categoryNames[categoryCode] || categoryCode.charAt(0).toUpperCase() + categoryCode.slice(1);
}

// Ürün formunu göster
function showProductForm(product = null) {
    // Form başlığını güncelle
    elements.productFormTitle.textContent = product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle';

    // Form alanlarını doldur veya temizle
    if (product) {
        elements.productCategory.value = product.category;
        elements.productName.value = product.name;
        elements.productPrice.value = product.price;
        elements.productAvailable.checked = product.available !== false;
        elements.saveProductButton.dataset.id = product.id;
        elements.saveProductButton.dataset.category = product.category;

        // Ürün görseli varsa doldur
        if (elements.productImageUrl) {
            elements.productImageUrl.value = product.image_url || product.image || '';
        }
    } else {
        // Aktif kategoriyi bul
        let activeCategory = 'starters';
        elements.productCategoryButtons.forEach(btn => {
            if (btn.classList.contains('bg-primary')) {
                activeCategory = btn.dataset.category;
            }
        });

        elements.productCategory.value = activeCategory;
        elements.productName.value = '';
        elements.productPrice.value = '';
        elements.productAvailable.checked = true;
        delete elements.saveProductButton.dataset.id;

        // Görsel URL'yi temizle
        if (elements.productImageUrl) {
            elements.productImageUrl.value = '';
        }
    }

    // Görsel URL alanı yoksa oluştur
    if (!elements.productImageUrl) {
        // Görsel URL alanını ekle
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-4';
        formGroup.innerHTML = `
            <label for="productImageUrl" class="block text-sm font-medium text-gray-700 mb-1">Ürün Görseli URL</label>
            <input type="text" id="productImageUrl" class="w-full p-2 border border-gray-300 rounded-md"
                   placeholder="https://example.com/image.jpg" value="${product && (product.image_url || product.image) ? product.image_url || product.image : ''}">
            <p class="text-xs text-gray-500 mt-1">Görsel URL'si ekleyin veya boş bırakın</p>
        `;

        // Form içine ekle - product name input'unun üstüne
        const nameInput = document.getElementById('productName');
        if (nameInput && nameInput.parentElement) {
            nameInput.parentElement.parentElement.insertBefore(formGroup, nameInput.parentElement);
        }

        // elements nesnesine ekle
        elements.productImageUrl = document.getElementById('productImageUrl');
    }

    // Formu göster
    elements.productFormScreen.classList.remove('hidden');
}

// Ürün formunu gizle
function hideProductForm() {
    elements.productFormScreen.classList.add('hidden');
}

// Ürün kaydet
async function saveProduct() {
    const name = elements.productName.value.trim();
    const price = parseFloat(elements.productPrice.value);
    const category = elements.productCategory.value;
    const available = elements.productAvailable.checked;
    const imageUrl = elements.productImageUrl ? elements.productImageUrl.value.trim() : '';

    if (!name) {
        showToast('Lütfen ürün adını girin');
        return;
    }

    console.log('Ürün kaydediliyor:', { name, price, category, available, imageUrl });

    if (isNaN(price) || price <= 0) {
        showToast('Lütfen geçerli bir fiyat girin');
        return;
    }

    try {
        const productId = elements.saveProductButton.dataset.id;
        let product;

        // Kategori ID'sini al
        let kategoriId;
        try {
            const { data: kategoriData, error: kategoriError } = await supabase
                .from('kategoriler')
                .select('id')
                .eq('ad', getCategoryName(category))
                .single();

            if (kategoriError) {
                console.error('Kategori bilgisi alınırken hata:', kategoriError);

                // Kategori bulunamadıysa, yeni kategori oluştur
                if (kategoriError.code === 'PGRST116') {
                    const turkishName = getCategoryName(category);
                    const { data: newCategory, error: newCategoryError } = await supabase
                        .rpc('add_category', { p_ad: turkishName });

                    if (newCategoryError) {
                        console.error('Yeni kategori oluşturulurken hata:', newCategoryError);
                        showToast('Kategori oluşturulurken bir hata oluştu');
                        return;
                    }

                    kategoriId = newCategory;
                    console.log('Yeni kategori oluşturuldu:', kategoriId);
                } else {
                    showToast('Ürün kaydedilirken bir hata oluştu');
                    return;
                }
            } else {
                kategoriId = kategoriData.id;
            }
        } catch (err) {
            console.error('Kategori sorgusu hatası:', err);
            showToast('Ürün kaydedilirken bir hata oluştu');
            return;
        }

        if (productId) {
            // Mevcut ürünü güncelle
            const oldCategory = elements.saveProductButton.dataset.category;
            const index = MENU_ITEMS[oldCategory].findIndex(item => item.id === productId);

            if (index !== -1) {
                // Kategori değiştiyse eski kategoriden sil
                if (oldCategory !== category) {
                    MENU_ITEMS[oldCategory].splice(index, 1);

                    // Yeni kategoriye ekle
                    product = {
                        id: productId,
                        name,
                        price,
                        category,
                        available,
                        image_url: imageUrl || 'https://via.placeholder.com/80',
                        image: imageUrl || 'https://via.placeholder.com/80'
                    };

                    MENU_ITEMS[category].push(product);
                } else {
                    // Aynı kategoride güncelle
                    product = {
                        ...MENU_ITEMS[category][index],
                        name,
                        price,
                        available,
                        image_url: imageUrl || MENU_ITEMS[category][index].image_url || 'https://via.placeholder.com/80',
                        image: imageUrl || MENU_ITEMS[category][index].image || 'https://via.placeholder.com/80'
                    };

                    MENU_ITEMS[category][index] = product;
                }

                // Supabase'de güncelle - RPC fonksiyonu kullan
                const { error } = await supabase
                    .rpc('update_product', {
                        p_id: productId,
                        p_ad: name,
                        p_fiyat: price,
                        p_kategori_id: kategoriId,
                        p_stok_durumu: available
                    });

                if (error) {
                    console.error('Ürün güncellenirken hata:', error);
                    showToast('Ürün güncellenirken bir hata oluştu');
                    return;
                }

                showToast('Ürün güncellendi');

                // Gerçek zamanlı bildirim gönder
                broadcastData({
                    type: 'product-update',
                    product,
                    action: 'update',
                    sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
                });
            }
        } else {
            // Yeni ürün ekle - RPC fonksiyonu kullan
            const { data, error } = await supabase
                .rpc('add_product', {
                    p_ad: name,
                    p_fiyat: price,
                    p_kategori_id: kategoriId,
                    p_stok_durumu: available
                });

            if (error) {
                console.error('Ürün eklenirken hata:', error);
                showToast('Ürün eklenirken bir hata oluştu');
                return;
            }

            // Ürün ID'sini al
            const productId = data;

            if (productId) {
                product = {
                    id: productId,
                    name,
                    price,
                    category,
                    available,
                    image_url: imageUrl || 'https://via.placeholder.com/80',
                    image: imageUrl || 'https://via.placeholder.com/80'
                };

                // Eğer kategori dizisi yoksa oluştur
                if (!MENU_ITEMS[category]) {
                    MENU_ITEMS[category] = [];
                }

                MENU_ITEMS[category].push(product);

                showToast('Yeni ürün eklendi');

                // Gerçek zamanlı bildirim gönder
                broadcastData({
                    type: 'product-update',
                    product,
                    action: 'add',
                    sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
                });
            }
        }

        // Formu gizle ve ürünleri yeniden listele
        hideProductForm();
        renderProducts(category);

        // Yeni veriler için menüyü yeniden yükle
        loadMenuItemsFromSupabase();
    } catch (err) {
        console.error('Ürün kaydetme hatası:', err);
        showToast('Ürün kaydedilirken bir hata oluştu');
    }
}

// Ürünü sil
async function deleteProduct(id, category) {
    try {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            // Ürün ID'sini UUID formatına dönüştür (eğer string olarak geldiyse)
            const productId = typeof id === 'string' && !id.includes('-') ? parseInt(id) : id;

            // Supabase'den sil
            const { error } = await supabase
                .from('urunler')
                .delete()
                .eq('id', productId);

            if (error) {
                console.error('Ürün silinirken hata:', error);
                showToast('Ürün silinirken bir hata oluştu');
                return;
            }

            // Yerel listeden sil
            const index = MENU_ITEMS[category].findIndex(item =>
                typeof item.id === 'string'
                    ? item.id === id
                    : item.id === parseInt(id)
            );

            if (index !== -1) {
                const product = MENU_ITEMS[category][index];
                MENU_ITEMS[category].splice(index, 1);

                // Menüyü yeniden yükle
                setTimeout(() => {
                    loadMenuItemsFromSupabase();
                }, 500);

                // Gerçek zamanlı bildirim gönder
                broadcastData({
                    type: 'product-update',
                    product,
                    action: 'delete',
                    sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
                });

                showToast('Ürün silindi');
                renderProducts(category);
            }
        }
    } catch (err) {
        console.error('Ürün silme hatası:', err);
        showToast('Ürün silinirken bir hata oluştu');
    }
}

// Capacitor bildirim gönderme (yalnızca mobil uygulamada çalışır)
function sendCapacitorNotification(title, body) {
    // Bu fonksiyon mobil uygulamada çalışacak
    if (typeof sendMobileNotification === 'function') {
        sendMobileNotification(title, body);
    }
}

// Sipariş oluştur
async function createOrder() {
    if (!appState.currentTable) {
        showToast('Lütfen önce bir masa seçin');
        return;
    }

    if (appState.currentOrder.items.length === 0) {
        showToast('Lütfen sipariş için en az bir ürün ekleyin');
        return;
    }

    try {
        const tableNumber = appState.currentTable.number;
        const note = elements.orderNote.value.trim();
        const items = appState.currentOrder.items;
        const waiter = appState.currentUser.fullName;

        console.log('Sipariş oluşturuluyor:', { tableNumber, items, note, waiter });

        // Toplam tutar hesapla
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Sipariş kaydını Supabase'e ekle
        const { data: orderData, error: orderError } = await supabase
            .from('siparisler')
            .insert({
                masa_id: appState.currentTable.id,
                masa_no: tableNumber,
                durum: 'beklemede',
                siparis_notu: note,
                waiter_name: waiter,
                toplam_fiyat: total
            })
            .select();

        if (orderError) {
            console.error('Sipariş oluşturulurken hata:', orderError);
            showToast('Sipariş oluşturulurken bir hata meydana geldi');
            return;
        }

        if (!orderData || orderData.length === 0) {
            console.error('Sipariş oluşturuldu ancak veri döndürülemedi');
            showToast('Sipariş oluşturulurken bir hata meydana geldi');
            return;
        }

        console.log('Sipariş başarıyla oluşturuldu:', orderData[0]);
        const orderId = orderData[0].id;

        // Sipariş kalemlerini Supabase'e ekle
        const orderItems = items.map(item => ({
            siparis_id: orderId,
            urun_id: item.id,
            urun_adi: item.name,
            birim_fiyat: item.price,
            miktar: item.quantity,
            toplam_fiyat: item.price * item.quantity,
            durum: 'beklemede'
        }));

        const { error: itemsError } = await supabase
            .from('siparis_kalemleri')
            .insert(orderItems);

        if (itemsError) {
            console.error('Sipariş kalemleri eklenirken hata:', itemsError);
            showToast('Sipariş oluşturuldu ancak kalemler eklenirken hata oluştu');

            // Siparişi sil (rollback)
            await supabase.from('siparisler').delete().eq('id', orderId);
            return;
        }

        // Masayı güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({
                durum: 'dolu',
                waiter_name: waiter,
                waiter_id: appState.currentUser.id,
                guncelleme_zamani: new Date().toISOString(),
                toplam_tutar: total
            })
            .eq('id', appState.currentTable.id);

        if (tableError) {
            console.error('Masa güncellenirken hata:', tableError);
            // Sipariş zaten oluşturuldu, sadece uyarı göster
            showToast('Sipariş oluşturuldu ancak masa durumu güncellenemedi');
        } else {
            console.log('Masa başarıyla güncellendi:', appState.currentTable.id);

            // Masayı yeniden yükle ve güncelle
            fetchTableDetails(tableNumber);

            // Diğer hizmetleri güncelle (mutfak ve kasiyer için)
            loadOrdersFromSupabase();
        }

        // Yerel uygulama durumunu güncelle
        appState.currentTable.status = 'occupied'; // 'active' yerine 'occupied' kullan
        appState.currentTable.waiterId = appState.currentUser.id;
        appState.currentTable.waiterName = appState.currentUser.fullName;

        // Şimdi sipariş ekle
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const dateString = now.getDate().toString().padStart(2, '0') + '.' + (now.getMonth() + 1).toString().padStart(2, '0') + '.' + now.getFullYear();

        // Yerel sipariş nesnesini oluştur
        const newOrder = {
            id: orderId,
            tableId: appState.currentTable.id,
            tableNumber: tableNumber,
            status: 'new',
            items: [...items],
            note: note,
            waiter: waiter,
            time: timeString,
            date: dateString,
            total: total
        };

        // Siparişi yerel listeye ekle
        appState.orders.unshift(newOrder);

        // Bildirim oluştur ve gerçek zamanlı güncelleme yap
        broadcastData({
            type: 'order-update',
            order: newOrder,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'table-update',
            table: appState.currentTable,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Sipariş detaylarını yeniden yükle
        fetchOrderDetails(orderId);

        // Diğer rollerdeki ekranları güncelle (gerçek zamanlı)
        loadOrdersFromSupabase();

        // Sipariş ekranını kapat ve masalar ekranına dön
        hideOrderScreen();
        elements.orderNote.value = '';
        appState.currentOrder.items = [];

        showToast('Sipariş başarıyla oluşturuldu');
    } catch (err) {
        console.error('Sipariş oluşturma hatası:', err);
        showToast('Sipariş oluşturulurken bir hata meydana geldi');
    }
}

// Siparişi tamamla (mutfak için)
async function completeOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Tamamlanacak sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş tamamlanıyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'tamamlandi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş güncellenirken hata oluştu');
            return;
        }

        console.log('Sipariş durumu veritabanında güncellendi');

        // Masa durumunu veritabanında güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'hazır' })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
        } else {
            console.log('Masa durumu veritabanında güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'ready';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'ready';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
            broadcastData({
                type: 'order-update',
            order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

        if (table) {
            broadcastData({
                type: 'table-update',
                table: table,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });
        }

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi hazır`);
        elements.orderReadySound.play();

            // UI'ı güncelle
            renderKitchenOrders();

        showToast(`Masa ${order.tableNumber} siparişi hazırlandı`);
    } catch (err) {
        console.error('Sipariş tamamlama hatası:', err);
        showToast('Sipariş tamamlanırken bir hata oluştu');
    }
}

// Siparişi teslim al (garson için)
async function deliverOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Teslim alınacak sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş teslim alınıyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'teslim_edildi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş durumu güncellenirken bir hata oluştu');
            return;
        }

        console.log('Sipariş teslim alındı olarak güncellendi');

        // Masa durumunu veritabanında güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'teslim_edildi' })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
        } else {
            console.log('Masa durumu veritabanında güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'delivered';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'delivered';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
            broadcastData({
                type: 'order-update',
            order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} siparişi teslim alındı`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi teslim alındı`);
        elements.orderDeliveredSound.play();

        // Garson ekranına geri dön
        hideOrderDetailScreen();
        showWaiterScreen();

            showToast('Sipariş teslim alındı olarak işaretlendi');
    } catch (err) {
        console.error('Sipariş güncelleme hatası:', err);
        showToast('Sipariş güncellenirken bir hata oluştu');
    }
}

// Garson siparişi servis etti
async function serveOrder(orderId) {
    try {
        const order = appState.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Servis edilecek sipariş bulunamadı:', orderId);
            showToast('Sipariş bulunamadı');
            return;
        }

        console.log('Sipariş servis ediliyor:', order);

        // Sipariş durumunu veritabanında güncelle
        const { error: orderError } = await supabase
            .from('siparisler')
            .update({ durum: 'servis_edildi' })
            .eq('id', orderId);

        if (orderError) {
            console.error('Sipariş güncellenirken hata:', orderError);
            showToast('Sipariş güncellenirken hata oluştu');
            return;
        }

        console.log('Sipariş servis edildi olarak güncellendi');

        // Masa durumunu güncelle
        const { error: tableError } = await supabase
            .from('masalar')
            .update({ durum: 'payment' })
            .eq('masa_no', order.tableNumber);

        if (tableError) {
            console.error('Masa durumu güncellenirken hata:', tableError);
            showToast('Masa durumu güncellenirken hata oluştu');
            return;
        } else {
            console.log('Masa durumu başarıyla güncellendi');
        }

        // Sipariş durumunu uygulama durumunda güncelle
        order.status = 'served';

        // Masa durumunu uygulama durumunda güncelle
        const table = appState.tables.find(t => t.number === order.tableNumber);
        if (table) {
            table.status = 'payment';
            console.log('Masa durumu uygulamada güncellendi:', table);
        }

        // Tüm cihazlara sipariş güncellemesini gönder (gerçek zamanlı)
            broadcastData({
                type: 'order-update',
            order: order,
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });

        broadcastData({
            type: 'table-update',
            table: table,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        broadcastData({
            type: 'notification',
            message: `Masa ${order.tableNumber} siparişi servis edildi`,
            sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
        });

        // Bildirimlere ekle
        addNotification(`Masa ${order.tableNumber} siparişi servis edildi`);
        elements.orderServedSound.play();

        // Garson ekranına geri dön
        hideOrderDetailScreen();
        showWaiterScreen();

            showToast('Sipariş servis edildi olarak işaretlendi');
    } catch (err) {
        console.error('Sipariş güncelleme hatası:', err);
        showToast('Sipariş güncellenirken bir hata oluştu');
    }
}

// Siparişi tamamla (ödeme) (kasiyer için)
async function completePayment(orderId, tableId) {
    try {
        // Ödeme kaydı oluştur
        const { data: orderData, error: orderFetchError } = await supabase
            .from('siparisler')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderFetchError) {
            console.error('Sipariş bilgisi alınırken hata:', orderFetchError);
            showToast('Sipariş bilgisi alınamadı');
            return;
        }

        // Ödeme kaydı oluştur
        const { error: paymentError } = await supabase
            .from('odemeler')
            .insert({
                siparis_id: orderId,
                masa_id: tableId,
                masa_no: orderData.masa_no,
                tutar: orderData.toplam_tutar,
                odeme_turu: 'nakit', // Varsayılan olarak nakit
                durum: 'tamamlandi'
            });

        if (paymentError) {
            console.error('Ödeme kaydı oluşturulurken hata:', paymentError);
            showToast('Ödeme kaydı oluşturulamadı');
            return;
        }

        console.log('Ödeme kaydı oluşturuldu, trigger ile masa ve sipariş durumu güncellenecek');

        // Yerel sipariş durumunu güncelle
        const orderIndex = appState.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            appState.orders[orderIndex].status = 'completed';

            // Gerçek zamanlı güncelleme gönder
            broadcastData({
                type: 'order-update',
                order: appState.orders[orderIndex],
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });
        }

        // Yerel masa durumunu güncelle
        const tableIndex = appState.tables.findIndex(table => table.id === tableId);
        if (tableIndex !== -1) {
            appState.tables[tableIndex].status = 'empty';
            appState.tables[tableIndex].waiterId = null;
            appState.tables[tableIndex].waiterName = null;

            // Gerçek zamanlı güncelleme gönder
            broadcastData({
                type: 'table-update',
                table: appState.tables[tableIndex],
                sender: `${rolePrefix[appState.currentUser.role]}_${appState.currentUser.fullName.replace(/\s+/g, '_').toLowerCase()}`
            });
        }

        // UI'ı güncelle
        renderCashierOrders();

        showToast('Ödeme tamamlandı');
    } catch (err) {
        console.error('Ödeme tamamlama hatası:', err);
        showToast('Ödeme tamamlanırken bir hata oluştu');
    }
}

// Garson siparişlerini göster
function renderWaiterOrders() {
    const waiterOrdersList = elements.waiterOrdersList;
    waiterOrdersList.innerHTML = '';

    // Hazır ve bekleyen siparişleri filtrele
    const activeOrders = appState.orders.filter(order =>
        order.status === 'ready' || order.status === 'delivered'
    );

    if (activeOrders.length === 0) {
        waiterOrdersList.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                Bekleyen veya hazır sipariş yok
            </div>
        `;
        return;
    }

    // Siparişleri duruma göre sırala (önce hazır olanlar)
    activeOrders.sort((a, b) => {
        if (a.status === 'ready' && b.status !== 'ready') return -1;
        if (a.status !== 'ready' && b.status === 'ready') return 1;

        // Aynı durumdaysa tarihe göre sırala
        const dateA = new Date(`${a.date.split('.').reverse().join('-')}T${a.time}`);
        const dateB = new Date(`${b.date.split('.').reverse().join('-')}T${b.time}`);
        return dateB - dateA;
    });

    activeOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white rounded-lg border border-gray-200 p-4 mb-4';

        let statusBadge = '';
        let actionButton = '';

        if (order.status === 'ready') {
            statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Hazır</span>';
            actionButton = `<button class="deliver-order-button px-4 py-2 bg-blue-500 text-white rounded-button" data-order-id="${order.id}">Teslim Al</button>`;
        } else if (order.status === 'delivered') {
            statusBadge = '<span class="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">Teslim Alındı</span>';
            actionButton = `<button class="serve-order-button px-4 py-2 bg-green-500 text-white rounded-button" data-order-id="${order.id}">Servis Edildi</button>`;
        }

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="flex justify-between py-1 border-b border-gray-100">
                    <div class="flex">
                        <span class="font-medium mr-2">${item.quantity}x</span>
                        <span>${item.name}</span>
                    </div>
                </div>
            `;
        });

        orderElement.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-lg font-medium">Masa ${order.tableNumber}</h3>
                        ${statusBadge}
                    </div>
                    <p class="text-xs text-gray-500">Sipariş #${order.id} • ${order.time} • ${order.date}</p>
                </div>
            </div>
            <div class="border-t border-gray-200 pt-2 mt-2">
                ${itemsHtml}
            </div>
            ${order.note ? `
                <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span class="font-medium">Not:</span> ${order.note}
                </div>
            ` : ''}
            <div class="mt-4 flex justify-end">
                ${actionButton}
            </div>
        `;

        // Teslim alma butonu
        const deliverButton = orderElement.querySelector('.deliver-order-button');
        if (deliverButton) {
            deliverButton.addEventListener('click', () => {
                deliverOrder(order.id);
            });
        }

        // Servis edildi butonu
        const serveButton = orderElement.querySelector('.serve-order-button');
        if (serveButton) {
            serveButton.addEventListener('click', () => {
                serveOrder(order.id);
            });
        }

        waiterOrdersList.appendChild(orderElement);
    });
}

// Kasiyer siparişlerini göster
function renderCashierOrders() {
    const cashierOrdersList = elements.cashierOrdersList;
    cashierOrdersList.innerHTML = '';

    // Servis edilmiş siparişleri filtrele
    const servedOrders = appState.orders.filter(order =>
        order.status === 'served'
    );

    if (servedOrders.length === 0) {
        cashierOrdersList.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                Ödenecek sipariş yok
            </div>
        `;
        return;
    }

    // Siparişleri tarihe göre sırala (en yeniler üstte)
    servedOrders.sort((a, b) => {
        const dateA = new Date(`${a.date.split('.').reverse().join('-')}T${a.time}`);
        const dateB = new Date(`${b.date.split('.').reverse().join('-')}T${b.time}`);
        return dateB - dateA;
    });

    servedOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white rounded-lg border border-gray-200 p-4 mb-4';

        let itemsHtml = '';
        let total = 0;

        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            itemsHtml += `
                <div class="flex justify-between py-1 border-b border-gray-100">
                    <div class="flex">
                        <span class="font-medium mr-2">${item.quantity}x</span>
                        <span>${item.name}</span>
                    </div>
                    <span class="text-gray-600">${itemTotal.toFixed(2)} ₺</span>
                </div>
            `;
        });

        orderElement.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-lg font-medium">Masa ${order.tableNumber}</h3>
                        <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Servis Edildi</span>
                    </div>
                    <p class="text-xs text-gray-500">Sipariş #${order.id} • ${order.time} • ${order.date}</p>
                    <p class="text-xs text-gray-500">Garson: ${order.waiter}</p>
                </div>
            </div>
            <div class="border-t border-gray-200 pt-2 mt-2">
                ${itemsHtml}
                <div class="flex justify-between py-2 font-medium mt-2">
                    <span>Toplam</span>
                    <span>${total.toFixed(2)} ₺</span>
                </div>
            </div>
            ${order.note ? `
                <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span class="font-medium">Not:</span> ${order.note}
                </div>
            ` : ''}
            <div class="mt-4 flex justify-end space-x-2">
                <button class="print-receipt-button px-4 py-2 bg-gray-200 text-gray-700 rounded-button" data-order-id="${order.id}">
                    <i class="fas fa-print mr-1"></i> Fiş Yazdır
                </button>
                <button class="complete-payment-button px-4 py-2 bg-green-500 text-white rounded-button" data-order-id="${order.id}" data-table-id="${order.tableId}">
                    Ödeme Tamamlandı
                </button>
            </div>
        `;

        // Fiş yazdırma butonu
        const printButton = orderElement.querySelector('.print-receipt-button');
        if (printButton) {
            printButton.addEventListener('click', () => {
                printReceipt(order);
            });
        }

        // Ödeme tamamlama butonu
        const paymentButton = orderElement.querySelector('.complete-payment-button');
        if (paymentButton) {
            paymentButton.addEventListener('click', () => {
                completePayment(order.id, order.tableId);
            });
        }

        cashierOrdersList.appendChild(orderElement);
    });
}

// Sipariş durumunu metne dönüştür
function getOrderStatusText(status) {
    const statusTexts = {
        'new': 'Yeni',
        'preparing': 'Hazırlanıyor',
        'ready': 'Hazır',
        'delivered': 'Teslim Alındı',
        'served': 'Servis Edildi',
        'completed': 'Tamamlandı',
        'cancelled': 'İptal Edildi'
    };

    return statusTexts[status] || status;
}

// Fiş yazdır
function printReceipt(order) {
    // Fiş içeriğini oluştur
    const receiptContent = `
        <div class="p-4">
            <div class="text-center mb-4">
                <h2 class="text-xl font-bold">RestaurantApp</h2>
                <p>Adisyon Fişi</p>
            </div>

            <div class="mb-4">
                <div class="flex justify-between">
                    <span>Tarih:</span>
                    <span>${order.date}</span>
                </div>
                <div class="flex justify-between">
                    <span>Saat:</span>
                    <span>${order.time}</span>
                </div>
                <div class="flex justify-between">
                    <span>Masa:</span>
                    <span>${order.tableNumber}</span>
                </div>
                <div class="flex justify-between">
                    <span>Garson:</span>
                    <span>${order.waiter}</span>
                </div>
                <div class="flex justify-between">
                    <span>Sipariş No:</span>
                    <span>${order.id}</span>
                </div>
            </div>

            <div class="border-t border-b border-gray-300 py-2 mb-4">
                <div class="flex justify-between font-medium">
                    <span>Ürün</span>
                    <div class="flex">
                        <span class="w-16 text-center">Adet</span>
                        <span class="w-20 text-right">Tutar</span>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                ${order.items.map(item => `
                    <div class="flex justify-between mb-1">
                        <span>${item.name}</span>
                        <div class="flex">
                            <span class="w-16 text-center">${item.quantity}</span>
                            <span class="w-20 text-right">${(item.price * item.quantity).toFixed(2)} ₺</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="border-t border-gray-300 pt-2 mb-4">
                <div class="flex justify-between font-bold">
                    <span>TOPLAM</span>
                    <span>${order.total.toFixed(2)} ₺</span>
                </div>
            </div>

            <div class="text-center text-sm mt-8">
                <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
                <p>RestaurantApp</p>
            </div>
        </div>
    `;

    // Yazdırma penceresini aç
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Adisyon Fişi - Masa ${order.tableNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .p-4 { padding: 16px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-1 { margin-bottom: 4px; }
                .mt-8 { margin-top: 32px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-xl { font-size: 20px; }
                .text-sm { font-size: 10px; }
                .font-bold { font-weight: bold; }
                .font-medium { font-weight: 500; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .border-t { border-top: 1px solid #ccc; }
                .border-b { border-bottom: 1px solid #ccc; }
                .border-gray-300 { border-color: #ccc; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .pt-2 { padding-top: 8px; }
                .w-16 { width: 64px; }
                .w-20 { width: 80px; }

                @media print {
                    body { width: 80mm; margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `);

    showToast('Fiş yazdırılıyor...');
}

// Oturum kontrolü
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // Kullanıcı bilgilerini güncelle
        appState.currentUser = user;
        elements.userName.textContent = user.fullName;
        elements.userRole.textContent = user.role === 'waiter' ? 'Garson' :
                                         user.role === 'kitchen' ? 'Mutfak' : 'Kasiyer';

        // Veritabanı ile senkronizasyon yap ve gerçek zamanlı bağlantıyı başlat
        syncDatabaseWithApp().then(() => {
            console.log('Uygulama başarıyla senkronize edildi');
        }).catch(err => {
            console.error('Senkronizasyon hatası:', err);

            // Hata durumunda verileri doğrudan yükle
            loadTablesFromSupabase();
            loadOrdersFromSupabase();
            loadMenuItemsFromSupabase();

            // Gerçek zamanlı bağlantıyı başlat
            initRealtimeConnection(user.role, user.fullName);
        });

        // Ekranı kullanıcı rolüne göre göster
        showAppInterface();
    } else {
        // Giriş ekranını göster
        showLoginScreen();
    }
}

// Giriş ekranını göster
function showLoginScreen() {
    elements.loginScreen.classList.remove('hidden');
    elements.appContainer.classList.add('hidden');

    // Giriş bilgilerini temizle
    elements.username.value = '';
    elements.password.value = '';
    elements.loginError.classList.add('hidden');
    elements.loginError.textContent = '';
}

// Giriş fonksiyonu
async function login() {
    const username = elements.username.value.trim();
    const password = elements.password.value.trim();
    const role = elements.roleSelect.value;

    if (!username || !password) {
        showLoginError('Lütfen kullanıcı adı ve şifre girin');
        return;
    }

    try {
        console.log('Giriş isteği:', username, role);

        // Önce Supabase'den kullanıcıları kontrol et
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username);

        if (error) {
            console.error('Giriş hatası:', error);
            showLoginError('Giriş sırasında bir hata oluştu');
            return;
        }

        console.log('Bulunan kullanıcılar:', users);

        // Kullanıcıyı bul
        const user = users && users.length > 0 ? users.find(u => u.role === role) : null;

        let isValid = false;
        let fullName = '';
        let userId = null;

        // Supabase'de kullanıcı varsa
        if (user && user.password === password) {
            console.log('Supabase kullanıcısı doğrulandı:', user.name);
            isValid = true;
            fullName = user.name;
            userId = user.id;
        } else {
            // Yerel doğrulama - gerçek uygulamada kaldırılacak
            console.log('Yerel doğrulama deneniyor...');
            if ((role === 'waiter' && username === 'garson1' && password === 'garson1') ||
                (role === 'kitchen' && username === 'mutfak1' && password === 'mutfak1') ||
                (role === 'cashier' && username === 'kasiyer1' && password === 'kasiyer1')) {
                isValid = true;
                fullName = role === 'waiter' ? 'Ahmet Yılmaz' :
                           role === 'kitchen' ? 'Mehmet Şef' : 'Ayşe Kasa';
                userId = null;
            }

            // Kullanıcı veritabanında yoksa ekle
            if (isValid && (!users || users.length === 0)) {
                try {
                    const insertData = {
                            username,
                            password,
                            name: fullName,
                        role
                    };
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert(insertData);

                    if (insertError) {
                        console.error('Kullanıcı kaydedilirken hata:', insertError);
                    } else {
                        console.log('Kullanıcı veritabanına kaydedildi');
                    }
                } catch (err) {
                    console.error('Kullanıcı kaydedilirken hata:', err);
                }
            }
        }

        if (isValid) {
            console.log('Giriş başarılı:', role, fullName);

            // Kullanıcı bilgilerini kaydet
            const userData = {
                username,
                role,
                fullName,
                id: userId
            };

            localStorage.setItem('user', JSON.stringify(userData));
            appState.currentUser = userData;

            // Kullanıcı bilgilerini ekrana yaz
            elements.userName.textContent = fullName;
            elements.userRole.textContent = role === 'waiter' ? 'Garson' :
                                         role === 'kitchen' ? 'Mutfak' : 'Kasiyer';

            // Veritabanı ile senkronizasyon yap ve gerçek zamanlı bağlantıyı başlat
            syncDatabaseWithApp().then(() => {
                console.log('Giriş sonrası uygulama başarıyla senkronize edildi');

                // Giriş ekranını gizle ve uygulama ekranını göster
                elements.loginScreen.classList.add('hidden');
                elements.appContainer.classList.remove('hidden');

                // Ekranı kullanıcı rolüne göre göster
                showAppInterface();
            }).catch(err => {
                console.error('Giriş sonrası senkronizasyon hatası:', err);

                // Hata durumunda verileri doğrudan yükle
                loadTablesFromSupabase();
                loadOrdersFromSupabase();
                loadMenuItemsFromSupabase();

                // Gerçek zamanlı bağlantıyı başlat
                initRealtimeConnection(role, fullName);

                // Giriş ekranını gizle ve uygulama ekranını göster
                elements.loginScreen.classList.add('hidden');
                elements.appContainer.classList.remove('hidden');

                // Ekranı kullanıcı rolüne göre göster
                showAppInterface();
            });
        } else {
            showLoginError('Kullanıcı adı, şifre veya rol yanlış');
        }
    } catch (err) {
        console.error('Giriş hatası:', err);
        showLoginError('Giriş sırasında bir hata oluştu');
    }
}

// ... existing code ...
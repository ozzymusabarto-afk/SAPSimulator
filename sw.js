/**
 * Nexus ERP Lab • Progressive Web App Service Worker
 * Arquivo: sw.js
 * 
 * Infraestrutura estrita de cache estático e resiliência offline.
 * REGRA ARQUITETURAL: Não contém regras de negócio, dados de missões ou sincronização em nuvem.
 */

const CACHE_NAME = 'nexus-erp-lab-v3';

const STATIC_PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/main.css',
  './css/sidebar.css',
  './css/topbar.css',
  './css/process-stepper.css',
  './css/mentor-dock.css',
  './css/transactions.css',
  './css/modal.css',
  './css/dashboard.css',
  './css/journey-views.css',
  './css/auth.css',
  './js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './assets/icons/favicon.png',
  './assets/images/chief_wilson.jpg'
];

// 1. Instalação: pré-carrega recursos estáticos essenciais com validação estrita de MIME
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const item of STATIC_PRECACHE) {
        try {
          const req = item.endsWith('.css')
            ? new Request(item, { headers: { 'Accept': 'text/css,*/*;q=0.1' } })
            : new Request(item);
          const res = await fetch(req);
          if (res && res.status === 200) {
            const ct = res.headers.get('content-type') || '';
            // Proteção contra envenenamento em dev Vite: nunca cachear CSS com MIME JavaScript
            if (item.endsWith('.css') && (ct.includes('javascript') || !ct.includes('css'))) {
              console.warn('[ServiceWorker] Ignorando precache de CSS servido como JavaScript pelo Vite:', item);
              continue;
            }
            await cache.put(item, res);
          }
        } catch (err) {
          console.warn('[ServiceWorker] Aviso ao pré-carregar item:', item, err);
        }
      }
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Ativação: remove caches legados (incluindo nexus-erp-lab-v1) e assume controle imediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Purgando cache legado:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Interceptação de requisições: Cache First seguro para assets, bypass para HMR e Network First para navegação
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Apenas métodos GET são tratados
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Bypass total para módulos e rotas internas do Vite Dev Server e HMR
  if (
    url.pathname.startsWith('/@') ||
    url.search.includes('direct') ||
    url.search.includes('t=')
  ) {
    return;
  }

  // 2. Navegação de páginas HTML: tenta rede, fallback para cache index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('./index.html').then((response) => {
          return response || caches.match('./');
        });
      })
    );
    return;
  }

  // 3. Recursos da mesma origem (CSS, JS, Imagens, Fontes)
  if (url.origin === self.location.origin) {
    const isJs = request.destination === 'script' || url.pathname.endsWith('.js');
    const isCss = request.destination === 'style' || url.pathname.endsWith('.css');

    // Scripts JavaScript: Network First com fallback para cache offline (impede retenção de código desatualizado)
    if (isJs) {
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => caches.match(request))
      );
      return;
    }

    // Demais ativos (CSS, Imagens, Fontes): Cache First com validação de MIME
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          const ct = cachedResponse.headers.get('content-type') || '';
          // Se for requisição de estilo mas o cache contiver JavaScript, invalida a entrada corrompida
          if (isCss && (ct.includes('javascript') || !ct.includes('css'))) {
            console.warn('[ServiceWorker] Entrada de CSS corrompida no cache. Excluindo e buscando da rede:', url.pathname);
            caches.open(CACHE_NAME).then((cache) => cache.delete(request));
          } else {
            return cachedResponse;
          }
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const ct = networkResponse.headers.get('content-type') || '';
            // Nunca salvar respostas de CSS no cache se o servidor responder como JavaScript
            if (!isCss || (!ct.includes('javascript') && ct.includes('css'))) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
          }
          return networkResponse;
        }).catch((err) => {
          return cachedResponse || Promise.reject(err);
        });
      })
    );
  }
});

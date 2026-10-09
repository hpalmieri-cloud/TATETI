const CACHE = "tateti-v1";
const ARCHIVOS = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

// Al instalar: guardar los archivos del juego para usarlos sin conexión.
self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ARCHIVOS);
    })
  );
  self.skipWaiting();
});

// Al activar: borrar copias viejas.
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(
        claves
          .filter(function (clave) { return clave !== CACHE; })
          .map(function (clave) { return caches.delete(clave); })
      );
    })
  );
  self.clients.claim();
});

// Al pedir un archivo: primero internet (para tener siempre la última versión);
// si no hay conexión, usar la copia guardada.
self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then(function (respuesta) {
        const copia = respuesta.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(evento.request, copia);
        });
        return respuesta;
      })
      .catch(function () {
        return caches.match(evento.request);
      })
  );
});

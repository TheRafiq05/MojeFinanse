    <!-- Rejestracja Service Workera (PWA / Offline) -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('ServiceWorker zarejestrowany pomyślnie!');
                    })
                    .catch(err => {
                        console.log('Błąd rejestracji ServiceWorkera: ', err);
                    });
            });
        }
    </script>

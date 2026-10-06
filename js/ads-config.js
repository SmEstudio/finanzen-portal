/**
 * ==============================================================================
 * FinanZen - Configuración Centralizada de Google AdSense
 * ==============================================================================
 * Instrucciones:
 * 1. Para activar anuncios reales:
 *    - Cambia `enabled: true`
 *    - Coloca tu Publisher ID en `client` (ejemplo: 'ca-pub-1234567890123456')
 *    - Asigna los IDs de tus bloques de anuncios en `slots`
 * 2. Si `enabled: false`, el sitio mostrará elegantes contenedores reservados de
 *    prueba cumpliendo con la política de etiquetas "PUBLICIDAD" de Google.
 */

const ADS_CONFIG = {
  // Tu identificador de editor de Google AdSense
  client: "ca-pub-XXXXXXXXXXXXXXXX",
  
  // Activar anuncios reales (true) o modo maquetación previa (false)
  enabled: false,

  // IDs de los bloques de anuncios creados en tu panel de Google AdSense
  slots: {
    header: "0000000001",    // Banner superior (728x90 o responsivo)
    inArticle: "0000000002", // Banner dentro del contenido
    sidebar: "0000000003",   // Banner lateral (300x250 / 300x600)
    footer: "0000000004"     // Banner antes del pie de página
  }
};

// Función para inicializar anuncios de forma segura
function initAdSense() {
  const adContainers = document.querySelectorAll('.ad-box[data-ad-slot]');
  
  if (!ADS_CONFIG.enabled || ADS_CONFIG.client.includes('XXXXXXXX')) {
    // Modo demostración / Maqueta de diseño
    adContainers.forEach(container => {
      const slotType = container.getAttribute('data-ad-slot');
      let sizeText = "Banner Responsivo";
      if (slotType === 'header') sizeText = "Banner Superior (728x90 / Responsivo)";
      if (slotType === 'sidebar') sizeText = "Banner Lateral (300x250 / 300x600)";
      if (slotType === 'inArticle') sizeText = "Anuncio en Artículo (Responsivo Nativo)";
      if (slotType === 'footer') sizeText = "Banner Inferior (728x90 / 970x90)";

      container.innerHTML = `
        <div class="ad-placeholder-text">
          <strong>Espacio Publicitario AdSense</strong><br>
          <small>${sizeText}</small><br>
          <span style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px; display: inline-block;">Configurable en js/ads-config.js</span>
        </div>
      `;
    });
    return;
  }

  // Cargar script oficial de AdSense si no está cargado
  if (!document.getElementById('adsense-script')) {
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  // Renderizar bloques de anuncios reales
  adContainers.forEach(container => {
    const slotKey = container.getAttribute('data-ad-slot');
    const slotId = ADS_CONFIG.slots[slotKey] || "";

    container.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADS_CONFIG.client}"
           data-ad-slot="${slotId}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error:", e);
    }
  });
}

document.addEventListener('DOMContentLoaded', initAdSense);

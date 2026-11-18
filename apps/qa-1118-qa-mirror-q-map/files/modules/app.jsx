import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Callout } from 'tremor';

const LONDON = [51.5074, -0.1278];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function markerIcon() {
  // Colors route through the ana-tokens CSS custom properties (resolved at
  // paint time) rather than literal hex/rgba, so the pin re-tints with the
  // org's brand accent and theme instead of bypassing it.
  return window.L.divIcon({
    className: '',
    html:
      '<div style="width:14px;height:14px;border-radius:9999px;' +
      'background:var(--accent);border:2px solid var(--bg-surface);' +
      'box-shadow:0 0 0 1px var(--border-strong);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
}

// Mounts a Leaflet map (window.L, loaded as a classic script) into the given
// ref, with one OpenStreetMap standard tile layer and a marker at London.
// Returns the tile-provider status: 'pending' | 'ok' | 'blocked'.
function useLondonMap(containerRef) {
  const [tileStatus, setTileStatus] = useState('pending');

  useEffect(() => {
    if (!containerRef.current || !window.L) {
      setTileStatus('blocked');
      return undefined;
    }

    const map = window.L.map(containerRef.current, {
      center: LONDON,
      zoom: 11,
      scrollWheelZoom: false,
    });

    const tileLayer = window.L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    window.L.marker(LONDON, { icon: markerIcon() }).addTo(map).bindPopup('London').openPopup();

    let loadedOk = false;

    // 'tileload' fires per tile on success; 'tileerror' per tile on
    // failure. (The layer-level 'load' event fires once ALL requests have
    // settled, success or failure, so it is not a success signal.) A single
    // successful tile proves the provider is reachable; a failed tile before
    // any success is shown as blocked right away, and self-corrects the
    // moment a tile does load.
    const handleLoad = () => {
      loadedOk = true;
      setTileStatus('ok');
    };
    const handleError = () => {
      if (!loadedOk) setTileStatus('blocked');
    };

    tileLayer.on('tileload', handleLoad);
    tileLayer.on('tileerror', handleError);

    return () => {
      tileLayer.off('tileload', handleLoad);
      tileLayer.off('tileerror', handleError);
      map.remove();
    };
  }, [containerRef]);

  return tileStatus;
}

function TileBlockedNotice() {
  return (
    <Callout className="mt-4" title="Map tiles are blocked" color="red">
      The OpenStreetMap tile provider (tile.openstreetmap.org) could not be reached, so the
      basemap could not load. Ask your network administrator to allow outbound access to
      *.tile.openstreetmap.org, then reload this app. The marker at London will appear once
      tiles can load.
    </Callout>
  );
}

function App() {
  const mapRef = useRef(null);
  const tileStatus = useLondonMap(mapRef);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">qa-1118-qa-mirror-q-map</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">London map</h1>
      <p className="mt-1 text-sm text-gray-500">
        A synthetic Leaflet map on OpenStreetMap standard tiles with a marker at London. No
        connector data is used.
      </p>

      {tileStatus === 'blocked' ? <TileBlockedNotice /> : null}

      <div className="mt-6 border border-gray-200">
        <div ref={mapRef} className="h-96 w-full" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

// Note: In a real application, you would get this from environment variables
// For now, we'll show a placeholder that explains how to set up Mapbox
const MAPBOX_TOKEN = 'your-mapbox-token-here';

interface ParkingSlot {
  id: string;
  name: string;
  distance: number;
  available: number;
  total: number;
  price: number;
  location: { lat: number; lng: number };
  features: string[];
}

interface MapComponentProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
}

const MapComponent = ({ slots, selectedSlot }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if Mapbox token is configured
    if (MAPBOX_TOKEN === 'your-mapbox-token-here') {
      return; // Will show the setup instructions
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: selectedSlot ? [selectedSlot.location.lng, selectedSlot.location.lat] : [-74.0060, 40.7128],
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for parking slots
      slots.forEach((slot) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'parking-marker';
        markerElement.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${slot.available > 10 ? '#22c55e' : slot.available > 0 ? '#f59e0b' : '#ef4444'};
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        `;
        markerElement.textContent = slot.available.toString();

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${slot.name}</h3>
            <p style="margin: 0 0 3px 0;">Available: ${slot.available}/${slot.total}</p>
            <p style="margin: 0 0 3px 0;">Price: $${slot.price}/hour</p>
            <p style="margin: 0;">Distance: ${slot.distance} km</p>
          </div>
        `);

        new mapboxgl.Marker(markerElement)
          .setLngLat([slot.location.lng, slot.location.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Add route if a slot is selected
      if (selectedSlot) {
        // In a real app, you would use Mapbox Directions API here
        // For demo, we'll just center on the selected slot
        map.current.flyTo({
          center: [selectedSlot.location.lng, selectedSlot.location.lat],
          zoom: 15,
          duration: 2000
        });
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [slots, selectedSlot]);

  // Show setup instructions if Mapbox token is not configured
  if (MAPBOX_TOKEN === 'your-mapbox-token-here') {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Setup Required
          </CardTitle>
          <CardDescription>
            To enable the interactive map, please configure your Mapbox access token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> and create an account</li>
              <li>Get your public access token from the dashboard</li>
              <li>Replace the MAPBOX_TOKEN in MapComponent.tsx with your token</li>
            </ol>
          </div>
          
          {/* Mock map preview */}
          <div className="bg-secondary rounded-lg p-8 text-center">
            <div className="space-y-4">
              <Navigation className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Interactive Map Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Your parking locations will appear here once Mapbox is configured
                </p>
              </div>
              {selectedSlot && (
                <div className="bg-card p-3 rounded border border-primary/20">
                  <p className="font-medium">{selectedSlot.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSlot.distance} km away • {selectedSlot.available} spots available
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[500px] rounded-lg shadow-lg" />
      {selectedSlot && (
        <div className="absolute top-4 left-4 bg-card p-3 rounded-lg shadow-lg border border-primary/20">
          <h3 className="font-semibold">{selectedSlot.name}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedSlot.distance} km away • {selectedSlot.available} spots available
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
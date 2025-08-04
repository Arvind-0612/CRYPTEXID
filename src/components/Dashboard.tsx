import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Mic, MicOff, Search, Car, Navigation, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MapComponent from "./MapComponent";
import VoiceAssistant from "./VoiceAssistant";

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

interface DashboardProps {
  user: { username: string; vehicleNumber: string };
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<"nearby" | "search" | "map">("nearby");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVehicleSecure, setIsVehicleSecure] = useState(true);
  const { toast } = useToast();

  // Mock parking data
  const [parkingSlots] = useState<ParkingSlot[]>([
    {
      id: "p1",
      name: "Central Mall Parking",
      distance: 0.2,
      available: 45,
      total: 100,
      price: 2.5,
      location: { lat: 40.7128, lng: -74.0060 },
      features: ["Covered", "Security", "EV Charging"]
    },
    {
      id: "p2", 
      name: "City Center Plaza",
      distance: 0.5,
      available: 23,
      total: 80,
      price: 3.0,
      location: { lat: 40.7589, lng: -73.9851 },
      features: ["24/7 Access", "CCTV", "Valet"]
    },
    {
      id: "p3",
      name: "Business District Hub",
      distance: 0.8,
      available: 67,
      total: 150,
      price: 4.0,
      location: { lat: 40.7505, lng: -73.9934 },
      features: ["Premium", "Wash Service", "Security"]
    },
    {
      id: "p4",
      name: "Metro Station Parking",
      distance: 1.2,
      available: 12,
      total: 60,
      price: 1.5,
      location: { lat: 40.7282, lng: -73.9942 },
      features: ["Budget", "Transit Access"]
    }
  ]);

  // Security monitoring simulation
  useEffect(() => {
    const securityCheck = setInterval(() => {
      // Simulate random security alert (for demo)
      if (Math.random() < 0.01 && selectedSlot) { // 1% chance every interval
        setIsVehicleSecure(false);
        toast({
          title: "🚨 Security Alert!",
          description: `Unauthorized movement detected for vehicle ${user.vehicleNumber} in ${selectedSlot.name}`,
          variant: "destructive",
        });
      }
    }, 5000);

    return () => clearInterval(securityCheck);
  }, [selectedSlot, user.vehicleNumber, toast]);

  const filteredSlots = parkingSlots.filter(slot =>
    slot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsVehicleSecure(true);
    toast({
      title: "🎉 Slot Booked Successfully!",
      description: `Your parking spot at ${slot.name} has been reserved. Vehicle ${user.vehicleNumber} is now being monitored.`,
    });
  };

  const handleNavigate = (slot: ParkingSlot) => {
    setCurrentView("map");
    setSelectedSlot(slot);
    toast({
      title: "🗺️ Navigation Started",
      description: `Routing to ${slot.name}...`,
    });
  };

  const confirmVehicleMovement = () => {
    setIsVehicleSecure(true);
    toast({
      title: "✅ Movement Confirmed",
      description: "Vehicle movement has been authorized.",
    });
  };

  const renderParkingSlots = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredSlots.map((slot) => (
        <Card key={slot.id} className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{slot.name}</CardTitle>
              <Badge 
                variant={slot.available > 10 ? "default" : slot.available > 0 ? "secondary" : "destructive"}
                className={slot.available > 10 ? "bg-parking-available" : ""}
              >
                {slot.available}/{slot.total}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {slot.distance} km away • ${slot.price}/hour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {slot.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="book" 
                size="sm" 
                className="flex-1"
                onClick={() => handleBookSlot(slot)}
                disabled={slot.available === 0}
              >
                <Car className="h-4 w-4" />
                Book Now
              </Button>
              <Button 
                variant="navigate" 
                size="sm" 
                className="flex-1"
                onClick={() => handleNavigate(slot)}
              >
                <Navigation className="h-4 w-4" />
                Navigate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <div className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Parking System</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.username} | {user.vehicleNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedSlot && (
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${isVehicleSecure ? 'bg-parking-available' : 'bg-parking-occupied animate-pulse'}`} />
                  <span className="text-sm">
                    {isVehicleSecure ? 'Vehicle Secure' : 'Security Alert!'}
                  </span>
                  {!isVehicleSecure && (
                    <Button variant="outline" size="sm" onClick={confirmVehicleMovement}>
                      <Shield className="h-4 w-4" />
                      Confirm
                    </Button>
                  )}
                </div>
              )}
              <VoiceAssistant 
                isListening={isListening}
                onToggleListening={setIsListening}
                onCommand={(command) => {
                  if (command.includes('nearby') || command.includes('slots')) {
                    setCurrentView('nearby');
                  } else if (command.includes('search')) {
                    setCurrentView('search');
                  } else if (command.includes('map') || command.includes('navigate')) {
                    setCurrentView('map');
                  }
                }}
              />
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant={currentView === "nearby" ? "parking" : "outline"} 
            onClick={() => setCurrentView("nearby")}
          >
            <MapPin className="h-4 w-4" />
            Nearby Slots
          </Button>
          <Button 
            variant={currentView === "search" ? "parking" : "outline"} 
            onClick={() => setCurrentView("search")}
          >
            <Search className="h-4 w-4" />
            Search Slots
          </Button>
          <Button 
            variant={currentView === "map" ? "parking" : "outline"} 
            onClick={() => setCurrentView("map")}
          >
            <Navigation className="h-4 w-4" />
            Map View
          </Button>
        </div>

        {/* Search Bar for Search View */}
        {currentView === "search" && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === "map" ? (
          <div className="space-y-4">
            {selectedSlot && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Navigating to {selectedSlot.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedSlot.distance} km away • {selectedSlot.available} spots available
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            <MapComponent slots={parkingSlots} selectedSlot={selectedSlot} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {currentView === "nearby" ? "Nearby Parking Slots" : "Search Results"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            {renderParkingSlots()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
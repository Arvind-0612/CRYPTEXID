
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Mic, MicOff, Search, Car, Navigation, Clock, Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
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

interface SecurityAlert {
  id: string;
  type: 'movement' | 'tamper' | 'emergency';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
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
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isVehicleParked, setIsVehicleParked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<ParkingSlot | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SecurityAlert | null>(null);
  const [lastMovement, setLastMovement] = useState<Date | null>(null);
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

  // Enhanced security monitoring with real-time simulation
  useEffect(() => {
    if (!isVehicleParked || !selectedSlot) return;

    const securityInterval = setInterval(() => {
      const now = new Date();
      
      // Simulate various security scenarios
      const scenarios = [
        { type: 'movement', chance: 0.02, severity: 'medium', message: 'Unauthorized vehicle movement detected' },
        { type: 'tamper', chance: 0.01, severity: 'high', message: 'Vehicle tampering attempt detected' },
        { type: 'emergency', chance: 0.005, severity: 'high', message: 'Emergency button pressed in parking area' }
      ];

      scenarios.forEach(scenario => {
        if (Math.random() < scenario.chance) {
          const alert: SecurityAlert = {
            id: `alert_${Date.now()}_${Math.random()}`,
            type: scenario.type as 'movement' | 'tamper' | 'emergency',
            message: `${scenario.message} for vehicle ${user.vehicleNumber} in ${selectedSlot.name}`,
            timestamp: now,
            severity: scenario.severity as 'low' | 'medium' | 'high'
          };

          setSecurityAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
          setCurrentAlert(alert);
          setShowSecurityModal(true);
          setLastMovement(now);

          // Play alert sound and vibrate if supported
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }

          toast({
            title: `🚨 ${scenario.severity.toUpperCase()} SECURITY ALERT!`,
            description: alert.message,
            variant: "destructive",
          });
        }
      });
    }, 3000); // Check every 3 seconds for demo

    return () => clearInterval(securityInterval);
  }, [isVehicleParked, selectedSlot, user.vehicleNumber, toast]);

  const filteredSlots = parkingSlots.filter(slot =>
    slot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookSlot = (slot: ParkingSlot) => {
    setBookingSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (bookingSlot) {
      setSelectedSlot(bookingSlot);
      setIsVehicleParked(true);
      setShowBookingModal(false);
      setSecurityAlerts([]);
      
      // Create initial security confirmation
      const confirmAlert: SecurityAlert = {
        id: `confirm_${Date.now()}`,
        type: 'movement',
        message: `Vehicle ${user.vehicleNumber} successfully parked in ${bookingSlot.name}`,
        timestamp: new Date(),
        severity: 'low'
      };
      setSecurityAlerts([confirmAlert]);

      toast({
        title: "🎉 Slot Booked Successfully!",
        description: `Your parking spot at ${bookingSlot.name} has been reserved. Security monitoring activated.`,
      });
    }
  };

  const handleNavigate = (slot: ParkingSlot) => {
    // Open Google Maps with directions
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${slot.location.lat},${slot.location.lng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
    
    toast({
      title: "🗺️ Navigation Started",
      description: `Opening Google Maps directions to ${slot.name}...`,
    });
  };

  const handleSecurityAction = (action: 'confirm' | 'emergency' | 'dismiss') => {
    if (!currentAlert) return;

    switch (action) {
      case 'confirm':
        toast({
          title: "✅ Movement Confirmed",
          description: "Vehicle movement has been authorized.",
        });
        break;
      case 'emergency':
        toast({
          title: "🚨 Emergency Services Contacted",
          description: "Local security and emergency services have been notified.",
        });
        // In real app, this would contact emergency services
        break;
      case 'dismiss':
        toast({
          title: "Alert Dismissed",
          description: "Security alert has been dismissed.",
        });
        break;
    }
    
    setShowSecurityModal(false);
    setCurrentAlert(null);
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'high') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === 'movement') return <Car className="h-4 w-4 text-yellow-500" />;
    return <Shield className="h-4 w-4 text-blue-500" />;
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
      {/* Booking Modal */}
      {showBookingModal && bookingSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">🎉 Slot Booked!</CardTitle>
              <CardDescription className="text-center">
                Confirm your booking at {bookingSlot.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p><strong>Location:</strong> {bookingSlot.name}</p>
                <p><strong>Distance:</strong> {bookingSlot.distance} km</p>
                <p><strong>Price:</strong> ${bookingSlot.price}/hour</p>
                <p><strong>Available:</strong> {bookingSlot.available} spots</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="book" 
                  className="flex-1" 
                  onClick={confirmBooking}
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Booking
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBookingModal(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Alert Modal */}
      {showSecurityModal && currentAlert && (
        <div className="fixed inset-0 bg-red-900/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-red-500 shadow-2xl animate-pulse">
            <CardHeader className="bg-red-50 dark:bg-red-950">
              <CardTitle className="text-center text-red-700 dark:text-red-300 flex items-center justify-center gap-2">
                {getAlertIcon(currentAlert.type, currentAlert.severity)}
                🚨 SECURITY ALERT
              </CardTitle>
              <CardDescription className="text-center text-red-600 dark:text-red-400">
                {currentAlert.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="text-center text-sm text-muted-foreground">
                <p><strong>Time:</strong> {currentAlert.timestamp.toLocaleTimeString()}</p>
                <p><strong>Severity:</strong> {currentAlert.severity.toUpperCase()}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="default"
                  onClick={() => handleSecurityAction('confirm')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm It's Me
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleSecurityAction('emergency')}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Emergency!
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSecurityAction('dismiss')}
                >
                  <X className="h-4 w-4" />
                  Dismiss Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              {/* Security Status */}
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  !isVehicleParked ? 'bg-gray-400' :
                  securityAlerts.length > 0 && securityAlerts[0].severity !== 'low' 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-green-500'
                }`} />
                <span className="text-sm">
                  {!isVehicleParked ? 'No Vehicle Parked' :
                   securityAlerts.length > 0 && securityAlerts[0].severity !== 'low' 
                     ? 'Security Alert!' 
                     : 'Vehicle Secure'}
                </span>
                {securityAlerts.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {securityAlerts.length}
                  </Badge>
                )}
              </div>

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

      {/* Security Alerts Panel */}
      {securityAlerts.length > 0 && (
        <div className="container mx-auto px-4 pt-4">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Recent Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {securityAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-2 text-xs">
                    {getAlertIcon(alert.type, alert.severity)}
                    <span className="flex-1 truncate">{alert.message}</span>
                    <span className="text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                    Current Parking: {selectedSlot.name}
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

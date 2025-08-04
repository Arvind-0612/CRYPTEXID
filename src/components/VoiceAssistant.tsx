
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  isListening: boolean;
  onToggleListening: (listening: boolean) => void;
  onCommand: (command: string) => void;
}

const VoiceAssistant = ({ isListening, onToggleListening, onCommand }: VoiceAssistantProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<{user: string, assistant: string, timestamp: Date}[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        speak("Voice assistant activated. How can I help you with parking today?");
        toast({
          title: "🎤 Voice Assistant Active",
          description: "Listening for your commands...",
        });
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check microphone permissions",
          variant: "destructive",
        });
        onToggleListening(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        onToggleListening(false);
        setTranscript('');
        setIsProcessing(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onToggleListening, toast]);

  const speak = (text: string, rate: number = 0.9) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.voice = speechSynthesis.getVoices().find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
      ) || speechSynthesis.getVoices()[0];
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    setIsProcessing(true);
    
    let response = '';
    let action = '';
    
    // Enhanced command processing with more natural language understanding
    if (command.includes('nearby') || command.includes('near') || command.includes('close')) {
      onCommand('nearby slots');
      response = "Showing you nearby parking slots with real-time availability";
      action = 'nearby';
    } else if (command.includes('search') || command.includes('find') || command.includes('look for')) {
      onCommand('search');
      response = "Opening search interface. You can search by location name or parking features";
      action = 'search';
    } else if (command.includes('map') || command.includes('navigate') || command.includes('navigation') || command.includes('directions')) {
      onCommand('map');
      response = "Opening interactive map view with navigation capabilities";
      action = 'map';
    } else if (command.includes('book') || command.includes('reserve') || command.includes('slot')) {
      response = "To book a parking slot, please first select a location from the available options, then click the book button";
      action = 'book';
    } else if (command.includes('security') || command.includes('safe') || command.includes('monitor')) {
      response = "Your vehicle security monitoring is active. I'll alert you of any unauthorized movement or suspicious activity";
      action = 'security';
    } else if (command.includes('help') || command.includes('what can you do') || command.includes('commands')) {
      response = "I can help you with: finding nearby parking slots, searching specific locations, navigating with maps, booking reservations, and monitoring your vehicle security. Just speak naturally!";
      action = 'help';
    } else if (command.includes('hello') || command.includes('hi') || command.includes('hey')) {
      response = `Hello ${getUserGreeting()}! I'm your intelligent parking assistant. How can I help you find the perfect parking spot today?`;
      action = 'greeting';
    } else if (command.includes('price') || command.includes('cost') || command.includes('cheap')) {
      response = "I can show you parking options sorted by price. Our rates range from $1.50 to $4.00 per hour";
      action = 'price';
    } else if (command.includes('available') || command.includes('free') || command.includes('open')) {
      response = "Let me show you all currently available parking slots with real-time availability updates";
      action = 'availability';
    } else {
      response = "I understand you're looking for parking assistance. Try saying: 'show nearby slots', 'search parking', 'open map', or 'help with booking'";
      action = 'unknown';
    }

    // Add to conversation history
    const conversationEntry = {
      user: command,
      assistant: response,
      timestamp: new Date()
    };
    setConversation(prev => [conversationEntry, ...prev.slice(0, 4)]); // Keep last 5 conversations

    if (response) {
      speak(response);
      toast({
        title: "🤖 Voice Command Processed",
        description: response,
      });
    }

    // Stop listening after processing command
    setTimeout(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsProcessing(false);
    }, 1000);
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      onToggleListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        onToggleListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Microphone Error",
          description: "Please allow microphone access to use voice commands",
          variant: "destructive",
        });
      }
    }
  };

  const testVoice = () => {
    const testMessage = "Voice assistant is working perfectly! Try saying 'show nearby slots', 'search parking', 'open map', or 'help me book a spot'.";
    speak(testMessage);
    toast({
      title: "🔊 Voice Test",
      description: testMessage,
    });
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={testVoice}>
          <Volume2 className="h-4 w-4" />
          Test Voice
        </Button>
        <span className="text-xs text-muted-foreground">Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      <Button 
        variant={isListening ? "voice" : "outline"} 
        size="sm" 
        onClick={toggleListening}
        className={isListening || isProcessing ? "animate-pulse" : ""}
        disabled={isProcessing}
      >
        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Assistant'}
      </Button>
      
      {transcript && (
        <div className="text-xs text-muted-foreground max-w-32 truncate bg-muted px-2 py-1 rounded">
          "{transcript}"
        </div>
      )}
      
      <Button variant="ghost" size="sm" onClick={testVoice}>
        <Volume2 className="h-4 w-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowConversation(!showConversation)}
        className="relative"
      >
        <MessageCircle className="h-4 w-4" />
        {conversation.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-xs rounded-full h-4 w-4 flex items-center justify-center text-primary-foreground">
            {conversation.length}
          </span>
        )}
      </Button>

      {/* Conversation History */}
      {showConversation && conversation.length > 0 && (
        <Card className="absolute top-full right-0 mt-2 w-80 max-h-60 overflow-y-auto z-10 shadow-lg">
          <CardContent className="p-3 space-y-2">
            <h4 className="font-semibold text-sm">Recent Conversations</h4>
            {conversation.map((conv, index) => (
              <div key={index} className="space-y-1 text-xs border-b pb-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>You:</span>
                  <span>{conv.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="bg-muted p-2 rounded italic">"{conv.user}"</p>
                <div className="text-muted-foreground">Assistant:</div>
                <p className="bg-primary/10 p-2 rounded">{conv.assistant}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceAssistant;

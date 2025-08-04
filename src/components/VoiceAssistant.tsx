import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        speak("Voice assistant activated. How can I help you with parking?");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
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
      };

      recognition.onend = () => {
        onToggleListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onToggleListening, toast]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    
    let response = '';
    
    if (command.includes('nearby') || command.includes('near')) {
      onCommand('nearby slots');
      response = "Showing nearby parking slots";
    } else if (command.includes('search') || command.includes('find')) {
      onCommand('search');
      response = "Opening search for parking slots";
    } else if (command.includes('map') || command.includes('navigate') || command.includes('navigation')) {
      onCommand('map');
      response = "Opening map view for navigation";
    } else if (command.includes('book') || command.includes('reserve')) {
      response = "Please select a parking slot to book";
    } else if (command.includes('help')) {
      response = "You can say: show nearby slots, search parking, open map, or book a slot";
    } else if (command.includes('hello') || command.includes('hi')) {
      response = "Hello! I'm your parking assistant. How can I help you find a parking spot?";
    } else {
      response = "I didn't understand that. Try saying: nearby slots, search parking, or open map";
    }

    if (response) {
      speak(response);
      toast({
        title: "Voice Command Processed",
        description: response,
      });
    }

    // Stop listening after processing command
    setTimeout(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    }, 1000);
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
    speak("Voice assistant is working perfectly! You can ask me to show nearby slots, search for parking, or open the map view.");
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
    <div className="flex items-center gap-2">
      <Button 
        variant={isListening ? "voice" : "outline"} 
        size="sm" 
        onClick={toggleListening}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        {isListening ? 'Listening...' : 'Voice Assistant'}
      </Button>
      
      {transcript && (
        <div className="text-xs text-muted-foreground max-w-32 truncate">
          "{transcript}"
        </div>
      )}
      
      <Button variant="ghost" size="sm" onClick={testVoice}>
        <Volume2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VoiceAssistant;
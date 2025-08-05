import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Upload, 
  User, 
  FileText, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Link2,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CryptexDashboardProps {
  onNavigate: (page: string) => void;
}

interface VerificationResult {
  imageScore: number;
  textScore: number;
  overallScore: number;
  isVerified: boolean;
  riskFactors: string[];
  blockchainHash?: string;
}

export function CryptexDashboard({ onNavigate }: CryptexDashboardProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileText, setProfileText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      toast({
        title: "Image Uploaded",
        description: `${file.name} ready for analysis`,
      });
    }
  };

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Simulate AI results
          const imageScore = Math.random() * 100;
          const textScore = Math.random() * 100;
          const overallScore = (imageScore + textScore) / 2;
          const isVerified = overallScore > 70;
          
          const riskFactors = [];
          if (imageScore < 50) riskFactors.push("Potential deepfake detected");
          if (textScore < 50) riskFactors.push("AI-generated text patterns");
          if (overallScore < 30) riskFactors.push("High bot-like behavior");
          
          const result: VerificationResult = {
            imageScore,
            textScore,
            overallScore,
            isVerified,
            riskFactors,
            blockchainHash: isVerified ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined
          };
          
          setVerificationResult(result);
          setIsAnalyzing(false);
          
          toast({
            title: isVerified ? "Verification Complete" : "Verification Failed",
            description: isVerified ? "Profile verified and stored on blockchain" : "Profile flagged as potentially fake",
            variant: isVerified ? "default" : "destructive"
          });
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleVerification = () => {
    if (!profileImage && !profileText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload an image or enter profile text",
        variant: "destructive"
      });
      return;
    }
    
    simulateAIAnalysis();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/10 text-green-500">High Trust</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500/10 text-yellow-500">Medium Trust</Badge>;
    return <Badge className="bg-red-500/10 text-red-500">Low Trust</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold">CryptexID Dashboard</h1>
              <p className="text-muted-foreground">Verify your digital identity</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigate('landing')}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Profile Image
                </CardTitle>
                <CardDescription>
                  Upload your profile picture for deepfake analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="image-upload">Select Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {profileImage && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {profileImage.name} uploaded
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Text */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Enter your bio or profile description for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="profile-text">Bio/Description</Label>
                  <Textarea
                    id="profile-text"
                    placeholder="Tell us about yourself, your interests, background..."
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    {profileText.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Button */}
            <Button
              onClick={handleVerification}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Cpu className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Cpu className="h-5 w-5 mr-2" />
                  Start Verification
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>AI Analysis in Progress</CardTitle>
                  <CardDescription>
                    Running multiple verification algorithms...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={analysisProgress} className="mb-4" />
                  <div className="text-sm text-muted-foreground">
                    {analysisProgress < 30 && "Analyzing image authenticity..."}
                    {analysisProgress >= 30 && analysisProgress < 60 && "Checking text patterns..."}
                    {analysisProgress >= 60 && analysisProgress < 90 && "Cross-referencing databases..."}
                    {analysisProgress >= 90 && "Finalizing verification..."}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Results */}
            {verificationResult && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {verificationResult.isVerified ? (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    )}
                    Verification Results
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of your digital identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center p-4 border border-border/50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(verificationResult.overallScore)}`}>
                      {verificationResult.overallScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Overall Trust Score</div>
                    {getScoreBadge(verificationResult.overallScore)}
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border border-border/50 rounded">
                      <div className={`text-xl font-semibold ${getScoreColor(verificationResult.imageScore)}`}>
                        {verificationResult.imageScore.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Image Authenticity</div>
                    </div>
                    <div className="text-center p-3 border border-border/50 rounded">
                      <div className={`text-xl font-semibold ${getScoreColor(verificationResult.textScore)}`}>
                        {verificationResult.textScore.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Text Authenticity</div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {verificationResult.riskFactors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        Risk Factors Detected
                      </div>
                      {verificationResult.riskFactors.map((risk, index) => (
                        <div key={index} className="text-sm text-muted-foreground ml-6">
                          • {risk}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blockchain Hash */}
                  {verificationResult.blockchainHash && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium">
                        <Link2 className="h-4 w-4 mr-2 text-green-500" />
                        Blockchain Record
                      </div>
                      <div className="text-xs font-mono bg-muted p-2 rounded border break-all">
                        {verificationResult.blockchainHash}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('blockchain')}
                        className="w-full"
                      >
                        View on Blockchain
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {!verificationResult && !isAnalyzing && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>How Verification Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Upload a clear profile picture for deepfake detection analysis</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Provide bio/description text for AI-generated content detection</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Our AI analyzes authenticity using multiple verification models</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Verified identities are stored securely on blockchain</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
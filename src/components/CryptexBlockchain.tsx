import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ArrowLeft, 
  Link2, 
  CheckCircle, 
  Clock, 
  User, 
  Hash,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CryptexBlockchainProps {
  onNavigate: (page: string) => void;
}

interface BlockchainRecord {
  id: string;
  hash: string;
  userId: string;
  userName: string;
  trustScore: number;
  timestamp: string;
  verificationData: {
    imageVerified: boolean;
    textVerified: boolean;
    biometricHash: string;
  };
  blockNumber: number;
  gasUsed: string;
  transactionId: string;
}

export function CryptexBlockchain({ onNavigate }: CryptexBlockchainProps) {
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching blockchain records
    setTimeout(() => {
      const mockRecords: BlockchainRecord[] = [
        {
          id: '1',
          hash: '0xa1b2c3d4e5f6789012345678901234567890abcd',
          userId: 'user_001',
          userName: 'John Doe',
          trustScore: 95,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          verificationData: {
            imageVerified: true,
            textVerified: true,
            biometricHash: '0x123456789abcdef'
          },
          blockNumber: 18453621,
          gasUsed: '0.0023 ETH',
          transactionId: '0xdef456789012345678901234567890123456789012345678901234567890abcd'
        },
        {
          id: '2',
          hash: '0xef789012345678901234567890abcdef12345678',
          userId: 'user_002',
          userName: 'Jane Smith',
          trustScore: 88,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          verificationData: {
            imageVerified: true,
            textVerified: false,
            biometricHash: '0x987654321fedcba'
          },
          blockNumber: 18453589,
          gasUsed: '0.0021 ETH',
          transactionId: '0x123789012345678901234567890123456789012345678901234567890abcdef'
        }
      ];
      
      setBlockchainRecords(mockRecords);
      setIsLoading(false);
    }, 1500);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTrustBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500/10 text-green-500">Highly Trusted</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500/10 text-blue-500">Trusted</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500/10 text-yellow-500">Verified</Badge>;
    return <Badge className="bg-red-500/10 text-red-500">Low Trust</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blockchain records...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center">
              <Link2 className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-3xl font-bold">Blockchain Records</h1>
                <p className="text-muted-foreground">Immutable identity verification ledger</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">2,847</div>
              <div className="text-sm text-muted-foreground">Total Verifications</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-500">98.3%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-500">18,453,621</div>
              <div className="text-sm text-muted-foreground">Latest Block</div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Records */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Verifications</h2>
          
          {blockchainRecords.map((record) => (
            <Card key={record.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Verification Record
                  </CardTitle>
                  {getTrustBadge(record.trustScore)}
                </div>
                <CardDescription>
                  Block #{record.blockNumber} • {formatTimestamp(record.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <User className="h-4 w-4 mr-2" />
                      User Information
                    </div>
                    <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                      <div>Name: {record.userName}</div>
                      <div>User ID: {record.userId}</div>
                      <div>Trust Score: {record.trustScore}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Shield className="h-4 w-4 mr-2" />
                      Verification Status
                    </div>
                    <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        {record.verificationData.imageVerified ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 mr-2 rounded-full bg-red-500" />
                        )}
                        Image Verified
                      </div>
                      <div className="flex items-center">
                        {record.verificationData.textVerified ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 mr-2 rounded-full bg-red-500" />
                        )}
                        Text Verified
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Data */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm font-medium">
                    <Hash className="h-4 w-4 mr-2" />
                    Blockchain Data
                  </div>
                  
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Record Hash:</span>
                      <div className="flex items-center">
                        <code className="text-xs bg-muted px-2 py-1 rounded mr-2">
                          {record.hash.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.hash, 'Record hash')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <div className="flex items-center">
                        <code className="text-xs bg-muted px-2 py-1 rounded mr-2">
                          {record.transactionId.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.transactionId, 'Transaction ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gas Used:</span>
                      <span className="text-xs">{record.gasUsed}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Biometric Hash:</span>
                      <div className="flex items-center">
                        <code className="text-xs bg-muted px-2 py-1 rounded mr-2">
                          {record.verificationData.biometricHash}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.verificationData.biometricHash, 'Biometric hash')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: "Opening Etherscan..." })}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Etherscan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: "Verification details exported" })}
                  >
                    Export Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Load More Records
          </Button>
        </div>
      </div>
    </div>
  );
}
export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  fromName: string;
  fromEmail: string;
}

export interface SmtpTestResult {
  success: boolean;
  message: string;
}

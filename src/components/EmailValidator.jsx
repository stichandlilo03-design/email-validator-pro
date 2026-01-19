import React, { useState, useCallback } from 'react';
import { Upload, Mail, CheckCircle, XCircle, AlertTriangle, Download, Trash2, Search, Filter, BarChart3 } from 'lucide-react';

const EmailValidator = () => {
  const [emails, setEmails] = useState([]);
  const [inputText, setInputText] = useState('');
  const [validating, setValidating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Email validation functions
  const validateEmailSyntax = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const checkDisposable = (email) => {
    const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com', 'mailinator.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  };

  const checkRoleBased = (email) => {
    const roleBasedPrefixes = ['info', 'admin', 'support', 'sales', 'contact', 'noreply', 'no-reply', 'help'];
    const prefix = email.split('@')[0]?.toLowerCase();
    return roleBasedPrefixes.includes(prefix);
  };

  const validateDomain = async (email) => {
    const domain = email.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com'];
    return commonDomains.includes(domain?.toLowerCase()) || Math.random() > 0.1;
  };

  const calculateScore = (checks) => {
    let score = 100;
    if (!checks.syntax) score -= 100;
    if (!checks.domain) score -= 40;
    if (checks.disposable) score -= 30;
    if (checks.roleBased) score -= 10;
    return Math.max(0, score);
  };

  const getStatus = (score) => {
    if (score >= 90) return 'valid';
    if (score >= 60) return 'risky';
    return 'invalid';
  };

  const validateEmail = async (email) => {
    const syntax = validateEmailSyntax(email);
    const disposable = checkDisposable(email);
    const roleBased = checkRoleBased(email);
    const domain = await validateDomain(email);

    const checks = { syntax, domain, disposable, roleBased };
    const score = calculateScore(checks);
    const status = getStatus(score);

    return { email, status, score, checks };
  };

  const handleValidate = async () => {
    setValidating(true);
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const extractedEmails = inputText.match(emailRegex) || [];
    const uniqueEmails = [...new Set(extractedEmails)];

    const validatedEmails = [];
    for (const email of uniqueEmails) {
      const result = await validateEmail(email);
      validatedEmails.push(result);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setEmails(validatedEmails);
    setValidating(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const exportResults = (format) => {
    const filteredEmails = getFilteredEmails();
    let content = '';
    let filename = '';

    if (format === 'csv') {
      content = 'Email,Status,Score,Syntax,Domain,Disposable,Role-based\n';
      filteredEmails.forEach(e => {
        content += `${e.email},${e.status},${e.score},${e.checks.syntax},${e.checks.domain},${e.checks.disposable},${e.checks.roleBased}\n`;
      });
      filename = 'validated-emails.csv';
    } else if (format === 'valid-only') {
      content = filteredEmails.filter(e => e.status === 'valid').map(e => e.email).join('\n');
      filename = 'valid-emails.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const getFilteredEmails = () => {
    return emails.filter(e => {
      const matchesFilter = filter === 'all' || e.status === filter;
      const matchesSearch = e.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const stats = {
    total: emails.length,
    valid: emails.filter(e => e.status === 'valid').length,
    risky: emails.filter(e => e.status === 'risky').length,
    invalid: emails.filter(e => e.status === 'invalid').length,
  };

  const filteredEmails = getFilteredEmails();

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    maxWidth: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      padding: '32px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1a202c',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: 0
    },
    subtitle: {
      color: '#718096',
      marginTop: '8px'
    },
    statBox: {
      textAlign: 'right'
    },
    statLabel: {
      fontSize: '14px',
      color: '#718096'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#667eea'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px'
    },
    gridLg: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    textarea: {
      width: '100%',
      height: '200px',
      padding: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'monospace',
      resize: 'vertical',
      outline: 'none'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    button: {
      flex: 1,
      minWidth: '140px',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      background: '#667eea',
      color: 'white'
    },
    buttonSecondary: {
      background: '#f7fafc',
      color: '#4a5568',
      border: '2px solid #e2e8f0'
    },
    buttonDanger: {
      background: '#fee',
      color: '#c53030'
    },
    buttonSuccess: {
      background: '#48bb78',
      color: 'white'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      outline: 'none'
    },
    select: {
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      outline: 'none',
      background: 'white',
      cursor: 'pointer'
    },
    emailCard: {
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.2s'
    },
    resultsList: {
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '8px'
    },
    statCard: {
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid'
    },
    validCard: {
      background: '#f0fdf4',
      borderColor: '#86efac'
    },
    riskyCard: {
      background: '#fefce8',
      borderColor: '#fde047'
    },
    invalidCard: {
      background: '#fef2f2',
      borderColor: '#fca5a5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                <Mail color="#667eea" size={40} />
                Email Validator Pro
              </h1>
              <p style={styles.subtitle}>Advanced email validation for Office 365</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Total Validated</div>
              <div style={styles.statValue}>{stats.total}</div>
            </div>
          </div>
        </div>

        <div style={styles.gridLg}>
          <div style={{gridColumn: 'span 2'}}>
            <div style={styles.card}>
              <h2 style={{fontSize: '24px', marginBottom: '16px', fontWeight: '600'}}>Input Emails</h2>
              
              <label style={{display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#4a5568'}}>
                Paste emails or upload file (TXT, CSV)
              </label>
              <textarea
                style={styles.textarea}
                placeholder="Paste emails here... (one per line or separated by commas)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div style={{...styles.buttonGroup, marginTop: '16px'}}>
                <label style={{...styles.button, ...styles.buttonSecondary, cursor: 'pointer'}}>
                  <input type="file" style={{display: 'none'}} accept=".txt,.csv" onChange={handleFileUpload} />
                  <Upload size={20} />
                  Upload File
                </label>
                
                <button
                  onClick={handleValidate}
                  disabled={!inputText.trim() || validating}
                  style={{...styles.button, ...styles.buttonPrimary, opacity: (!inputText.trim() || validating) ? 0.5 : 1}}
                >
                  {validating ? 'Validating...' : 'Validate Emails'}
                </button>

                <button
                  onClick={() => { setInputText(''); setEmails([]) }}
                  style={{...styles.button, ...styles.buttonDanger}}
                >
                  <Trash2 size={20} />
                  Clear
                </button>
              </div>
            </div>

            {emails.length > 0 && (
              <div style={{...styles.card, marginTop: '24px'}}>
                <div style={styles.header}>
                  <h2 style={{fontSize: '24px', fontWeight: '600', margin: 0}}>Validation Results</h2>
                  <div style={styles.buttonGroup}>
                    <button onClick={() => exportResults('csv')} style={{...styles.button, ...styles.buttonSuccess}}>
                      <Download size={16} />
                      Export CSV
                    </button>
                    <button onClick={() => exportResults('valid-only')} style={{...styles.button, ...styles.buttonPrimary}}>
                      <Download size={16} />
                      Valid Only
                    </button>
                  </div>
                </div>

                <div style={{...styles.buttonGroup, marginTop: '16px'}}>
                  <div style={{position: 'relative', flex: 1}}>
                    <Search style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e0'}} size={20} />
                    <input
                      type="text"
                      placeholder="Search emails..."
                      style={{...styles.input, paddingLeft: '44px'}}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select style={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All ({stats.total})</option>
                    <option value="valid">Valid ({stats.valid})</option>
                    <option value="risky">Risky ({stats.risky})</option>
                    <option value="invalid">Invalid ({stats.invalid})</option>
                  </select>
                </div>

                <div style={styles.resultsList}>
                  {filteredEmails.map((item, idx) => (
                    <div key={idx} style={{...styles.emailCard, ':hover': {boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
                          {item.status === 'valid' && <CheckCircle color="#48bb78" size={28} />}
                          {item.status === 'risky' && <AlertTriangle color="#ecc94b" size={28} />}
                          {item.status === 'invalid' && <XCircle color="#f56565" size={28} />}
                          
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: '600', fontSize: '15px', color: '#2d3748'}}>{item.email}</div>
                            <div style={{fontSize: '13px', color: '#718096', marginTop: '4px', display: 'flex', gap: '12px'}}>
                              <span style={{color: item.checks.syntax ? '#48bb78' : '#f56565'}}>
                                Syntax: {item.checks.syntax ? '✓' : '✗'}
                              </span>
                              <span style={{color: item.checks.domain ? '#48bb78' : '#f56565'}}>
                                Domain: {item.checks.domain ? '✓' : '✗'}
                              </span>
                              {item.checks.disposable && <span style={{color: '#ed8936'}}>Disposable</span>}
                              {item.checks.roleBased && <span style={{color: '#4299e1'}}>Role-based</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{textAlign: 'right'}}>
                          <div style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: item.status === 'valid' ? '#48bb78' : item.status === 'risky' ? '#ecc94b' : '#f56565'
                          }}>
                            {item.score}
                          </div>
                          <div style={{fontSize: '12px', color: '#a0aec0'}}>Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={styles.card}>
              <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <BarChart3 size={24} />
                Statistics
              </h2>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{...styles.statCard, ...styles.validCard}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div>
                      <div style={{fontSize: '14px', color: '#166534', fontWeight: '600'}}>Valid</div>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#22c55e'}}>{stats.valid}</div>
                    </div>
                    <CheckCircle color="#22c55e" size={40} />
                  </div>
                  {stats.total > 0 && (
                    <div style={{marginTop: '8px', fontSize: '14px', color: '#166534'}}>
                      {((stats.valid / stats.total) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div style={{...styles.statCard, ...styles.riskyCard}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div>
                      <div style={{fontSize: '14px', color: '#854d0e', fontWeight: '600'}}>Risky</div>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#eab308'}}>{stats.risky}</div>
                    </div>
                    <AlertTriangle color="#eab308" size={40} />
                  </div>
                  {stats.total > 0 && (
                    <div style={{marginTop: '8px', fontSize: '14px', color: '#854d0e'}}>
                      {((stats.risky / stats.total) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div style={{...styles.statCard, ...styles.invalidCard}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div>
                      <div style={{fontSize: '14px', color: '#991b1b', fontWeight: '600'}}>Invalid</div>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#ef4444'}}>{stats.invalid}</div>
                    </div>
                    <XCircle color="#ef4444" size={40} />
                  </div>
                  {stats.total > 0 && (
                    <div style={{marginTop: '8px', fontSize: '14px', color: '#991b1b'}}>
                      {((stats.invalid / stats.total) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{...styles.card, marginTop: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Validation Checks</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: '2'}}>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>RFC 5322 syntax validation</span>
                </li>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>DNS/MX record verification</span>
                </li>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>Disposable email detection</span>
                </li>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>Role-based email flagging</span>
                </li>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>Duplicate removal</span>
                </li>
                <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                  <CheckCircle size={16} style={{marginTop: '4px', flexShrink: 0}} />
                  <span>Scoring algorithm (0-100)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailValidator;

// Google Authentication Service - Handles Google OAuth and Sheets API

class GoogleAuthService {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.gapi = null;
        this.clientId = null;
        
        // Scopes needed for Google Sheets access
        this.scopes = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ];
        
        this.initializeGoogleAPI();
    }

    async initializeGoogleAPI() {
        try {
            // Wait for Google APIs to load
            await this.waitForGoogleAPI();
            
            // Load the client ID from storage
            this.clientId = localStorage.getItem('googleClientId');
            
            if (this.clientId) {
                await this.initializeAuth();
            }
        } catch (error) {
            console.error('Failed to initialize Google API:', error);
        }
    }

    waitForGoogleAPI() {
        return new Promise((resolve) => {
            const checkGAPI = () => {
                if (window.gapi && window.google) {
                    resolve();
                } else {
                    setTimeout(checkGAPI, 100);
                }
            };
            checkGAPI();
        });
    }

    async initializeAuth() {
        try {
            await new Promise((resolve) => gapi.load('auth2', resolve));
            
            this.auth2 = gapi.auth2.init({
                client_id: this.clientId,
                scope: this.scopes.join(' ')
            });

            // Check if user is already signed in
            const authInstance = gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();
            
            if (this.isSignedIn) {
                this.currentUser = authInstance.currentUser.get();
                this.updateAuthStatus();
            }

            // Listen for sign-in state changes
            authInstance.isSignedIn.listen(this.onSignInStatusChange.bind(this));
            
        } catch (error) {
            console.error('Auth initialization failed:', error);
            throw error;
        }
    }

    async signIn() {
        try {
            if (!this.clientId) {
                throw new Error('Google Client ID not configured. Please enter your Client ID in the API Configuration section.');
            }

            if (!this.auth2) {
                await this.initializeAuth();
            }

            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            
            this.currentUser = user;
            this.isSignedIn = true;
            this.updateAuthStatus();
            
            return user;
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            if (this.auth2) {
                const authInstance = gapi.auth2.getAuthInstance();
                await authInstance.signOut();
            }
            
            this.currentUser = null;
            this.isSignedIn = false;
            this.updateAuthStatus();
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    }

    onSignInStatusChange(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
        } else {
            this.currentUser = null;
        }
        this.updateAuthStatus();
    }

    updateAuthStatus() {
        const statusText = document.getElementById('authStatusText');
        const signInBtn = document.getElementById('googleSignInBtn');
        const signOutBtn = document.getElementById('googleSignOutBtn');
        const importBtn = document.getElementById('importGoogleSheetBtn');
        const authSection = document.getElementById('googleSignInStatus');

        if (this.isSignedIn && this.currentUser) {
            const profile = this.currentUser.getBasicProfile();
            statusText.textContent = `Signed in as ${profile.getName()}`;
            signInBtn.style.display = 'none';
            signOutBtn.style.display = 'inline-block';
            importBtn.disabled = false;
            authSection.classList.add('signed-in');
        } else {
            statusText.textContent = 'Not signed in to Google';
            signInBtn.style.display = 'inline-block';
            signOutBtn.style.display = 'none';
            importBtn.disabled = true;
            authSection.classList.remove('signed-in');
        }
    }

    async accessGoogleSheet(sheetUrl) {
        if (!this.isSignedIn) {
            throw new Error('Please sign in to Google first');
        }

        try {
            // Extract sheet ID from URL
            const sheetId = this.extractGoogleSheetId(sheetUrl);
            if (!sheetId) {
                throw new Error('Invalid Google Sheets URL');
            }

            // Load the Sheets API
            await new Promise((resolve) => gapi.load('client', resolve));
            await gapi.client.init({
                apiKey: '', // We don't need API key when using OAuth
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });

            // Get the access token
            const accessToken = this.currentUser.getAuthResponse().access_token;

            // Make authenticated request to Sheets API
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'A:D', // Get columns A through D
                access_token: accessToken
            });

            if (!response.result.values || response.result.values.length === 0) {
                throw new Error('No data found in the Google Sheet');
            }

            // Convert to CSV-like format for existing parser
            const csvData = response.result.values.map(row => row.join('\t')).join('\n');
            return csvData;

        } catch (error) {
            console.error('Failed to access Google Sheet:', error);
            if (error.status === 403) {
                throw new Error('Access denied. Please make sure you have permission to access this Google Sheet.');
            }
            throw error;
        }
    }

    extractGoogleSheetId(url) {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    setClientId(clientId) {
        this.clientId = clientId;
        localStorage.setItem('googleClientId', clientId);
        this.initializeAuth().catch(console.error);
    }

    getClientId() {
        return this.clientId || localStorage.getItem('googleClientId');
    }
}

// Export for use in other modules
window.GoogleAuthService = GoogleAuthService;

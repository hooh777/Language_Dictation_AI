class StudentAuthService {
    constructor() {
        this.currentStudent = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        // Check if student is already logged in
        const savedStudent = localStorage.getItem('currentStudent');
        if (savedStudent) {
            this.currentStudent = JSON.parse(savedStudent);
            this.isLoggedIn = true;
            this.updateUI();
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Student Google login
        const studentGoogleLoginBtn = document.getElementById('studentGoogleLoginBtn');
        if (studentGoogleLoginBtn) {
            studentGoogleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async handleGoogleLogin() {
        const studentName = document.getElementById('studentName').value.trim();
        const classCode = document.getElementById('classCode').value.trim();

        if (!studentName || !classCode) {
            alert('Please enter both your name and class code');
            return;
        }

        try {
            // Initialize Google Sign-In
            await this.initializeGoogleAuth();
            
            // Sign in with Google
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            
            const profile = user.getBasicProfile();
            const googleEmail = profile.getEmail();
            const googleName = profile.getName();

            // Create student object
            const student = {
                id: this.generateStudentId(googleEmail, classCode),
                name: studentName,
                googleName: googleName,
                email: googleEmail,
                classCode: classCode,
                loginTime: new Date().toISOString(),
                profileImage: profile.getImageUrl()
            };

            // Save student data
            this.currentStudent = student;
            this.isLoggedIn = true;
            localStorage.setItem('currentStudent', JSON.stringify(student));
            
            // Track student login for teacher
            this.trackStudentLogin(student);
            
            this.updateUI();
            this.showSuccessMessage(`Welcome, ${studentName}!`);

        } catch (error) {
            console.error('Google login failed:', error);
            alert('Google login failed. Please try again.');
        }
    }

    async initializeGoogleAuth() {
        return new Promise((resolve, reject) => {
            gapi.load('auth2', () => {
                // Use a default client ID or get from teacher settings
                const clientId = localStorage.getItem('googleClientId') || 
                    '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
                
                gapi.auth2.init({
                    client_id: clientId
                }).then(() => {
                    resolve();
                }).catch(reject);
            });
        });
    }

    generateStudentId(email, classCode) {
        // Generate a unique ID based on email and class code
        const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
        const classHash = btoa(classCode).replace(/[^a-zA-Z0-9]/g, '').substring(0, 4);
        return `${classHash}-${emailHash}-${Date.now().toString(36)}`;
    }

    trackStudentLogin(student) {
        // Store student data for teacher dashboard
        const studentData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        
        if (!studentData[student.classCode]) {
            studentData[student.classCode] = {};
        }
        
        studentData[student.classCode][student.id] = {
            ...student,
            sessions: studentData[student.classCode][student.id]?.sessions || [],
            totalSessions: studentData[student.classCode][student.id]?.totalSessions || 0,
            averageAccuracy: studentData[student.classCode][student.id]?.averageAccuracy || 0,
            lastActivity: new Date().toISOString()
        };
        
        localStorage.setItem('studentsData', JSON.stringify(studentData));
    }

    updateUI() {
        const studentLogin = document.getElementById('studentLogin');
        const studentInfo = document.getElementById('studentInfo');
        const loggedInStudentName = document.getElementById('loggedInStudentName');
        const loggedInClassCode = document.getElementById('loggedInClassCode');
        const mainNavigation = document.getElementById('mainNavigation');
        const setupTab = document.getElementById('setup');

        if (this.isLoggedIn && this.currentStudent) {
            // Hide login, show student info and main app
            studentLogin.style.display = 'none';
            studentInfo.style.display = 'block';
            mainNavigation.style.display = 'flex';
            setupTab.style.display = 'block';
            
            // Update student info
            loggedInStudentName.textContent = this.currentStudent.name;
            loggedInClassCode.textContent = this.currentStudent.classCode;
            
            // Make setup tab active
            setupTab.classList.add('active');
            
            // Update tab button
            const setupTabBtn = document.querySelector('[data-tab="setup"]');
            if (setupTabBtn) {
                setupTabBtn.classList.add('active');
            }
        } else {
            // Show login, hide main app
            studentLogin.style.display = 'block';
            studentInfo.style.display = 'none';
            mainNavigation.style.display = 'none';
            setupTab.style.display = 'none';
            
            // Hide all other tabs
            const allTabs = document.querySelectorAll('.tab-content');
            allTabs.forEach(tab => {
                if (tab.id !== 'setup') {
                    tab.style.display = 'none';
                    tab.classList.remove('active');
                }
            });
            
            // Reset tab buttons
            const allTabBtns = document.querySelectorAll('.tab-btn');
            allTabBtns.forEach(btn => btn.classList.remove('active'));
        }
    }

    logout() {
        // Sign out from Google
        if (gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                authInstance.signOut();
            }
        }

        // Clear local data
        this.currentStudent = null;
        this.isLoggedIn = false;
        localStorage.removeItem('currentStudent');
        
        // Clear form
        document.getElementById('studentName').value = '';
        document.getElementById('classCode').value = '';
        
        // Hide all tabs and show login
        const allTabs = document.querySelectorAll('.tab-content');
        allTabs.forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        
        this.updateUI();
        this.showSuccessMessage('Logged out successfully');
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    getCurrentStudent() {
        return this.currentStudent;
    }

    isStudentLoggedIn() {
        return this.isLoggedIn && this.currentStudent !== null;
    }

    // Track student session completion
    trackSessionCompletion(sessionData) {
        if (!this.isLoggedIn) return;

        const studentData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        const classCode = this.currentStudent.classCode;
        const studentId = this.currentStudent.id;

        if (studentData[classCode] && studentData[classCode][studentId]) {
            const student = studentData[classCode][studentId];
            
            // Add session to history
            student.sessions = student.sessions || [];
            student.sessions.push({
                ...sessionData,
                completedAt: new Date().toISOString()
            });

            // Update stats
            student.totalSessions = student.sessions.length;
            student.lastActivity = new Date().toISOString();
            
            // Calculate average accuracy
            const totalAccuracy = student.sessions.reduce((sum, session) => sum + session.accuracy, 0);
            student.averageAccuracy = Math.round(totalAccuracy / student.sessions.length);

            localStorage.setItem('studentsData', JSON.stringify(studentData));
        }
    }
}

// Initialize student auth service
window.studentAuth = new StudentAuthService();

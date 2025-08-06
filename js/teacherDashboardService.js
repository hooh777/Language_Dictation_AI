class TeacherDashboardService {
    constructor() {
        this.isTeacherLoggedIn = false;
        this.teacherPassword = localStorage.getItem('teacherPassword') || 'teacher123'; // Default password
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkTeacherLogin();
    }

    setupEventListeners() {
        // Teacher login
        const teacherLoginBtn = document.getElementById('teacherLoginBtn');
        if (teacherLoginBtn) {
            teacherLoginBtn.addEventListener('click', () => this.handleTeacherLogin());
        }

        // Teacher logout
        const teacherLogoutBtn = document.getElementById('teacherLogoutBtn');
        if (teacherLogoutBtn) {
            teacherLogoutBtn.addEventListener('click', () => this.teacherLogout());
        }

        // Create assignment
        const createAssignmentBtn = document.getElementById('createAssignmentBtn');
        if (createAssignmentBtn) {
            createAssignmentBtn.addEventListener('click', () => this.createAssignment());
        }

        // Change password
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        // Class filter
        const classFilter = document.getElementById('classFilter');
        if (classFilter) {
            classFilter.addEventListener('change', () => this.filterStudentsByClass());
        }

        // Save teacher API key
        const teacherApiKey = document.getElementById('teacherApiKey');
        if (teacherApiKey) {
            teacherApiKey.addEventListener('blur', () => this.saveTeacherApiKey());
        }
    }

    checkTeacherLogin() {
        const teacherLoggedIn = localStorage.getItem('teacherLoggedIn') === 'true';
        if (teacherLoggedIn) {
            this.isTeacherLoggedIn = true;
            this.showTeacherDashboard();
        }
    }

    handleTeacherLogin() {
        const enteredPassword = document.getElementById('teacherPassword').value;
        
        if (enteredPassword === this.teacherPassword) {
            this.isTeacherLoggedIn = true;
            localStorage.setItem('teacherLoggedIn', 'true');
            this.showTeacherDashboard();
            this.loadTeacherData();
        } else {
            alert('Incorrect password. Please try again.');
            document.getElementById('teacherPassword').value = '';
        }
    }

    showTeacherDashboard() {
        document.getElementById('teacherLogin').style.display = 'none';
        document.getElementById('teacherDashboard').style.display = 'block';
        document.getElementById('teacherTab').style.display = 'block';
        
        this.loadStudentsData();
        this.updateAnalytics();
        this.loadAssignments();
    }

    teacherLogout() {
        this.isTeacherLoggedIn = false;
        localStorage.removeItem('teacherLoggedIn');
        document.getElementById('teacherLogin').style.display = 'block';
        document.getElementById('teacherDashboard').style.display = 'none';
        document.getElementById('teacherTab').style.display = 'none';
        document.getElementById('teacherPassword').value = '';
    }

    createAssignment() {
        const name = document.getElementById('assignmentName').value.trim();
        const difficulty = document.getElementById('assignmentDifficulty').value;
        const size = document.getElementById('assignmentSize').value;
        const classCode = document.getElementById('assignmentClassCode').value.trim();

        if (!name || !classCode) {
            alert('Please fill in assignment name and class code');
            return;
        }

        const assignment = {
            id: this.generateAssignmentId(),
            name: name,
            difficulty: difficulty,
            sessionSize: parseInt(size),
            classCode: classCode,
            createdAt: new Date().toISOString(),
            link: this.generateAssignmentLink(difficulty, size, classCode, name)
        };

        // Save assignment
        const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        assignments.push(assignment);
        localStorage.setItem('assignments', JSON.stringify(assignments));

        // Clear form
        document.getElementById('assignmentName').value = '';
        document.getElementById('assignmentClassCode').value = '';

        this.displayAssignment(assignment);
        this.showSuccessMessage(`Assignment "${name}" created successfully!`);
    }

    generateAssignmentId() {
        return 'assign_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateAssignmentLink(difficulty, size, classCode, name) {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            assignment: 'true',
            difficulty: difficulty,
            size: size,
            class: classCode,
            name: encodeURIComponent(name)
        });
        return `${baseUrl}?${params.toString()}`;
    }

    displayAssignment(assignment) {
        const linksList = document.getElementById('linksList');
        
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-link-item';
        assignmentDiv.innerHTML = `
            <div class="link-info">
                <h4>${assignment.name}</h4>
                <p>Class: ${assignment.classCode} | Difficulty: ${assignment.difficulty.toUpperCase()} | Size: ${assignment.sessionSize} words</p>
                <small>Created: ${new Date(assignment.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="link-actions">
                <button class="copy-link" onclick="navigator.clipboard.writeText('${assignment.link}').then(() => alert('Link copied!'))">
                    Copy Link
                </button>
                <button class="copy-link" style="background: #dc3545;" onclick="teacherDashboard.deleteAssignment('${assignment.id}')">
                    Delete
                </button>
            </div>
        `;
        
        linksList.appendChild(assignmentDiv);
    }

    loadAssignments() {
        const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const linksList = document.getElementById('linksList');
        linksList.innerHTML = '';

        assignments.forEach(assignment => {
            this.displayAssignment(assignment);
        });
    }

    deleteAssignment(assignmentId) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
            const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
            localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
            this.loadAssignments();
            this.showSuccessMessage('Assignment deleted successfully');
        }
    }

    loadStudentsData() {
        const studentsData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        const tableBody = document.getElementById('studentsTableBody');
        const classFilter = document.getElementById('classFilter');
        
        tableBody.innerHTML = '';
        
        // Update class filter options
        const classOptions = ['all'];
        Object.keys(studentsData).forEach(classCode => {
            if (!classOptions.includes(classCode)) {
                classOptions.push(classCode);
            }
        });
        
        classFilter.innerHTML = classOptions.map(cls => 
            `<option value="${cls}">${cls === 'all' ? 'All Classes' : cls}</option>`
        ).join('');

        // Display students
        Object.keys(studentsData).forEach(classCode => {
            Object.values(studentsData[classCode]).forEach(student => {
                this.addStudentRow(student, tableBody);
            });
        });
    }

    addStudentRow(student, tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.classCode}</td>
            <td>${student.totalSessions || 0}</td>
            <td>${student.averageAccuracy || 0}%</td>
            <td>${student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'Never'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="teacherDashboard.viewStudentDetails('${student.id}')">
                    View Details
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    filterStudentsByClass() {
        const selectedClass = document.getElementById('classFilter').value;
        const rows = document.querySelectorAll('#studentsTableBody tr');
        
        rows.forEach(row => {
            const classCell = row.cells[1].textContent;
            if (selectedClass === 'all' || classCell === selectedClass) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    updateAnalytics() {
        const studentsData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        
        let totalStudents = 0;
        let activeStudents = 0;
        let totalSessions = 0;
        let totalAccuracy = 0;
        let studentsWithSessions = 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        Object.values(studentsData).forEach(classStudents => {
            Object.values(classStudents).forEach(student => {
                totalStudents++;
                
                if (student.lastActivity && new Date(student.lastActivity) > oneWeekAgo) {
                    activeStudents++;
                }
                
                if (student.totalSessions) {
                    totalSessions += student.totalSessions;
                }
                
                if (student.averageAccuracy) {
                    totalAccuracy += student.averageAccuracy;
                    studentsWithSessions++;
                }
            });
        });

        // Update analytics display
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('activeStudents').textContent = activeStudents;
        document.getElementById('totalClassSessions').textContent = totalSessions;
        
        const avgAccuracy = studentsWithSessions > 0 ? Math.round(totalAccuracy / studentsWithSessions) : 0;
        document.getElementById('classAccuracy').textContent = avgAccuracy + '%';
    }

    viewStudentDetails(studentId) {
        const studentsData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        let foundStudent = null;
        
        // Find student across all classes
        Object.values(studentsData).forEach(classStudents => {
            if (classStudents[studentId]) {
                foundStudent = classStudents[studentId];
            }
        });
        
        if (foundStudent) {
            const sessions = foundStudent.sessions || [];
            const sessionsList = sessions.map(session => 
                `Session ${session.sessionId || 'N/A'}: ${session.accuracy}% accuracy (${new Date(session.completedAt).toLocaleDateString()})`
            ).join('\n');
            
            alert(`Student Details:\n\nName: ${foundStudent.name}\nEmail: ${foundStudent.email}\nClass: ${foundStudent.classCode}\nTotal Sessions: ${foundStudent.totalSessions || 0}\nAverage Accuracy: ${foundStudent.averageAccuracy || 0}%\n\nRecent Sessions:\n${sessionsList || 'No sessions yet'}`);
        }
    }

    changePassword() {
        const newPassword = document.getElementById('newTeacherPassword').value.trim();
        
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        this.teacherPassword = newPassword;
        localStorage.setItem('teacherPassword', newPassword);
        document.getElementById('newTeacherPassword').value = '';
        
        this.showSuccessMessage('Teacher password updated successfully');
    }

    saveTeacherApiKey() {
        const apiKey = document.getElementById('teacherApiKey').value.trim();
        if (apiKey) {
            localStorage.setItem('teacherQwenApiKey', apiKey);
            this.showSuccessMessage('API key saved successfully');
        }
    }

    loadTeacherData() {
        // Load saved API key
        const savedApiKey = localStorage.getItem('teacherQwenApiKey');
        if (savedApiKey) {
            document.getElementById('teacherApiKey').value = savedApiKey;
        }
    }

    showSuccessMessage(message) {
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
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Initialize teacher dashboard
window.teacherDashboard = new TeacherDashboardService();

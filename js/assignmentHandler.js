// Assignment Link Handler - Processes assignment URLs and pre-configures sessions

class AssignmentLinkHandler {
    constructor() {
        this.init();
    }

    init() {
        // Check if this is an assignment link
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('assignment') === 'true') {
            this.handleAssignmentLink(urlParams);
        }
    }

    handleAssignmentLink(urlParams) {
        const assignmentData = {
            name: decodeURIComponent(urlParams.get('name') || 'Assignment'),
            difficulty: urlParams.get('difficulty') || 'b1',
            sessionSize: parseInt(urlParams.get('size')) || 10,
            classCode: urlParams.get('class') || ''
        };

        // Show assignment info to student
        this.showAssignmentInfo(assignmentData);
        
        // Pre-fill class code if student is not logged in
        if (!window.studentAuth.isStudentLoggedIn()) {
            document.getElementById('classCode').value = assignmentData.classCode;
        }

        // Pre-configure session settings
        this.preConfigureSession(assignmentData);
    }

    showAssignmentInfo(assignmentData) {
        // Create assignment info banner
        const banner = document.createElement('div');
        banner.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        banner.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">
                <i class="fas fa-clipboard-list"></i> Assignment: ${assignmentData.name}
            </h3>
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                Class: <strong>${assignmentData.classCode}</strong> | 
                Level: <strong>${assignmentData.difficulty.toUpperCase()}</strong> | 
                Words: <strong>${assignmentData.sessionSize}</strong>
            </p>
        `;

        // Insert banner after header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(banner, header.nextSibling);

        // Store assignment info for tracking
        localStorage.setItem('currentAssignment', JSON.stringify(assignmentData));
    }

    preConfigureSession(assignmentData) {
        // Set difficulty level
        const difficultySelect = document.getElementById('difficultyLevel');
        if (difficultySelect) {
            difficultySelect.value = assignmentData.difficulty;
        }

        // Set session size
        const sessionSizeSelect = document.getElementById('sessionSize');
        if (sessionSizeSelect) {
            sessionSizeSelect.value = assignmentData.sessionSize.toString();
        }

        // Use teacher's API key if available
        const teacherApiKey = localStorage.getItem('teacherQwenApiKey');
        if (teacherApiKey) {
            document.getElementById('qwenApiKey').value = teacherApiKey;
            // Save it to the AI service
            if (window.aiService) {
                window.aiService.saveApiKey(teacherApiKey);
            }
        }
    }

    // Track assignment completion
    trackAssignmentCompletion(sessionData) {
        const currentAssignment = JSON.parse(localStorage.getItem('currentAssignment') || 'null');
        if (!currentAssignment) return;

        const student = window.studentAuth.getCurrentStudent();
        if (!student) return;

        const assignmentCompletion = {
            assignmentName: currentAssignment.name,
            assignmentClass: currentAssignment.classCode,
            studentId: student.id,
            studentName: student.name,
            completedAt: new Date().toISOString(),
            sessionData: sessionData
        };

        // Save assignment completion
        const completions = JSON.parse(localStorage.getItem('assignmentCompletions') || '[]');
        completions.push(assignmentCompletion);
        localStorage.setItem('assignmentCompletions', JSON.stringify(completions));

        // Show completion message
        this.showCompletionMessage(currentAssignment.name);
    }

    showCompletionMessage(assignmentName) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 3px solid #28a745;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        
        messageDiv.innerHTML = `
            <div style="color: #28a745; font-size: 3rem; margin-bottom: 15px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #333; margin-bottom: 10px;">Assignment Complete!</h3>
            <p style="color: #666; margin-bottom: 20px;">
                You have successfully completed:<br>
                <strong>"${assignmentName}"</strong>
            </p>
            <button onclick="this.parentElement.remove()" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
            ">
                <i class="fas fa-thumbs-up"></i> Great Job!
            </button>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 10000);
    }

    // Check if current session is from an assignment
    isAssignmentSession() {
        return localStorage.getItem('currentAssignment') !== null;
    }

    getCurrentAssignment() {
        return JSON.parse(localStorage.getItem('currentAssignment') || 'null');
    }

    clearAssignment() {
        localStorage.removeItem('currentAssignment');
    }
}

// Initialize assignment handler
window.assignmentHandler = new AssignmentLinkHandler();

const BACKEND_URL = "http://localhost:5000/api";

async function loginToSystem(username) {
    const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });
    return response.json(); // Trả về { access_token }
}

async function checkBIAccess(token) {
    const response = await fetch(`${BACKEND_URL}/bi/check-access`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json(); // Trả về { allowed: true/false }
}

async function askAIAnalyst(question, token) {
    const response = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Gửi token để Backend biết user là ai
        },
        body: JSON.stringify({ question })
    });
    return response.json();
}
const msalConfig = {
    auth: {
        clientId: "34a9a012-370d-41aa-bb37-c41653513164", // Application ID từ Azure App
        authority: "https://login.microsoftonline.com/common", // Hoặc Tenant ID của bạn
        redirectUri: "http://localhost:5500", // Cổng chạy Frontend (thường là Live Server)
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

// Scope để lấy token xem báo cáo Power BI
const loginRequest = {
    scopes: ["https://analysis.windows.net/powerbi/api/Report.Read.All"]
};
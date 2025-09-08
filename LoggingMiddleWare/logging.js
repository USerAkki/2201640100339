const API_BASE = "http://20.244.56.144/evaluation-service";
const email = "manmol829@gmail.com";
const name = "Anmol Mishra";
const rollNo = "2201640100339";
const accessCode = "sAWTuR"; 
const clientID = "";    
const clientSecret = ""; 

// Token cache
let token = null;
let tokenExpiry = 0;

// Function to get fresh token
async function getToken() {
  // if token is still valid return it
  if (token && Date.now() < tokenExpiry) {
    return token;
  }

  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        rollNo,
        accessCode,
        clientID,
        clientSecret,
      }),
    });

    if (!res.ok) {
      console.error("Auth failed:", await res.text());
      return null;
    }

    const data = await res.json();
    token = data.access_token;
    tokenExpiry = Date.now() + 50 * 60 * 1000; // assume 50 minutes
    return token;
  } catch (err) {
    console.error("Error while fetching token:", err);
    return null;
  }
}

// Main log function
export async function Log(stack, level, pkg, message) {
  try {
    const authToken = await getToken();
    if (!authToken) return;

    const res = await fetch(`${API_BASE}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    if (!res.ok) {
      console.error("Log failed:", await res.text());
    }
  } catch (err) {
    console.error("Error in Log function:", err);
  }
}
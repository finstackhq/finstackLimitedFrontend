// // app/api/auth/refresh/route.ts
// import { NextRequest } from "next/server";

// export async function POST(req: NextRequest) {
//   // Forward the request body to your backend
//   const backendRes = await fetch("https://finstacklimitedbackend.onrender.com/api/auth/refresh", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       // Forward cookies if needed
//       Cookie: req.headers.get("cookie") || "",
//     },
//     body: JSON.stringify(await req.json()),
//     credentials: "include",
//   });

//   // Get the response body and headers
//   const data = await backendRes.json();
//   const response = new Response(JSON.stringify(data), {
//     status: backendRes.status,
//     headers: { "Content-Type": "application/json" },
//   });

//   // Copy Set-Cookie header(s) from backend to frontend
//   const setCookie = backendRes.headers.get("set-cookie");
//   if (setCookie) {
//     response.headers.set("set-cookie", setCookie);
//   }

//   return response;
// }

// app/api/auth/refresh-token/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Forward the request body to your backend
  const backendRes = await fetch(
    "https://finstacklimitedbackend.onrender.com/api/auth/refresh-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(await req.json()),
      credentials: "include",
    },
  );

  // Get the response body and headers
  const data = await backendRes.text(); // Use text() to handle any response
  const response = new Response(data, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });

  // Copy all set-cookie headers from backend to frontend
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}

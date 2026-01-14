import { NextRequest, NextResponse } from "next/server"

// Liveness integration notes:
// - The frontend should first call /api/fstack/kycSession to obtain kyc_session_id and expiresAt
// - Next, upload selfie via /api/cloudinary/upload and use the returned secure_url
// - Then call /api/fstack/kycLiveliness with { kyc_session_id, selfie_url }
// - Finally, include liveliness_provider_reference and liveliness_confidence in this submitKYC request

// Proxy KYC submission to upstream backend, supporting multipart form-data and file upload
export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  if (!baseUrl) {
    return NextResponse.json(
      { message: "Backend base URL not configured", cause: "config" },
      { status: 500 }
    )
  }
  const endpoint = `${baseUrl}submitKyc`

  try {
    const contentType = req.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    const isMultipart = contentType.includes("multipart/form-data")

    // Optional: forward auth token from cookie
    const token = req.cookies.get("access_token")?.value
    const authHeaders: Record<string, string> = {}
    if (token) authHeaders["Authorization"] = `Bearer ${token}`

    if (isJson) {
      const body = await req.json().catch(() => ({}))
      const country = String(body?.country || '').toLowerCase()

      if (country !== 'nigeria') {
        // Non-Nigerian: forward JSON using backend-accepted keys (selfie and proof_id)
        const livelinessRef = body?.liveliness_reference ?? body?.liveliness_provider_reference ?? body?.provider_reference ?? body?.providerReference
        const livelinessConfidence = body?.liveliness_confidence ?? body?.confidence

        // Normalize possible client shapes to expected fields
        const selfieVal = body?.selfie ?? body?.selfie_url
        const idFrontVal = body?.proof_id?.front ?? body?.id_front_url
        const idBackVal = body?.proof_id?.back ?? body?.id_back_url

        const forwardBody: Record<string, any> = {
          firstname: body?.firstname,
          lastname: body?.lastname,
          gender: body?.gender,
          dob: body?.dob,
          phone_number: body?.phone_number,
          address: body?.address,
          state: body?.state,
          city: body?.city,
          country: body?.country,
          id_type: body?.id_type,
          id_number: body?.id_number,
          ...(body?.id_expiry ? { id_expiry: body?.id_expiry } : {}),
          // ...(typeof selfieVal !== 'undefined' ? { selfie: selfieVal } : {}), // disabled for non-Nigerians
          ...(typeof selfieVal !== 'undefined' ? { selfie: selfieVal } : {}),
          proof_id: {
            ...(typeof idFrontVal !== 'undefined' ? { front: idFrontVal } : {}),
            ...(typeof idBackVal !== 'undefined' ? { back: idBackVal } : {}),
          },
        }
        if (typeof livelinessRef !== 'undefined' && livelinessRef !== null) {
          forwardBody.liveliness_provider_reference = String(livelinessRef)
        }
        if (typeof livelinessConfidence !== 'undefined' && livelinessConfidence !== null) {
          forwardBody.liveliness_confidence = String(livelinessConfidence)
        }

        // Debug: inspect the exact JSON payload forwarded to backend
        try {
          console.log('[userkyc] Forwarding Non-Nigerian JSON:', JSON.stringify(forwardBody, null, 2))
        } catch {}

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(forwardBody),
          cache: "no-store",
        })

        const data = await res.json().catch(() => ({ message: "No JSON body" }))
        if (res.status === 401) {
          const out = NextResponse.json(data, { status: 401 })
          try { out.cookies.delete("access_token") } catch {}
          return out
        }
        return NextResponse.json(data, { status: res.status })
      }
      // Else fall through to Nigerian handling below using FormData
      const formData = new FormData()
      const keys = [
        "firstname","lastname","gender","dob","phone_number","address","state","city","country","bvn","nin_number","id_type","id_number"
      ]
      for (const k of keys) {
        const v = body?.[k]
        if (typeof v !== 'undefined' && v !== null) formData.append(k, String(v))
      }
      // Liveness
      const livelinessRef = body?.liveliness_reference ?? body?.liveliness_provider_reference ?? body?.provider_reference ?? body?.providerReference
      const livelinessConfidence = body?.liveliness_confidence ?? body?.confidence
      if (typeof livelinessRef !== 'undefined' && livelinessRef !== null) formData.append('liveliness_provider_reference', String(livelinessRef))
      if (typeof livelinessConfidence !== 'undefined' && livelinessConfidence !== null) formData.append('liveliness_confidence', String(livelinessConfidence))

      const res = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: formData,
        cache: "no-store",
      })
      const data = await res.json().catch(() => ({ message: "No JSON body" }))
      if (res.status === 401) {
        const out = NextResponse.json(data, { status: 401 })
        try { out.cookies.delete("access_token") } catch {}
        return out
      }
      return NextResponse.json(data, { status: res.status })
    }

    // Multipart or default: treat as Nigerian flow with selfie file
    const incomingFormData = await req.formData()

    const upstreamForm = new FormData()
    const forwardKeys = [
      "firstname","lastname","gender","dob","phone_number","address","state","city","country","bvn","nin_number","id_type","id_number"
    ] as const
    for (const k of forwardKeys) {
      const val = incomingFormData.get(k)
      if (val !== null) upstreamForm.append(k, typeof val === 'string' ? val : String(val))
    }

    // Non-Nigerian support: include id_expiry when present
    const idExpiry = incomingFormData.get('id_expiry')
    if (idExpiry !== null) upstreamForm.append('id_expiry', typeof idExpiry === 'string' ? idExpiry : String(idExpiry))

    const selfie = incomingFormData.get("selfie")
    if (selfie && typeof selfie === "object") {
      const file = selfie as File
      upstreamForm.append("selfie", file, (file as any).name || "selfie.jpg")
    }

    // Non-Nigerian support: forward ID front/back files directly if provided
    // Accept multiple client variants, forward as backend-expected flat keys
    const idFrontCandidate =
      incomingFormData.get('proof_id_front') ??
      incomingFormData.get('proof_id.front') ??
      incomingFormData.get('proof_id[front]') ??
      incomingFormData.get('id_front')
    if (idFrontCandidate && typeof idFrontCandidate === 'object') {
      const file = idFrontCandidate as File
      upstreamForm.append('proof_id_front', file, (file as any).name || 'id_front.jpg')
    }

    const idBackCandidate =
      incomingFormData.get('proof_id_back') ??
      incomingFormData.get('proof_id.back') ??
      incomingFormData.get('proof_id[back]') ??
      incomingFormData.get('id_back')
    if (idBackCandidate && typeof idBackCandidate === 'object') {
      const file = idBackCandidate as File
      upstreamForm.append('proof_id_back', file, (file as any).name || 'id_back.jpg')
    }

    const livelinessRef = incomingFormData.get("liveliness_reference") ?? incomingFormData.get("liveliness_provider_reference") ?? incomingFormData.get("provider_reference") ?? incomingFormData.get("providerReference")
    const livelinessConfidence = incomingFormData.get("liveliness_confidence") ?? incomingFormData.get("confidence")
    if (livelinessRef) upstreamForm.append("liveliness_provider_reference", String(livelinessRef))
    if (livelinessConfidence) upstreamForm.append("liveliness_confidence", String(livelinessConfidence))

    const res = await fetch(endpoint, {
      method: "POST",
      headers: authHeaders,
      body: upstreamForm,
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))
    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 })
      try { out.cookies.delete("access_token") } catch {}
      return out
    }
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error("[userkyc] error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// POST /api/cloudinary/upload -> uploads an image file to Cloudinary
// Accepts multipart form-data with field `file`
// Returns { secure_url, public_id, ... } from Cloudinary
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    if (!file || typeof file !== "object") {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 })
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    const fd = new FormData()
    fd.append("file", file as File)

    // Prefer unsigned upload if preset configured, otherwise sign request
    if (uploadPreset) {
      fd.append("upload_preset", uploadPreset)
      fd.append("folder", "kyc-selfies")
    } else {
      const timestamp = Math.floor(Date.now() / 1000)
      if (!apiKey || !apiSecret) {
        return NextResponse.json({ error: "Cloudinary keys missing" }, { status: 500 })
      }
      // Signature base string: include folder for organization
      const paramsToSign = `folder=kyc-selfies&timestamp=${timestamp}`
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + apiSecret)
        .digest("hex")

      fd.append("api_key", apiKey)
      fd.append("timestamp", String(timestamp))
      fd.append("signature", signature)
      fd.append("folder", "kyc-selfies")
    }

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: fd,
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error("[cloudinary/upload] error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}
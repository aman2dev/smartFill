# 🚀 Autonomous Student Form-Filling Bot Blueprint & Architecture Guide

> **Notice**: This document is a complete, standalone architectural specification and technical guide for building an **Autonomous Form-Filling Bot System** from scratch using Node.js, Puppeteer Stealth, Telegram API, and Gemini 2.5 Flash AI. Feed this file directly to Gemini Flash for instant project context.

---

## 📌 PART 1: Core System Architecture

```
┌──────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Student on      │       │  Autonomous Bot      │       │  Headless Automation   │
│  Telegram / App  │ ────> │  Backend Engine      │ ────> │  (Puppeteer Stealth +  │
│  "/fill BPSC"    │       │  (Encrypted Vault)   │       │   Gemini 2.5 AI Agent) │
└──────────────────┘       └──────────────────────┘       └────────────────────────┘
         ▲                                                           │
         │                ┌──────────────────────┐                   │
         └─────────────── │ OTP / CAPTCHA Relay  │ <─────────────────┘
                          │ (Telegram Webhook)   │
                          └──────────────────────┘
```

### 1. Document Extraction & Vault
* **Vault Storage**: Students upload Aadhaar, marksheets, photo, and signature once into an encrypted vault.
* **0ms SHA-256 Document Caching**: Fast hashing of file payloads (`crypto.createHash('sha256')`) to cache extracted profile fields in RAM/DB and eliminate redundant AI vision extraction calls.

### 2. Multi-Strategy DOM Selection & Form Filling
To achieve 100% filling accuracy across any portal worldwide without manual hardcoding:
* **Strategy 0 (AI Selectors)**: W3C CSS selectors generated dynamically by Gemini 2.5 Flash.
* **Strategy A (Attribute Aliases)**: Deep attribute matching on `id`, `name`, and `placeholder` for keys (`full_name`, `father_name`, `dob`, `gender`, `address`, `present_address`, `phone`, `email`, etc.).
* **Strategy B (Multilingual Label Anchor Search)**: Semantic DOM text matching across English, Hindi, and regional scripts.

---

## 📌 PART 2: Crucial Technical Rules & Pitfalls to Avoid

### 1. Bilingual Text & Parentheses Cleaning Rule
* **Rule**: When evaluating DOM labels vs target fields (e.g. `"Candidate Date Of Birth (परीक्षार्थी की जन्मतिथि)*"`), **always strip helper text in parentheses, asterisks (*), and trailing colons from BOTH strings** before evaluating `.includes()`:
  ```typescript
  const cleanText = fullText.replace(/\([^)]*\)/g, '').replace(/[*:]/g, '').trim().toLowerCase();
  const cleanTargetText = targetText.replace(/\([^)]*\)/g, '').replace(/[*:]/g, '').trim().toLowerCase();
  
  if (cleanText.includes(cleanTargetText) || cleanTargetText.includes(cleanText)) {
    // Valid Match
  }
  ```

### 2. Paired Verification & Multi-Element Selector Collision
* **Rule**: Portals often have paired inputs (e.g., Primary DOB & Confirm DOB) that share identical HTML attributes (`input[placeholder='DD/MM/YYYY']`).
* **Fix**: Never use `document.querySelector` directly. Use `querySelectorAll` and pick the **first un-filled matching element**:
  ```typescript
  const matches = Array.from(document.querySelectorAll(field.selector));
  const aiMatch = matches.find((m) => !filledInputs.has(m));
  ```

### 3. Universal Address & Checkbox Handler
* **Rule**: Automatically detect and trigger *"Same as Permanent Address"* checkboxes (`/same_as_perm|same as permanent|स्थाई पते के समान/i`), firing native `click` & `change` events.
* **Fallback**: Automatically populate `present_address` fields using `address` / permanent address data if temporary address fields are present but omitted by the user.

### 4. DatePicker Focus Interception Handling
* **Rule**: When filling date inputs, remove `readonly` attributes first, apply value using native property setters (`Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set`), and dispatch native `input`, `change`, and `blur` events.

---

## 📌 PART 3: Advanced Autonomous Features

### 1. Gemini 2.5 Flash Vision Self-Correction Loop
1. **Fill**: Puppeteer stealth fills the form.
2. **Audit**: Puppeteer captures a full-page screenshot (`page.screenshot({ fullPage: true })`) and sends it to Gemini 2.5 Flash Vision.
3. **Self-Healing**: Gemini inspects the screenshot visually. If it detects an unfilled or incorrect field (e.g. *"Verify DOB is empty"*), it issues a targeted Puppeteer command to fix it automatically.

### 2. Human-in-the-Loop OTP Relay
1. When Puppeteer encounters a mobile/email OTP screen, backend emits a Telegram prompt: *"Enter OTP sent to your phone ending in 4589"*.
2. Student replies `748291` on Telegram.
3. Telegram webhook injects the OTP into Puppeteer to continue submission.

### 3. Virtual Webcam Stream for Live Photos (SSC / BPSC / NTA)
For portals requiring live webcam capture instead of photo upload:
* Launch Puppeteer with Chrome virtual media flags:
  ```javascript
  const browser = await puppeteer.launch({
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--use-file-for-fake-video-capture=/path/to/student_photo.y4m'
    ]
  });
  ```
* Chrome streams the student's photo as a virtual live webcam video feed when the portal activates the camera.

### 4. Full-Page Screenshot Confirmation & PDF Delivery
1. Once Gemini confirms 100% visual accuracy, Telegram sends the screenshot to the student with inline action buttons: `[✅ Confirm & Submit]` and `[✏️ Edit Details]`.
2. Student clicks **Confirm** $\rightarrow$ Puppeteer submits the form, downloads the official Application PDF, and sends it directly to the student on Telegram!

---
*Standalone Technical Specification for Autonomous Student Form Bot.*

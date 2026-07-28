# smartFill Specification 2.0: Pure White Theme, Multimodal AI Document Processing & Universal Extension Autofill

## Overview
smartFill is a browser extension and document intelligence vault designed for government exam applicants in India. Users can upload official identity cards and certificates (Aadhaar Card, 10th/12th Marksheets, Domicile, Degree, PAN Card) in PDF, PNG, JPEG, or WEBP format. The built-in Gemini 2.5 Flash Multimodal AI extracts all key text & fields from the documents, saves them securely in browser local storage (`chrome.storage.local` / `localStorage`), and automatically populates any active government exam application form upon clicking "Auto Fill".

---

## 1. Design & UI Specifications (Pure White & Solid Orange Theme)
- **Background**: Pure White (`#ffffff` / `bg-white`) replacing all dark slate and blue backgrounds.
- **Card Containers & Surfaces**: Off-white/slate-50 (`#f8fafc` / `bg-slate-50`), with clean light borders (`#e2e8f0` / `border-slate-200`) and subtle drop shadows (`shadow-sm`).
- **Typography**: Dark slate (`#0f172a` / `text-slate-900`) for headers and readable dark gray (`#475569` / `text-slate-600`) for body text.
- **Secondary & Action Color**: **Solid Vibrant Orange** (`#f97316` / `bg-orange-500`, `hover:bg-orange-600`, `text-white`) for:
  - Primary CTA buttons ("Save Profile", "Auto Fill Active Form", "Test PDF AI")
  - Active tab indicators in Navbar
  - Upload dropzone highlight states
  - Key status badges & highlights

---

## 2. End-to-End Multimodal AI & Local Storage Workflow

```
┌──────────────────────────────┐
│ User Uploads Document        │
│ (PDF, PNG, JPEG, WEBP)       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Browser FileReader Converts  │
│ File -> Base64 Binary Data   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Gemini 2.5 Flash AI Vision   │
│ (src/services/imagetotext.ts)│
│ Extracts Text & JSON Fields  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 1. Save Document & Raw Text  │
│    in Browser Local Vault    │
│ 2. Auto-Merge Extracted Keys │
│    into Master StudentProfile│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ User Navigates to Exam Form  │
│ & Clicks "Auto Fill"         │
│ (Script Injects & Fills Form)│
└──────────────────────────────┘
```

---

## 3. Data Schema & Field Mapping Rules

### Master Student Profile Schema (`studentProfile`)
Stored key-value structure in `chrome.storage.local` & `localStorage`:
```json
{
  "full_name": "Rahul Sharma",
  "father_name": "Mahesh Sharma",
  "mother_name": "Sunita Sharma",
  "gender": "Male",
  "category": "OBC",
  "aadhaar_no": "5489 1204 9832",
  "address": "Flat 402, Green Valley Apartments",
  "city": "New Delhi",
  "town": "Connaught Place",
  "photo_base64": "data:image/png;base64,..."
}
```

### Universal Exam Portal Field Matchers (including BPSC / SSC / UPSC forms)
Matching rules for English and Hindi input labels:
- **Full Name**: `["Applicant Name", "Full Name", "Candidate Name", "Name", "आवेदक का नाम", "नाम"]` $\rightarrow$ `full_name`
- **Confirm / Verify Full Name**: `["Confirm Full Name", "Verify Candidate Name", "Re-enter Full Name", "पुष्टि करें नाम"]` $\rightarrow$ `full_name`
- **Father's Name**: `["Father's Name", "Father Name", "पिता का नाम"]` $\rightarrow$ `father_name`
- **Confirm / Verify Father's Name**: `["Confirm Father's Name", "Verify Father's Name", "Re-enter Father's Name", "Father's Name (Confirm)", "पुष्टि करें पिता का नाम"]` $\rightarrow$ `father_name`
- **Mother's Name**: `["Mother's Name", "Mother Name", "माता का नाम"]` $\rightarrow$ `mother_name`
- **Confirm / Verify Mother's Name**: `["Confirm Mother's Name", "Verify Mother's Name", "Re-enter Mother's Name", "Mother's Name (Confirm)", "पुष्टि करें माता का नाम"]` $\rightarrow$ `mother_name`
- **Gender / Sex**: `["Gender", "Sex", "लिंग"]` $\rightarrow$ `gender`
- **Category / Community**: `["Category", "Caste Category", "Social Category", "वर्ग", "श्रेणी"]` $\rightarrow$ `category`
- **Aadhaar Number**: `["Aadhaar Number", "Aadhaar No", "Aadhaar", "आधार संख्या", "UID"]` $\rightarrow$ `aadhaar_no`
- **Confirm / Verify Aadhaar**: `["Confirm Aadhaar Number", "Re-enter Aadhaar", "Verify Aadhaar"]` $\rightarrow$ `aadhaar_no`
- **Address**: `["Permanent Address", "Address Line 1", "Correspondence Address", "पता"]` $\rightarrow$ `address`
- **City**: `["City", "District", "शहर", "जिला"]` $\rightarrow$ `city`
- **Town**: `["Town", "Tehsil", "कस्बा", "तहसील"]` $\rightarrow$ `town`

---

## 4. Implementation Steps & Planned Changes

1. **`index.css` & Global Styles**:
   - Set body background to `#ffffff` and text color to `#0f172a`.
   - Configure selection styles with orange highlights (`selection:bg-orange-500 selection:text-white`).

2. **Navbar (`src/components/Navbar.tsx`)**:
   - White sticky top header (`bg-white border-b border-slate-200 shadow-sm`).
   - Clean dark text and solid orange active tab pills.

3. **Document Vault (`src/components/DocumentVault.tsx`)**:
   - White card background with light gray border (`border-slate-200`).
   - Drag and drop file uploader with orange accents.
   - When a user uploads a document (File object):
     1. Call `main(file)` in `src/services/imagetotext.ts`.
     2. Gemini extracts text & JSON output and logs it to `console.log`.
     3. Automatically update `studentProfile` in browser storage with extracted name, father name, Aadhaar no, address, etc.
     4. Save document metadata in `StoredDocument[]`.

4. **Master Profile Form (`src/components/UserProfileForm.tsx`)**:
   - White form container with orange submit button.
   - Auto-reflects values extracted by AI whenever new documents are processed.

5. **Extension Popup View (`src/components/PopupView.tsx`)**:
   - Crisp white popup container (`bg-white text-slate-900 border-slate-200`).
   - Solid orange "Auto Fill Active Form" CTA button.

6. **Content Script (`src/services/contentScript.ts`)**:
   - Native property setter descriptor override to bypass React / Angular input locks on government portals.

---

## 5. Verification & Testing Criteria
1. **Light Theme Verification**: Ensure no dark blue / black cards remain; all backgrounds are pure white and slate-50 with solid orange buttons.
2. **AI Multimodal Extraction**: Test uploading an image (`.png`/`.jpg`) or PDF (`.pdf`). Verify text is extracted via `imagetotext.ts` and logged to `console.log`.
3. **Storage Persistence**: Verify `chrome.storage.local` (and `localStorage` fallback) contains the extracted fields under `studentProfile`.
4. **Autofill Execution**: Test clicking "Auto Fill" in the popup to confirm inputs are populated instantly.

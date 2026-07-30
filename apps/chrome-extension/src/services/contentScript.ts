export interface RecipeMapping {
  match_label: string;
  profile_key: string;
  is_verify?: boolean;
}

export const activeExamRecipe: RecipeMapping[] = [
  // Full Name & BPSC Verification
  { match_label: "Candidate Name", profile_key: "full_name", is_verify: false },
  { match_label: "Applicant Name", profile_key: "full_name", is_verify: false },
  { match_label: "Full Name", profile_key: "full_name", is_verify: false },
  { match_label: "Name", profile_key: "full_name", is_verify: false },
  { match_label: "परीक्षार्थी का नाम", profile_key: "full_name", is_verify: false },
  { match_label: "आवेदक का नाम", profile_key: "full_name", is_verify: false },

  { match_label: "Verify Candidate Name", profile_key: "full_name", is_verify: true },
  { match_label: "Confirm Candidate Name", profile_key: "full_name", is_verify: true },
  { match_label: "Confirm Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "Verify Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "Re-enter Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "परीक्षार्थी का नाम सत्यापित करें", profile_key: "full_name", is_verify: true },

  // Father's Name & Verification
  { match_label: "Candidate Father Name", profile_key: "father_name", is_verify: false },
  { match_label: "Candidate Father's Name", profile_key: "father_name", is_verify: false },
  { match_label: "Father's Name", profile_key: "father_name", is_verify: false },
  { match_label: "Father Name", profile_key: "father_name", is_verify: false },
  { match_label: "परीक्षार्थी के पिता का नाम", profile_key: "father_name", is_verify: false },
  { match_label: "पिता का नाम", profile_key: "father_name", is_verify: false },

  { match_label: "Verify Candidate Father Name", profile_key: "father_name", is_verify: true },
  { match_label: "Verify Father's Name", profile_key: "father_name", is_verify: true },
  { match_label: "Confirm Father's Name", profile_key: "father_name", is_verify: true },
  { match_label: "Re-enter Father's Name", profile_key: "father_name", is_verify: true },
  { match_label: "Father's Name (Confirm)", profile_key: "father_name", is_verify: true },
  { match_label: "परीक्षार्थी के पिता का नाम सत्यापित करें", profile_key: "father_name", is_verify: true },

  // Mother's Name & Verification
  { match_label: "Candidate Mother Name", profile_key: "mother_name", is_verify: false },
  { match_label: "Candidate Mother's Name", profile_key: "mother_name", is_verify: false },
  { match_label: "Mother's Name", profile_key: "mother_name", is_verify: false },
  { match_label: "Mother Name", profile_key: "mother_name", is_verify: false },
  { match_label: "परीक्षार्थी की माता का नाम", profile_key: "mother_name", is_verify: false },
  { match_label: "माता का नाम", profile_key: "mother_name", is_verify: false },

  { match_label: "Verify Candidate Mother Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Verify Mother's Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Confirm Mother's Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Re-enter Mother's Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Mother's Name (Confirm)", profile_key: "mother_name", is_verify: true },
  { match_label: "परीक्षार्थी की माता का नाम सत्यापित करें", profile_key: "mother_name", is_verify: true },

  // Date of Birth & Verification
  { match_label: "Candidate Date of Birth", profile_key: "dob", is_verify: false },
  { match_label: "Date of Birth", profile_key: "dob", is_verify: false },
  { match_label: "DOB", profile_key: "dob", is_verify: false },
  { match_label: "परीक्षार्थी की जन्मतिथि", profile_key: "dob", is_verify: false },

  { match_label: "Verify Candidate Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Verify Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Confirm Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "परीक्षार्थी की जन्मतिथि सत्यापित करें", profile_key: "dob", is_verify: true },

  // Gender & Verification
  { match_label: "Gender", profile_key: "gender", is_verify: false },
  { match_label: "Sex", profile_key: "gender", is_verify: false },
  { match_label: "लिंग", profile_key: "gender", is_verify: false },

  { match_label: "Verify Gender", profile_key: "gender", is_verify: true },
  { match_label: "Confirm Gender", profile_key: "gender", is_verify: true },
  { match_label: "लिंग सत्यापित करें", profile_key: "gender", is_verify: true },

  // Email & Verification
  { match_label: "Email Id", profile_key: "email", is_verify: false },
  { match_label: "Email", profile_key: "email", is_verify: false },
  { match_label: "ईमेल आईडी", profile_key: "email", is_verify: false },

  // Mobile / Phone
  { match_label: "Mobile Number", profile_key: "phone", is_verify: false },
  { match_label: "Phone", profile_key: "phone", is_verify: false },
  { match_label: "मोबाइल नंबर", profile_key: "phone", is_verify: false },

  // Category
  { match_label: "Category", profile_key: "category", is_verify: false },
  { match_label: "Caste Category", profile_key: "category", is_verify: false },
  { match_label: "Social Category", profile_key: "category", is_verify: false },
  { match_label: "वर्ग", profile_key: "category", is_verify: false },
  { match_label: "श्रेणी", profile_key: "category", is_verify: false },

  // Aadhaar & Verification
  { match_label: "Aadhaar Number", profile_key: "aadhaar_no", is_verify: false },
  { match_label: "Aadhaar", profile_key: "aadhaar_no", is_verify: false },
  { match_label: "आधार संख्या", profile_key: "aadhaar_no", is_verify: false },
  { match_label: "Confirm Aadhaar", profile_key: "aadhaar_no", is_verify: true },
  { match_label: "Verify Aadhaar", profile_key: "aadhaar_no", is_verify: true },

  // Address
  { match_label: "Permanent Address", profile_key: "address", is_verify: false },
  { match_label: "Address Line 1", profile_key: "address", is_verify: false },
  { match_label: "Address", profile_key: "address", is_verify: false },
  { match_label: "City", profile_key: "city", is_verify: false },
  { match_label: "District", profile_key: "city", is_verify: false },
  { match_label: "Town", profile_key: "town", is_verify: false }
];

/**
 * Universal Engine Filler Function:
 * Executed in target web page context via chrome.scripting.executeScript.
 * Smartly isolates label text (differentiating "Verify Candidate Name" vs "Candidate Name"),
 * uses deep container searching, and bypasses framework locks (React/Angular/Vue).
 */
export function universalEngineFiller(recipe: RecipeMapping[], profile: Record<string, any>) {
  const filledInputs = new Set<Element>();

  recipe.forEach((field) => {
    const targetText = field.match_label;
    const valueToFill = profile[field.profile_key];

    if (!valueToFill) return;

    // Retrieve candidate label elements (labels, legends, headers, span, p, td, th)
    const elements = Array.from(document.querySelectorAll('label, legend, span, th, td, p, div.form-group, font, strong, b'));
    
    // Find matching label anchor element with exact verification filtering
    const anchor = elements.find((el) => {
      const text = (el as HTMLElement).innerText || '';
      if (!text.toLowerCase().includes(targetText.toLowerCase())) return false;

      const hasVerifyKeyword = /verify|confirm|re-enter|reenter|सत्यापित|पुष्टि/i.test(text);

      // If rule is NOT for verify, reject elements that contain verify keywords!
      if (!field.is_verify && hasVerifyKeyword && !/verify|confirm|re-enter|reenter|सत्यापित|पुष्टि/i.test(targetText)) {
        return false;
      }
      return true;
    });

    if (!anchor) return;

    // Locate the associated input or select field
    let inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;

    // 1. Check if anchor is a <label for="inputId">
    if (anchor.tagName === 'LABEL' && (anchor as HTMLLabelElement).htmlFor) {
      const linked = document.getElementById((anchor as HTMLLabelElement).htmlFor);
      if (linked && !filledInputs.has(linked)) {
        inputElement = linked as any;
      }
    }

    // 2. Check if input is inside the anchor
    if (!inputElement) {
      const nested = anchor.querySelector('input:not([type="hidden"]), select, textarea');
      if (nested && !filledInputs.has(nested)) {
        inputElement = nested as any;
      }
    }

    // 3. Search upward in DOM parent hierarchy (e.g. form-group, col, div, tr)
    if (!inputElement) {
      let parent: HTMLElement | null = anchor.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        const found = parent.querySelector('input:not([type="hidden"]), select, textarea');
        if (found && !filledInputs.has(found)) {
          inputElement = found as any;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    }

    if (!inputElement || filledInputs.has(inputElement)) return;

    // Mark element as filled to prevent overwriting
    filledInputs.add(inputElement);

    // Apply visual highlight
    inputElement.style.border = '2px solid #ea580c';
    inputElement.focus();

    // Handle Select Dropdowns
    if (inputElement.tagName === 'SELECT') {
      const selectElem = inputElement as HTMLSelectElement;
      const options = Array.from(selectElem.options);
      const valStr = String(valueToFill).toLowerCase();

      const matchedOpt = options.find((opt) => {
        const optTxt = opt.text.toLowerCase();
        const optVal = opt.value.toLowerCase();
        return optTxt.includes(valStr) || optVal.includes(valStr) || (valStr === 'male' && optTxt.includes('पुरुष'));
      });

      if (matchedOpt) {
        selectElem.value = matchedOpt.value;
        selectElem.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    // Native descriptor setters for React/Angular/Vue input field state locks
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const txSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    if (inputElement.tagName === 'TEXTAREA' && txSetter) {
      txSetter.call(inputElement, valueToFill);
    } else if (nativeSetter) {
      nativeSetter.call(inputElement, valueToFill);
    } else {
      inputElement.value = valueToFill;
    }

    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    inputElement.blur();
  });
}

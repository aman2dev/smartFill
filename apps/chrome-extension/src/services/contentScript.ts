export interface RecipeMapping {
  match_label: string;
  profile_key: string;
  is_verify?: boolean;
  selector?: string;
  strategy?: string;
}

export const activeExamRecipe: RecipeMapping[] = [
  // Primary Fields
  { match_label: "Candidate Name", profile_key: "full_name", is_verify: false },
  { match_label: "Applicant Name", profile_key: "full_name", is_verify: false },
  { match_label: "Full Name", profile_key: "full_name", is_verify: false },
  { match_label: "परीक्षार्थी का नाम", profile_key: "full_name", is_verify: false },
  { match_label: "आवेदक का नाम", profile_key: "full_name", is_verify: false },

  // Verification Fields
  { match_label: "Verify Candidate Name", profile_key: "full_name", is_verify: true },
  { match_label: "Confirm Candidate Name", profile_key: "full_name", is_verify: true },
  { match_label: "Confirm Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "Verify Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "Re-enter Full Name", profile_key: "full_name", is_verify: true },
  { match_label: "परीक्षार्थी का नाम सत्यापित करें", profile_key: "full_name", is_verify: true },

  // Father's Name & Verification
  { match_label: "Father's Name", profile_key: "father_name", is_verify: false },
  { match_label: "Candidate Father Name", profile_key: "father_name", is_verify: false },
  { match_label: "Candidate Father's Name", profile_key: "father_name", is_verify: false },
  { match_label: "परीक्षार्थी के पिता का नाम", profile_key: "father_name", is_verify: false },

  { match_label: "Verify Candidate Father Name", profile_key: "father_name", is_verify: true },
  { match_label: "Verify Father's Name", profile_key: "father_name", is_verify: true },
  { match_label: "Confirm Father's Name", profile_key: "father_name", is_verify: true },

  // Mother's Name & Verification
  { match_label: "Mother's Name", profile_key: "mother_name", is_verify: false },
  { match_label: "Candidate Mother Name", profile_key: "mother_name", is_verify: false },
  { match_label: "Candidate Mother's Name", profile_key: "mother_name", is_verify: false },
  { match_label: "परीक्षार्थी की माता का नाम", profile_key: "mother_name", is_verify: false },

  { match_label: "Verify Candidate Mother Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Verify Mother's Name", profile_key: "mother_name", is_verify: true },
  { match_label: "Confirm Mother's Name", profile_key: "mother_name", is_verify: true },

  // Date of Birth & Verification
  { match_label: "Candidate Date of Birth", profile_key: "dob", is_verify: false },
  { match_label: "Date of Birth", profile_key: "dob", is_verify: false },
  { match_label: "DOB", profile_key: "dob", is_verify: false },

  { match_label: "Verify Candidate Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Verify Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Confirm Date of Birth", profile_key: "dob", is_verify: true },

  // Gender & Verification
  { match_label: "Gender", profile_key: "gender", is_verify: false },
  { match_label: "Sex", profile_key: "gender", is_verify: false },

  { match_label: "Verify Gender", profile_key: "gender", is_verify: true },
  { match_label: "Confirm Gender", profile_key: "gender", is_verify: true },

  // Category
  { match_label: "Category", profile_key: "category", is_verify: false },
  { match_label: "Community", profile_key: "category", is_verify: false },

  // Aadhaar
  { match_label: "Aadhaar Number", profile_key: "aadhaar_no", is_verify: false },
  { match_label: "Aadhaar Card", profile_key: "aadhaar_no", is_verify: false },
  { match_label: "Aadhaar", profile_key: "aadhaar_no", is_verify: false },

  // Email & Phone
  { match_label: "Email Id", profile_key: "email", is_verify: false },
  { match_label: "Email Address", profile_key: "email", is_verify: false },
  { match_label: "Mobile Number", profile_key: "phone", is_verify: false },
  { match_label: "Mobile Phone", profile_key: "phone", is_verify: false },

  // Address
  { match_label: "Permanent Address", profile_key: "address", is_verify: false },
  { match_label: "Address", profile_key: "address", is_verify: false },
  { match_label: "City", profile_key: "city", is_verify: false },
  { match_label: "State", profile_key: "state", is_verify: false },
  { match_label: "PIN Code", profile_key: "pincode", is_verify: false }
];

/**
 * Universal Engine Filler Function:
 * Executed in target web page context via chrome.scripting.executeScript.
 * Smartly isolates label text, matches verification fields accurately,
 * excludes OTP fields, and bypasses framework locks (React/Angular/Vue).
 */
export function universalEngineFiller(recipe: RecipeMapping[], profile: Record<string, any>) {
  const filledInputs = new Set<Element>();

  const isVerifyText = (str: string) => /verify|confirm|re-enter|reenter|सत्यापित|पुष्टि/i.test(str);
  const isOtpText = (str: string) => /otp|password|passcode/i.test(str);

  // Specific key aliases (excluding loose 'name')
  const keyAliases: Record<string, string[]> = {
    full_name: ['candidatename', 'applicantname', 'fullname', 'full_name', 'candidate_name', 'applicant_name'],
    father_name: ['fathername', 'father_name', 'fathersname', 'father_full_name'],
    mother_name: ['mothername', 'mother_name', 'mothersname', 'mother_full_name'],
    dob: ['dob', 'dateofbirth', 'birthdate', 'candidate_dob'],
    gender: ['gender', 'sex', 'candidate_gender'],
    category: ['category', 'caste', 'socialcategory', 'community'],
    aadhaar_no: ['aadhaarnumber', 'aadhaar_no', 'aadhaar', 'uid_no'],
    email: ['email', 'emailid', 'email_id', 'emailaddress', 'user_email'],
    phone: ['mobilenumber', 'mobile_number', 'phone_number', 'mobile', 'cellphone'],
    address: ['permanentaddress', 'addressline1', 'street_address'],
    city: ['city', 'district'],
    state: ['state'],
    pincode: ['pincode', 'postalcode', 'zipcode'],
    panCard: ['pancard', 'pan_number'],
    accountNumber: ['accountnumber', 'bank_account_no'],
    ifscCode: ['ifsccode', 'bank_ifsc']
  };

  let fillCount = 0;

  // Process regular non-verify fields first, then verify fields
  const sortedRecipe = [...recipe].sort((a, b) => (a.is_verify === b.is_verify ? 0 : a.is_verify ? 1 : -1));

  sortedRecipe.forEach((field) => {
    const targetText = field.match_label;
    let valueToFill = profile[field.profile_key] || profile[targetText];

    if (!valueToFill) return;

    // Standardize DOB format if filling text/date inputs (e.g. DD/MM/YYYY vs YYYY-MM-DD)
    if (field.profile_key === 'dob') {
      const dobStr = String(valueToFill).trim();
      if (dobStr.includes('-') && dobStr.length === 10) {
        const parts = dobStr.split('-');
        if (parts[0].length === 4) {
          // Converts YYYY-MM-DD to DD/MM/YYYY
          valueToFill = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
    }

    // Standardize Mobile number (clean spaces/dashes)
    if (field.profile_key === 'phone') {
      valueToFill = String(valueToFill).replace(/\D/g, '');
      if (valueToFill.length > 10 && valueToFill.startsWith('91')) {
        valueToFill = valueToFill.slice(-10);
      }
    }

    let inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;

    // Strategy 0: AI CSS Selector Match (highest precision generated by Gemini)
    if (field.selector) {
      try {
        const aiMatch = document.querySelector(field.selector);
        if (aiMatch && !filledInputs.has(aiMatch)) {
          inputElement = aiMatch as any;
        }
      } catch (e) {
        // Ignore invalid selector syntax
      }
    }

    // Strategy A: Direct Match by ID, name, or placeholder using key aliases
    if (!inputElement) {
      const aliases = keyAliases[field.profile_key] || [field.profile_key];
      for (const alias of aliases) {
        const candidates = Array.from(document.querySelectorAll(
          `input[id*="${alias}" i]:not([type="hidden"]), input[name*="${alias}" i]:not([type="hidden"]), select[id*="${alias}" i], select[name*="${alias}" i], textarea[id*="${alias}" i], textarea[name*="${alias}" i]`
        ));

        for (const cand of candidates) {
          if (filledInputs.has(cand)) continue;

          const inputCand = cand as HTMLInputElement;
          const attrStr = `${inputCand.id || ''} ${inputCand.name || ''} ${inputCand.placeholder || ''}`;
          
          // Exclude OTP fields
          if (isOtpText(attrStr)) continue;

          const hasVerify = isVerifyText(attrStr);
          if (field.is_verify && !hasVerify) continue;
          if (!field.is_verify && hasVerify) continue;

          inputElement = inputCand as any;
          break;
        }
        if (inputElement) break;
      }
    }

    // Strategy B: DOM Label / Text Anchor search
    if (!inputElement) {
      const elements = Array.from(document.querySelectorAll('label, legend, span, th, td, p, div, font, strong, b'));
      const anchor = elements.find((el) => {
        const fullText = (el as HTMLElement).innerText || '';
        if (isOtpText(fullText)) return false;

        // Remove helper text in parentheses before matching label
        const cleanText = fullText.replace(/\([^)]*\)/g, '').trim();

        if (!cleanText.toLowerCase().includes(targetText.toLowerCase())) {
          return false;
        }

        const hasVerifyKeyword = isVerifyText(fullText);
        if (!field.is_verify && hasVerifyKeyword && !isVerifyText(targetText)) {
          return false;
        }
        if (field.is_verify && !hasVerifyKeyword) {
          return false;
        }
        return true;
      });

      if (anchor) {
        if (anchor.tagName === 'LABEL' && (anchor as HTMLLabelElement).htmlFor) {
          const linked = document.getElementById((anchor as HTMLLabelElement).htmlFor);
          if (linked && !filledInputs.has(linked) && !isOtpText(linked.id || '')) {
            inputElement = linked as any;
          }
        }

        if (!inputElement) {
          const nested = anchor.querySelector('input:not([type="hidden"]), select, textarea');
          if (nested && !filledInputs.has(nested) && !isOtpText((nested as HTMLInputElement).name || '')) {
            inputElement = nested as any;
          }
        }

        if (!inputElement) {
          let parent: HTMLElement | null = anchor.parentElement;
          let depth = 0;
          while (parent && depth < 5) {
            const found = parent.querySelector('input:not([type="hidden"]), select, textarea');
            if (found && !filledInputs.has(found)) {
              const inputFound = found as HTMLInputElement;
              if (!isOtpText(inputFound.name || '')) {
                const attrStr = `${inputFound.id || ''} ${inputFound.name || ''} ${inputFound.placeholder || ''}`;
                const hasVerify = isVerifyText(attrStr);
                if ((field.is_verify && hasVerify) || (!field.is_verify && !hasVerify)) {
                  inputElement = inputFound as any;
                  break;
                }
              }
            }
            parent = parent.parentElement;
            depth++;
          }
        }
      }
    }

    if (!inputElement || filledInputs.has(inputElement)) return;

    filledInputs.add(inputElement);
    fillCount++;

    // Visual feedback highlight (preserves webpage theme & background color)
    inputElement.style.outline = '2px solid #f97316';
    inputElement.style.outlineOffset = '1px';
    inputElement.focus();

    // Select Dropdowns
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

    // Standardize DOB format depending on target input type (HTML5 date vs text picker)
    if (field.profile_key === 'dob') {
      let rawDob = String(valueToFill).trim();
      let day = '', month = '', year = '';

      if (rawDob.includes('-')) {
        const p = rawDob.split('-');
        if (p[0].length === 4) { year = p[0]; month = p[1]; day = p[2]; }
        else { day = p[0]; month = p[1]; year = p[2]; }
      } else if (rawDob.includes('/')) {
        const p = rawDob.split('/');
        if (p[2]?.length === 4) { day = p[0]; month = p[1]; year = p[2]; }
        else if (p[0]?.length === 4) { year = p[0]; month = p[1]; day = p[2]; }
      }

      if (day && month && year) {
        day = day.padStart(2, '0');
        month = month.padStart(2, '0');
        
        if (inputElement && (inputElement as HTMLInputElement).type === 'date') {
          valueToFill = `${year}-${month}-${day}`;
        } else {
          valueToFill = `${day}/${month}/${year}`;
        }
      }
    }

    // Remove readonly attribute if present (common in JavaScript DatePickers)
    if (inputElement.hasAttribute('readonly')) {
      inputElement.removeAttribute('readonly');
    }

    // Trigger initial click & focus for DatePickers
    inputElement.dispatchEvent(new Event('click', { bubbles: true }));
    inputElement.dispatchEvent(new Event('focus', { bubbles: true }));

    // Set HTML value attribute directly
    inputElement.setAttribute('value', valueToFill);

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

    // Comprehensive event suite for DatePickers & modern web frameworks
    inputElement.dispatchEvent(new Event('keydown', { bubbles: true }));
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('keyup', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    inputElement.dispatchEvent(new Event('blur', { bubbles: true }));

    // jQuery DatePicker widget hook if present
    try {
      if ((window as any).$ || (window as any).jQuery) {
        const $ = (window as any).$ || (window as any).jQuery;
        if ($(inputElement).datepicker) {
          $(inputElement).datepicker('setDate', valueToFill);
        }
      }
    } catch (e) {
      // Non-fatal if jQuery datepicker not active
    }
  });

  return fillCount;
}

// Global window listener for background/popup message events
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'AUTOFILL_FORM') {
      universalEngineFiller(activeExamRecipe, event.data.payload || {});
    }
  });
}

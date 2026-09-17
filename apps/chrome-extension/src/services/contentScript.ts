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
  { match_label: "Confirm Candidate Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Re-enter Candidate Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Verify Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Confirm Date of Birth", profile_key: "dob", is_verify: true },
  { match_label: "Re-enter Date of Birth", profile_key: "dob", is_verify: true },

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

  const isVerifyText = (str: string) => /verify|confirm|re-enter|reenter|सत्यापित|पुष्टि|(?:\b|_|-)re(?:_|-|\b)|(?:\b|_|-)v(?:_|-|\b)|(?:_|-)?(?:2)$/i.test(str);
  const isOtpText = (str: string) => /otp|password|passcode/i.test(str);

  // Specific key aliases (excluding loose 'name')
  const keyAliases: Record<string, string[]> = {
    full_name: ['candidatename', 'applicantname', 'fullname', 'full_name', 'candidate_name', 'applicant_name'],
    father_name: ['fathername', 'father_name', 'fathersname', 'father_full_name'],
    mother_name: ['mothername', 'mother_name', 'mothersname', 'mother_full_name'],
    dob: ['dob', 'dateofbirth', 'date_of_birth', 'birthdate', 'candidatedob', 'candidate_dob', 'txtdob', 'txt_dob', 'verifycandidatedob', 'verifydob', 'confirmdob', 're_dob', 'dob2', 'txtdob2', 'verify_dob'],
    gender: ['gender', 'sex', 'candidate_gender'],
    category: ['category', 'caste', 'socialcategory', 'community'],
    aadhaar_no: ['aadhaarnumber', 'aadhaar_no', 'aadhaar', 'uid_no'],
    email: ['email', 'emailid', 'email_id', 'emailaddress', 'user_email'],
    phone: ['mobilenumber', 'mobile_number', 'phone_number', 'mobile', 'cellphone'],
    address: ['permanentaddress', 'addressline1', 'street_address', 'perm_address'],
    present_address: ['presentaddress', 'correspondenceaddress', 'currentaddress', 'tempaddress', 'present_address', 'corr_address'],
    city: ['city', 'district', 'perm_city'],
    present_city: ['presentcity', 'correspondencecity', 'currentcity', 'present_city'],
    state: ['state', 'perm_state'],
    present_state: ['presentstate', 'correspondencestate', 'currentstate', 'present_state'],
    pincode: ['pincode', 'postalcode', 'zipcode', 'perm_pin'],
    present_pincode: ['presentpincode', 'correspondencepincode', 'currentpincode', 'present_pin', 'corr_pin'],
    panCard: ['pancard', 'pan_number'],
    accountNumber: ['accountnumber', 'bank_account_no'],
    ifscCode: ['ifsccode', 'bank_ifsc']
  };

  let fillCount = 0;

  // Universal Same-as-Permanent Address Checkbox Auto-Trigger
  try {
    const sameAsPermCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter((cb) => {
      const inputCb = cb as HTMLInputElement;
      const textStr = `${inputCb.id || ''} ${inputCb.name || ''} ${inputCb.parentElement?.innerText || ''}`.toLowerCase();
      return /same_as_perm|sameasperm|same as permanent|same as present|copy address|स्थाई पते के समान|समान/i.test(textStr);
    });
    sameAsPermCheckboxes.forEach((cb) => {
      const inputCb = cb as HTMLInputElement;
      if (!inputCb.checked) {
        inputCb.checked = true;
        inputCb.dispatchEvent(new Event('click', { bubbles: true }));
        inputCb.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[smartFill] Auto-clicked Same as Permanent Address checkbox');
      }
    });
  } catch (e) {}

  // Process regular non-verify fields first, then verify fields
  const sortedRecipe = [...recipe].sort((a, b) => (a.is_verify === b.is_verify ? 0 : a.is_verify ? 1 : -1));

  sortedRecipe.forEach((field) => {
    const targetText = field.match_label;
    const baseKey = String(field.profile_key).replace(/^(verify_|confirm_|re_enter_|reenter_|re_)/i, '');
    let valueToFill = profile[field.profile_key] || profile[baseKey] || profile[targetText];

    // Address Fallback: If present_address is requested but empty, fallback to permanent address
    if (!valueToFill && field.profile_key.startsWith('present_')) {
      const fallbackKey = field.profile_key.replace('present_', '');
      valueToFill = profile[fallbackKey] || profile[field.profile_key.replace('present_', 'perm_')];
    }

    if (!valueToFill) return;

    // Standardize DOB format if filling text/date inputs (e.g. DD/MM/YYYY vs YYYY-MM-DD)
    if (field.profile_key === 'dob' || baseKey === 'dob') {
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
    if (field.profile_key === 'phone' || baseKey === 'phone') {
      valueToFill = String(valueToFill).replace(/\D/g, '');
      if (valueToFill.length > 10 && valueToFill.startsWith('91')) {
        valueToFill = valueToFill.slice(-10);
      }
    }

    let inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;

    // Strategy 0: AI CSS Selector Match (highest precision generated by Gemini)
    if (field.selector) {
      try {
        let matches: Element[] = [];
        // Safely resolve numeric ID selectors (e.g. #78248 -> document.getElementById('78248'))
        if (field.selector.match(/^#\d+$/)) {
          const numId = field.selector.slice(1);
          const elem = document.getElementById(numId) || document.querySelector(`[id="${numId}"]`);
          if (elem) matches.push(elem);
        } else {
          matches = Array.from(document.querySelectorAll(field.selector));
        }

        // Fallback: If selector used :nth-of-type or :nth-child across parent containers and returned 0, strip and find unfilled match!
        if (matches.length === 0 && (field.selector.includes(':nth-of-type') || field.selector.includes(':nth-child'))) {
          const cleanSelector = field.selector.replace(/:(?:nth-of-type|nth-child)\(\d+\)/g, '').trim();
          if (cleanSelector) {
            matches = Array.from(document.querySelectorAll(cleanSelector));
          }
        }

        // Find the first un-filled candidate matching the selector
        const aiMatch = matches.find((m) => !filledInputs.has(m));
        if (aiMatch) {
          inputElement = aiMatch as any;
        }
      } catch (e) {
        // Ignore invalid selector syntax
      }
    }

    // Strategy A: Direct Match by ID, name, or placeholder using key aliases
    if (!inputElement) {
      const aliases = keyAliases[field.profile_key] || keyAliases[baseKey] || [field.profile_key];
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

        // Remove helper text in parentheses, red asterisks (*), and trailing colons from both DOM label and target text
        const cleanText = fullText.replace(/\([^)]*\)/g, '').replace(/[*:]/g, '').trim().toLowerCase();
        const cleanTargetText = targetText.replace(/\([^)]*\)/g, '').replace(/[*:]/g, '').trim().toLowerCase();

        if (!cleanText.includes(cleanTargetText) && !cleanTargetText.includes(cleanText)) {
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
            const foundInputs = Array.from(parent.querySelectorAll('input:not([type="hidden"]), select, textarea'));
            const candidates = foundInputs.filter((el) => !filledInputs.has(el) && !isOtpText((el as HTMLInputElement).name || '') && !isOtpText((el as HTMLInputElement).id || ''));

            if (candidates.length > 0) {
              if (candidates.length === 1) {
                // If container has exactly 1 unfilled input, it directly belongs to this anchor!
                inputElement = candidates[0] as any;
                break;
              } else {
                // Multiple inputs in container -> prefer one whose attributes match verify state
                const matched = candidates.find((cand) => {
                  const inp = cand as HTMLInputElement;
                  const attrStr = `${inp.id || ''} ${inp.name || ''} ${inp.placeholder || ''}`;
                  const hasVerify = isVerifyText(attrStr);
                  return field.is_verify ? hasVerify : !hasVerify;
                }) || candidates[0];
                inputElement = matched as any;
                break;
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

    // Clean visual feedback (temporary subtle pulse that disappears after 1s, leaving clean inputs)
    inputElement.style.outline = '2px solid #10b981';
    inputElement.style.outlineOffset = '1px';
    inputElement.style.boxShadow = '';
    inputElement.removeAttribute('data-smartfill-missing');
    setTimeout(() => {
      try {
        inputElement.style.outline = '';
        inputElement.style.outlineOffset = '';
      } catch (e) {}
    }, 1000);
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

    // Radio Buttons & Checkboxes Handler (Universal for all websites & multilingual labels)
    if (inputElement.tagName === 'INPUT' && (inputElement.type === 'radio' || inputElement.type === 'checkbox')) {
      const name = (inputElement as HTMLInputElement).name;
      const valStr = String(valueToFill).toLowerCase().trim();

      const candidates = name ? Array.from(document.querySelectorAll(`input[name="${name}"]`)) : [inputElement];
      const matched = candidates.find((cand) => {
        const inputCand = cand as HTMLInputElement;
        const candVal = (inputCand.value || '').toLowerCase();
        const candId = (inputCand.id || '').toLowerCase();
        const parentText = inputCand.parentElement?.innerText?.toLowerCase() || '';
        const labelEl = inputCand.id ? document.querySelector(`label[for="${inputCand.id}"]`) : null;
        const labelText = (labelEl as HTMLElement)?.innerText?.toLowerCase() || '';
        
        const combinedText = `${candVal} ${candId} ${parentText} ${labelText}`;

        if (valStr === 'male' || valStr === 'm') {
          return combinedText.includes('male') || combinedText.includes('पुरुष') || candVal === 'm' || candVal === 'male';
        }
        if (valStr === 'female' || valStr === 'f') {
          return combinedText.includes('female') || combinedText.includes('महिला') || candVal === 'f' || candVal === 'female';
        }
        return combinedText.includes(valStr) || candVal.includes(valStr);
      });

      const targetInput = (matched || inputElement) as HTMLInputElement;
      targetInput.checked = true;
      targetInput.dispatchEvent(new Event('click', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
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

  // Safe Negative Declarations (SND) & Smart Common Defaults Engine
  let safeDefaultsCount = 0;

  if (profile.enableSafeDefaults !== false) {
    const declarationRules = [
      {
        id: 'proxy',
        pattern: /proxy|appearing\s*on\s*behalf/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'debarment',
        pattern: /debar|debarred|dismissed|rusticated|blacklisted|निष्कासित|डिबार/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'criminal',
        pattern: /criminal|fir\b|charge\s*sheet|pending\s*case|convict|court\s*of\s*law|prosecut|आपराधिक|मुकदमा|दोषी|वारंट/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'court_convicted',
        pattern: /arrested|detained|convicted|court\s*of\s*law/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'dept_enquiry',
        pattern: /departmental\s*enquiry|disciplinary\s*action|विभागीय\s*जांच/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'ex_serviceman',
        pattern: /ex-servicemen|ex\s*serviceman|esm\b|defense\s*personnel|armed\s*forces|भूतपूर्व\s*सैनिक/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'disability',
        pattern: /disability|pwbd|ph\b|handicapped|divyang|cerebral\s*palsy|scribe|physical\s*limitation|limitation\s*to\s*write|विकलांग|दिव्यांग/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'departmental',
        pattern: /departmental|central\s*gov.*employee|regular\s*gov.*servant|civilian\s*employee|autonomous\s*body|undertaking|विभागीय|सरकारी\s*कर्मचारी/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'age_relaxation',
        pattern: /age\s*relaxation|आयु\s*सीमा\s*में\s*छूट/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'minority',
        pattern: /minority\s*community|minority|अल्पसंख्यक\s*समुदाय/i,
        aliases: ['no', 'nahi', 'नहीं', '0', 'n']
      },
      {
        id: 'job_opportunities',
        pattern: /job\s*opportunit|accessing\s*job|dop&t|dopt|share.*personal.*info|personal\s*info.*available/i,
        aliases: ['yes', 'haan', 'हाँ', '1', 'y']
      },
      {
        id: 'nationality',
        pattern: /nationality|citizenship|नागरिकता|राष्ट्रीयता/i,
        aliases: ['citizen of india', 'indian', 'india', 'भारतीय']
      },
      {
        id: 'marital_status',
        pattern: /marital\s*status|वैवाहिक\s*स्थिति/i,
        aliases: [String(profile.marital_status || 'unmarried').toLowerCase(), 'unmarried', 'single', 'अविवाहित', 'un-married']
      }
    ];

    // A. Radio groups auto-answering
    const radioInputs = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    const radioGroups = new Map<string, HTMLInputElement[]>();

    radioInputs.forEach((radio) => {
      if (filledInputs.has(radio)) return;
      const groupKey = radio.name || radio.closest('.gov-form-group, .form-group, fieldset, tr')?.getAttribute('id') || 'unnamed_group_' + Math.random();
      if (!radioGroups.has(groupKey)) {
        radioGroups.set(groupKey, []);
      }
      radioGroups.get(groupKey)!.push(radio);
    });

    radioGroups.forEach((groupRadios) => {
      if (groupRadios.some((r) => r.checked)) return;

      const firstRadio = groupRadios[0];

      // Build comprehensive question context by traversing up DOM tree
      let questionText = `${firstRadio.name || ''} ${firstRadio.id || ''} `;
      const ariaLabel = firstRadio.getAttribute('aria-label') || firstRadio.closest('fieldset')?.getAttribute('aria-label');
      if (ariaLabel) questionText += ariaLabel + ' ';

      let curr: HTMLElement | null = firstRadio.parentElement;
      for (let depth = 0; depth < 6 && curr && curr !== document.body; depth++) {
        const labels = Array.from(curr.querySelectorAll('label, legend, h3, h4, h5, h6, th, dt, p, .gov-label, .form-label, .control-label'));
        for (const l of labels) {
          const txt = (l as HTMLElement).innerText || '';
          if (txt.trim().length > 2 && !/^(yes|no|हाँ|नहीं|true|false|na|n\/a)$/i.test(txt.trim())) {
            questionText += txt + ' ';
          }
        }

        if (
          curr.classList.contains('gov-form-group') ||
          curr.classList.contains('form-group') ||
          curr.classList.contains('form-item') ||
          curr.classList.contains('form-row') ||
          curr.tagName === 'TR' ||
          curr.tagName === 'FIELDSET'
        ) {
          questionText += (curr.innerText || '') + ' ';
          break;
        }

        curr = curr.parentElement;
      }

      questionText = questionText.replace(/\s+/g, ' ');

      for (const rule of declarationRules) {
        if (rule.pattern.test(questionText)) {
          const targetRadio = groupRadios.find((r) => {
            const rVal = (r.value || '').toLowerCase().trim();
            const rId = (r.id || '').toLowerCase().trim();
            const rLabel = (document.querySelector(`label[for="${r.id}"]`) as HTMLElement)?.innerText?.toLowerCase().trim() || '';
            const rParent = r.parentElement?.innerText?.toLowerCase().trim() || '';

            return rule.aliases.some((alias) => {
              const a = alias.toLowerCase().trim();
              if (rVal === a || rId.endsWith(`_${a}`) || rId.endsWith(`-${a}`)) return true;
              const wordRegex = new RegExp(`(^|\\b|\\s)${a}(\\b|\\s|$)`, 'i');
              return wordRegex.test(rParent) || wordRegex.test(rLabel) || wordRegex.test(rVal);
            });
          });

          if (targetRadio && !filledInputs.has(targetRadio)) {
            targetRadio.checked = true;
            const checkedSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;
            if (checkedSetter) {
              checkedSetter.call(targetRadio, true);
            }
            targetRadio.dispatchEvent(new Event('click', { bubbles: true }));
            targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
            targetRadio.dispatchEvent(new Event('input', { bubbles: true }));

            // Clean feedback: subtle brief flash, no permanent outline
            targetRadio.style.outline = '2px solid #10b981';
            targetRadio.style.outlineOffset = '2px';
            setTimeout(() => {
              try {
                targetRadio.style.outline = '';
                targetRadio.style.outlineOffset = '';
              } catch (e) {}
            }, 1000);

            filledInputs.add(targetRadio);
            safeDefaultsCount++;
            fillCount++;
            break;
          }
        }
      }
    });

    // B. Select dropdowns auto-answering (e.g. Marital Status, Nationality, Debarred)
    const selectElements = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
    selectElements.forEach((sel) => {
      if (filledInputs.has(sel)) return;
      if (sel.selectedIndex > 0 && sel.value && !/select|choose|--/i.test(sel.value)) return;

      let contextText = `${sel.name || ''} ${sel.id || ''} `;
      let curr: HTMLElement | null = sel.parentElement;
      for (let depth = 0; depth < 5 && curr && curr !== document.body; depth++) {
        const labels = Array.from(curr.querySelectorAll('label, legend, th, .gov-label, .form-label'));
        for (const l of labels) {
          contextText += ((l as HTMLElement).innerText || '') + ' ';
        }
        if (curr.classList.contains('gov-form-group') || curr.classList.contains('form-group') || curr.tagName === 'TR') {
          contextText += (curr.innerText || '') + ' ';
          break;
        }
        curr = curr.parentElement;
      }
      contextText = contextText.replace(/\s+/g, ' ');

      for (const rule of declarationRules) {
        if (rule.pattern.test(contextText)) {
          const options = Array.from(sel.options);
          const matchedOpt = options.find((opt) => {
            const optTxt = (opt.text || '').toLowerCase();
            const optVal = (opt.value || '').toLowerCase();
            return rule.aliases.some((alias) => optTxt.includes(alias.toLowerCase()) || optVal.includes(alias.toLowerCase()));
          });

          if (matchedOpt) {
            sel.value = matchedOpt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));

            // Subtle temporary flash
            sel.style.outline = '2px solid #10b981';
            sel.style.outlineOffset = '1px';
            setTimeout(() => {
              try {
                sel.style.outline = '';
                sel.style.outlineOffset = '';
              } catch (e) {}
            }, 1000);

            filledInputs.add(sel);
            safeDefaultsCount++;
            fillCount++;
            break;
          }
        }
      }
    });

    // C. Identification mark text input auto-answering
    const textInputs = Array.from(document.querySelectorAll('input[type="text"], textarea')) as (HTMLInputElement | HTMLTextAreaElement)[];
    textInputs.forEach((inp) => {
      if (filledInputs.has(inp) || (inp.value && inp.value.trim().length > 0)) return;

      let contextText = `${inp.name || ''} ${inp.id || ''} ${inp.placeholder || ''} `;
      let curr: HTMLElement | null = inp.parentElement;
      for (let depth = 0; depth < 4 && curr && curr !== document.body; depth++) {
        const labels = Array.from(curr.querySelectorAll('label, legend, th, .gov-label, .form-label'));
        for (const l of labels) {
          contextText += ((l as HTMLElement).innerText || '') + ' ';
        }
        if (curr.classList.contains('gov-form-group') || curr.classList.contains('form-group') || curr.tagName === 'TR') {
          contextText += (curr.innerText || '') + ' ';
          break;
        }
        curr = curr.parentElement;
      }
      contextText = contextText.replace(/\s+/g, ' ');

      if (/identification\s*mark|identity\s*mark|पहचान\s*चिह्न/i.test(contextText)) {
        const markVal = profile.identification_mark || 'None';
        inp.value = markVal;
        inp.setAttribute('value', markVal);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));

        inp.style.outline = '2px solid #10b981';
        setTimeout(() => {
          try {
            inp.style.outline = '';
          } catch (e) {}
        }, 1000);

        filledInputs.add(inp);
        safeDefaultsCount++;
        fillCount++;
      }
    });
  }

  // Missing Mandatory Fields Scanner & Visual Amber Highlighter
  const missingMandatory: Array<{ label: string; id?: string; name?: string; type?: string }> = [];

  try {
    // 1. Clear any prior missing highlights
    document.querySelectorAll('[data-smartfill-missing]').forEach((el) => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
      (el as HTMLElement).style.boxShadow = '';
      el.removeAttribute('data-smartfill-missing');
    });

    const allInteractive = Array.from(
      document.querySelectorAll('input:not([type="hidden"]), select, textarea')
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    // Collect names of radio groups that have at least one checked option
    const checkedRadioNames = new Set<string>();
    document.querySelectorAll('input[type="radio"]:checked').forEach((r) => {
      const name = (r as HTMLInputElement).name;
      if (name) checkedRadioNames.add(name);
    });

    const processedRadioNames = new Set<string>();

    allInteractive.forEach((el) => {
      // Ignore buttons, submits, resets
      if (el.type === 'button' || el.type === 'submit' || el.type === 'reset') return;
      // Ignore hidden or disabled elements
      if (el.disabled) return;
      if (el.offsetParent === null && window.getComputedStyle(el).display === 'none') return;

      // Ignore fields filled during this run
      if (filledInputs.has(el)) return;

      // Radio handling: check group status
      if (el.type === 'radio') {
        const radioName = (el as HTMLInputElement).name;
        if (radioName) {
          if (checkedRadioNames.has(radioName)) return; // Radio group is already satisfied!
          if (processedRadioNames.has(radioName)) return; // Only process this group once
          processedRadioNames.add(radioName);
        } else if ((el as HTMLInputElement).checked) {
          return;
        }
      }

      // Checkbox handling: if checked, not missing
      if (el.type === 'checkbox' && (el as HTMLInputElement).checked) return;

      // Text / Number / Date / Email / Tel / Textarea: if has non-empty value, NOT missing!
      if (el.type !== 'radio' && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
        if (el.value && el.value.trim().length > 0) return;
      }

      // Select: if a valid non-placeholder option is selected, NOT missing!
      if (el.tagName === 'SELECT') {
        const selVal = el.value ? el.value.trim() : '';
        if (selVal.length > 0 && !/^(select|choose|--|$)/i.test(selVal) && (el as HTMLSelectElement).selectedIndex > 0) {
          return;
        }
      }

      // Check if mandatory via attribute or red asterisk
      let isMandatory = el.hasAttribute('required') || (el as any).required === true || el.getAttribute('aria-required') === 'true';

      let labelText = '';
      if (el.id) {
        const lbl = document.querySelector(`label[for="${el.id}"]`);
        if (lbl) {
          const lHtml = (lbl as HTMLElement).innerHTML || '';
          labelText = (lbl as HTMLElement).innerText || '';
          if (lHtml.includes('*') || lbl.className.includes('req') || lbl.className.includes('mandatory')) {
            isMandatory = true;
          }
        }
      }

      const container = el.closest('.gov-form-group, .form-group, .form-item, tr');
      if (container) {
        const cText = (container as HTMLElement).innerText || '';
        const cHtml = (container as HTMLElement).innerHTML || '';
        if (!labelText) {
          const foundLabel = container.querySelector('.gov-label, .form-label, label, th');
          if (foundLabel) {
            labelText = (foundLabel as HTMLElement).innerText || '';
          } else {
            labelText = cText.slice(0, 60);
          }
        }
        if (
          container.querySelector('.gov-req, .required, .mandatory, span[style*="red"], font[color="red"], [class*="asterisk"]') ||
          cHtml.includes('color="red"') ||
          cHtml.includes('color: red') ||
          cText.includes('*')
        ) {
          isMandatory = true;
        }
      }

      // ONLY highlight missing mandatory fields!
      if (isMandatory) {
        el.setAttribute('data-smartfill-missing', 'true');
        el.style.outline = '2px solid #eab308';
        el.style.outlineOffset = '2px';
        el.style.boxShadow = '0 0 8px rgba(234, 179, 8, 0.4)';

        // Clear highlight immediately when user interacts
        const clearHighlight = () => {
          el.style.outline = '';
          el.style.outlineOffset = '';
          el.style.boxShadow = '';
          el.removeAttribute('data-smartfill-missing');
        };
        el.addEventListener('input', clearHighlight, { once: true });
        el.addEventListener('change', clearHighlight, { once: true });

        const cleanLabel = labelText.replace(/[*:]/g, '').replace(/\([^)]*\)/g, '').trim() || (el as HTMLInputElement).placeholder || el.name || el.id || 'Required Field';

        missingMandatory.push({
          label: cleanLabel.slice(0, 60),
          id: el.id || undefined,
          name: el.name || undefined,
          type: el.type || el.tagName.toLowerCase()
        });
      }
    });
  } catch (e) {
    // Non-fatal if DOM query fails
  }

  return {
    fillCount,
    safeDefaultsCount,
    missingMandatory
  };
}

export interface UploadFileItem {
  id?: string;
  fileName: string;
  docType: string;
  dataUrl: string;
  sizeKb?: number;
}

export interface FileUploadResult {
  docType: string;
  fileName: string;
  inputSelector: string;
  sizeKb?: number;
  success: boolean;
  errorDetected?: string;
  detectedBounds?: { minKb?: number; maxKb?: number };
}

export interface FileUploadBatchReport {
  uploadedCount: number;
  results: FileUploadResult[];
}

/**
 * Universal File Uploader Engine:
 * Executed in target web page context via chrome.scripting.executeScript.
 * - Injects optimized files into <input type="file"> using the HTML5 DataTransfer API.
 * - Bypasses framework locks and triggers native change/input events.
 * - Features self-healing interceptor: catches window.alert & DOM error warnings
 *   (e.g. "Size must be between 10KB and 20KB") to report back exact bounds.
 */
export function universalFileUploader(
  fileRules: any[] = [],
  filesPayload: UploadFileItem[] = []
): FileUploadBatchReport {
  let uploadedCount = 0;
  const results: FileUploadResult[] = [];
  const assignedInputs = new Set<Element>();

  // Self-contained base64 DataURL to File object converter
  function dataUrlToFile(dataUrl: string, fileName: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1] || arr[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  // Self-contained parser for portal size error messages
  function parseSizeConstraints(text: string): { minKb?: number; maxKb?: number } | null {
    if (!text) return null;
    const rangeMatch = text.match(/(?:between|from)?\s*(\d+)\s*(?:kb|k)?\s*(?:to|-|and)\s*(\d+)\s*(?:kb|k)/i);
    if (rangeMatch) {
      const minKb = parseInt(rangeMatch[1], 10);
      const maxKb = parseInt(rangeMatch[2], 10);
      if (!isNaN(minKb) && !isNaN(maxKb) && minKb < maxKb) {
        return { minKb, maxKb };
      }
    }
    const maxMatch = text.match(/(?:max|maximum|exceed|less than|up to|below)\s*(?:of|size)?\s*(\d+)\s*(?:kb|k)/i);
    if (maxMatch) {
      const maxKb = parseInt(maxMatch[1], 10);
      if (!isNaN(maxKb) && maxKb > 0) {
        return { minKb: Math.max(5, Math.round(maxKb * 0.4)), maxKb };
      }
    }
    return null;
  }

  if (!filesPayload || filesPayload.length === 0) {
    return { uploadedCount: 0, results: [] };
  }

  const originalAlert = window.alert;
  let interceptedAlertText: string | null = null;
  try {
    window.alert = function (msg: any) {
      interceptedAlertText = String(msg);
      console.log('[smartFill File Uploader] Intercepted page alert:', msg);
    };
  } catch (e) {}

  try {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];

    if (fileInputs.length === 0) {
      return { uploadedCount: 0, results: [] };
    }

    fileInputs.forEach((input) => {
      if (assignedInputs.has(input)) return;

      const id = input.id || '';
      const name = input.name || '';
      const accept = input.accept || '';
      const title = input.title || '';
      let labelText = '';
      if (id) {
        const lbl = document.querySelector(`label[for="${id}"]`);
        if (lbl) labelText = (lbl as HTMLElement).innerText || '';
      }
      const container = input.closest('tr, td, .form-group, .form-item, div, p');
      let parentText = '';
      if (container) {
        parentText = ((container as HTMLElement).innerText || '').replace(/\s+/g, ' ');
      }
      const contextStr = `${id} ${name} ${accept} ${title} ${labelText} ${parentText}`.toLowerCase();

      // Rule selector match (if recipe provided specific selector)
      let matchedRule = (fileRules || []).find((r) => {
        try {
          return r.selector && (input.matches(r.selector) || input.id === r.selector.replace('#', ''));
        } catch (e) {
          return false;
        }
      });

      // Target document classification
      let targetType = matchedRule?.docType || '';
      if (!targetType) {
        if (/photo|photograph|pic|avatar|image|passport_photo|तस्वीर|फोटो/i.test(contextStr)) {
          targetType = 'photo';
        } else if (/sign|signature|hastakshar|हस्ताक्षर|दस्तखत/i.test(contextStr)) {
          targetType = 'signature';
        } else if (/aadhaar|aadhar|uid/i.test(contextStr)) {
          targetType = 'aadhaar';
        } else if (/pan|pancard/i.test(contextStr)) {
          targetType = 'pan';
        } else if (/10th|matric|highschool|ssc/i.test(contextStr)) {
          targetType = 'marksheet_10';
        } else if (/12th|inter|intermediate|hsc/i.test(contextStr)) {
          targetType = 'marksheet_12';
        } else if (/degree|graduation|diploma|btech|bsc|bcom|ba/i.test(contextStr)) {
          targetType = 'degree';
        } else if (/doc|document|certificate|marksheet|प्रमाण पत्र|अंक पत्र/i.test(contextStr)) {
          targetType = 'other_document';
        }
      }

      // Find matching file from payload
      const matchedPayload = filesPayload.find((f) => {
        const fType = (f.docType || '').toLowerCase();
        const fName = (f.fileName || '').toLowerCase();

        if (targetType === 'photo') {
          return fType.includes('photo') || fName.includes('photo') || fName.includes('pic') || fName.includes('passport');
        }
        if (targetType === 'signature') {
          return fType.includes('sign') || fName.includes('sign') || fName.includes('hastakshar');
        }
        if (targetType === 'aadhaar') {
          return fType.includes('aadhaar') || fName.includes('aadhaar') || fName.includes('aadhar');
        }
        if (targetType === 'pan') {
          return fType.includes('pan') || fName.includes('pan');
        }
        if (targetType === 'marksheet_10') {
          return fType.includes('10th') || fName.includes('10th') || fName.includes('matric');
        }
        if (targetType === 'marksheet_12') {
          return fType.includes('12th') || fName.includes('12th') || fName.includes('inter');
        }
        if (targetType === 'degree') {
          return fType.includes('degree') || fName.includes('degree') || fName.includes('grad');
        }
        if (targetType === 'other_document') {
          return !fType.includes('photo') && !fType.includes('sign');
        }
        return false;
      }) || (fileInputs.length === 1 && filesPayload.length === 1 ? filesPayload[0] : null);

      if (!matchedPayload || !matchedPayload.dataUrl) return;

      assignedInputs.add(input);

      try {
        interceptedAlertText = null;
        const fileObj = dataUrlToFile(matchedPayload.dataUrl, matchedPayload.fileName);
        const dt = new DataTransfer();
        dt.items.add(fileObj);
        input.files = dt.files;

        // Temporary visual feedback pulse
        input.style.outline = '2px solid #10b981';
        input.style.outlineOffset = '1px';
        setTimeout(() => {
          try {
            input.style.outline = '';
            input.style.outlineOffset = '';
          } catch (e) {}
        }, 1000);
        input.focus();

        // Dispatch input and change events
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        uploadedCount++;

        // Inspect for client-side JavaScript rejection alerts or DOM errors
        let errorText = interceptedAlertText || '';
        if (!errorText && container) {
          const errorNodes = container.querySelectorAll(
            '.error, .alert, .text-danger, .invalid-feedback, span[style*="red"], div[style*="red"], p[style*="red"]'
          );
          for (const node of Array.from(errorNodes)) {
            const txt = (node as HTMLElement).innerText || '';
            if (/kb|mb|size|dimension|pixel|width|height|between|exceed|allowed/i.test(txt)) {
              errorText = txt;
              break;
            }
          }
        }

        const bounds = errorText ? parseSizeConstraints(errorText) : null;

        results.push({
          docType: matchedPayload.docType,
          fileName: matchedPayload.fileName,
          inputSelector: input.id ? `#${input.id}` : input.name ? `input[name="${input.name}"]` : 'input[type="file"]',
          sizeKb: matchedPayload.sizeKb,
          success: !errorText,
          errorDetected: errorText || undefined,
          detectedBounds: bounds || undefined,
        });
      } catch (err: any) {
        results.push({
          docType: matchedPayload.docType,
          fileName: matchedPayload.fileName,
          inputSelector: input.id ? `#${input.id}` : 'input[type="file"]',
          sizeKb: matchedPayload.sizeKb,
          success: false,
          errorDetected: err?.message || 'Failed to inject file via DataTransfer',
        });
      }
    });
  } finally {
    try {
      window.alert = originalAlert;
    } catch (e) {}
  }

  return {
    uploadedCount,
    results,
  };
}

// Global window listener for background/popup message events
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'AUTOFILL_FORM') {
      universalEngineFiller(activeExamRecipe, event.data.payload || {});
    } else if (event.data && event.data.action === 'AUTOFILL_FILES') {
      universalFileUploader(event.data.fileRules || [], event.data.filesPayload || []);
    }
  });
}


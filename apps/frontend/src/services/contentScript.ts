export interface RecipeMapping {
  match_label: string;
  profile_key: string;
}

export const activeExamRecipe: RecipeMapping[] = [
  { match_label: "Applicant Name (English)", profile_key: "full_name" },
  { match_label: "आवेदक का नाम", profile_key: "full_name" },
  { match_label: "Full Name", profile_key: "full_name" },
  { match_label: "Name", profile_key: "full_name" },
  { match_label: "Father's Name", profile_key: "father_name" },
  { match_label: "पिता का नाम", profile_key: "father_name" },
  { match_label: "Mother's Name", profile_key: "mother_name" },
  { match_label: "माता का नाम", profile_key: "mother_name" },
  { match_label: "Aadhaar", profile_key: "aadhaar_no" },
  { match_label: "आधार संख्या", profile_key: "aadhaar_no" },
  { match_label: "Permanent Address", profile_key: "address" },
  { match_label: "Address", profile_key: "address" },
  { match_label: "City", profile_key: "city" },
  { match_label: "शहर", profile_key: "city" },
  { match_label: "Town", profile_key: "town" }
];

/**
 * Universal Engine Filler Function:
 * Executed in target web page context via chrome.scripting.executeScript.
 * Locates label proximity elements (English & Hindi) and populates values with
 * native HTML prototype setter bypass to ensure compatibility with React/Angular/Vue forms.
 */
export function universalEngineFiller(recipe: RecipeMapping[], profile: Record<string, any>) {
  recipe.forEach((field) => {
    const targetText = field.match_label;
    const valueToFill = profile[field.profile_key];

    if (!valueToFill) return;

    const DOMelements = Array.from(document.querySelectorAll('label, td, span, th, p'));
    const anchor = DOMelements.find((el) => (el as HTMLElement).innerText?.trim().includes(targetText));

    if (!anchor) return;
    const container = anchor.closest('div, tr, td') || anchor.parentElement;
    if (!container) return;

    const inputElement = container.querySelector(
      'input[type="text"], input:not([type="hidden"]), textarea'
    ) as HTMLInputElement | HTMLTextAreaElement | null;

    if (inputElement) {
      inputElement.style.border = '2px solid #28a745';
      inputElement.focus();

      // Native prototype descriptor setters to bypass framework state locks (React/Vue/Angular)
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
    }
  });
}

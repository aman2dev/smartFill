I am making an extension in which users can fillup exams from their documents that are stored in their browser locally. They will first upload a document for a specific exam and the extension will save that document in their browser locally. Then when they want to fillup the exam form for that exam they will just click on the extension and it will automatically fillup the form with the data from their document. user can upload there addhar card or marksheet then it will go to ai where ai extract
the information from it and fillup the form. the document can be in pdf, jpeg, or png format. also ai should be able to understand the context of the form and fillup the form accordingly. and it should be able to understand the context of the document and fillup the form accordingly. and should be able to handle the errors and exceptions and should be able to handle the errors.

1. User Interface (UI)
a. The extension should have a user interface that allows users to upload documents and fillup exam forms.
b. The user interface should be user-friendly and easy to navigate.
2. Document Management
a. The extension should allow users to upload documents and save them locally in their browser.
b. The extension should allow users to view their uploaded documents.
c. The extension should allow users to delete their uploaded documents.
3. Exam Form Filling
a. The extension should allow users to fillup exam forms with data from their uploaded documents.
b. The extension should allow users to select the exam form they want to fillup.
c. The extension should allow users to select the document they want to use to fillup the exam form.
4. AI Integration
a. The extension should use AI to extract information from uploaded documents.
b. The extension should use AI to understand the context of the exam form.
c. The extension should use AI to fillup the exam form with data from the uploaded document.
5. Error Handling
a. The extension should handle errors gracefully and provide meaningful error messages to users.
b. The extension should handle exceptions and provide meaningful error messages to users.
c. The extension should handle errors and exceptions and provide meaningful error messages to users.
6. Security
a. The extension should use secure methods to store user data.
b. The extension should use secure methods to transfer user data.
c. The extension should use secure methods to process user data.

# for now make a frontend of that and also using mock backend.  and use the most modern tech stack available out there. make it look good also and i have created monorepo for frontend and backend. frist create a frontend and i will tell you later how to connect it to backend. and then we will work on backend and then ai integration. for now add manullally in the form when user can type the name and age and emaail,addreased etc.

# you can get refrence wiht this 
// Convert file upload into base64 string for local storage persistence
let base64PhotoStr = "";

document.getElementById('photo_input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    base64PhotoStr = event.target.result;
    const preview = document.getElementById('photo_preview');
    preview.src = base64PhotoStr;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// Load existing profile details on open
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['studentProfile'], (res) => {
    if (res.studentProfile) {
      const data = res.studentProfile;
      document.getElementById('full_name').value = data.full_name || '';
      document.getElementById('father_name').value = data.father_name || '';
      document.getElementById('mother_name').value = data.mother_name || '';
      document.getElementById('aadhaar_no').value = data.aadhaar_no || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('city').value = data.city || '';
      document.getElementById('town').value = data.town || '';
      
      if (data.photo_base64) {
        base64PhotoStr = data.photo_base64;
        const preview = document.getElementById('photo_preview');
        preview.src = base64PhotoStr;
        preview.style.display = 'block';
      }
    }
  });
});

// Save all fields to local chrome storage loop
document.getElementById('saveBtn').addEventListener('click', () => {
  const profileData = {
    full_name: document.getElementById('full_name').value,
    father_name: document.getElementById('father_name').value,
    mother_name: document.getElementById('mother_name').value,
    aadhaar_no: document.getElementById('aadhaar_no').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    town: document.getElementById('town').value,
    photo_base64: base64PhotoStr
  };

  chrome.storage.local.set({ studentProfile: profileData }, () => {
    const status = document.getElementById('status');
    status.style.display = 'block';
    setTimeout(() => { status.style.display = 'none'; }, 3000);
  });
});


// Check local configuration states on loading UI window
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['studentProfile'], (res) => {
    if (res.studentProfile && res.studentProfile.full_name) {
      document.getElementById('profileStatus').innerText = "Ready";
      document.getElementById('profileStatus').style.color = "green";
      document.getElementById('studentNameText').innerText = `User: ${res.studentProfile.full_name}`;
      document.getElementById('fillBtn').disabled = false; // Unlock operation mode
    }
  });
});

// Route users to full screen management panel
document.getElementById('openOptionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Launch injection mapping engine execution loop
document.getElementById('fillBtn').addEventListener('click', async () => {
  chrome.storage.local.get(['studentProfile'], async (res) => {
    if (!res.studentProfile) return;

    // The Master Recipe Dictionary mapped to our visual proximity strings
    const activeExamRecipe = [
      { match_label: "Applicant Name (English)", profile_key: "full_name" },
      { match_label: "आवेदक का नाम", profile_key: "full_name" },
      { match_label: "Father's Name", profile_key: "father_name" },
      { match_label: "पिता का नाम", profile_key: "father_name" },
      { match_label: "Mother's Name", profile_key: "mother_name" },
      { match_label: "माता का नाम", profile_key: "mother_name" },
      { match_label: "Aadhaar", profile_key: "aadhaar_no" },
      { match_label: "आधार संख्या", profile_key: "aadhaar_no" },
      { match_label: "Permanent Address", profile_key: "address" },
      { match_label: "City", profile_key: "city" },
      { match_label: "शहर", profile_key: "city" },
      { match_label: "Town", profile_key: "town" }
    ];

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: universalEngineFiller,
      args: [activeExamRecipe, res.studentProfile]
    });
  });
});

// Core Page Context Injection Routine Loop
function universalEngineFiller(recipe, profile) {
  recipe.forEach(field => {
    const targetText = field.match_label;
    const valueToFill = profile[field.profile_key];

    if (!valueToFill) return;

    const DOMelements = Array.from(document.querySelectorAll('label, td, span, th, p'));
    const anchor = DOMelements.find(el => el.innerText.trim().includes(targetText));
    
    if (!anchor) return;
    const container = anchor.closest('div, tr, td') || anchor.parentElement;
    const inputElement = container.querySelector('input[type="text"], input:not([type="hidden"]), textarea');

    if (inputElement) {
      inputElement.style.border = "2px solid #28a745";
      inputElement.focus();

      // Deploy proven deep framework bypass layer to break frontend state locks
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      const txSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      
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

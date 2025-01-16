(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;
      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      
      // Show loading
      thisForm.querySelector('.loading').classList.add('d-block');
      // Hide error and success messages
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              });
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!');
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',  // Specify that we're expecting JSON
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();  // Expect JSON response
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.ok) {
        // If submission was successful (Formspree returns {"ok": true})
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data.error || 'Form submission failed.');
      }
    })
    .catch((error) => {
      displayError(thisForm, error.message || error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').textContent = error; // Set error message
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
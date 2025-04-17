---
title: "Contact Us"
---

Have a question or sponsorship inquiry? Contact us using the form below:

We welcome questions about bonsai care, as well as inquiries about potential sponsorships or collaborations.

<form>
  <label for="name">Name:</label><br>
  <input type="text" id="name" name="name"><br><br>
  <label for="email">Email:</label><br>
  <input type="email" id="email" name="email"><br><br>
  <label for="message">Message:</label><br>
  <textarea id="message" name="message" rows="4" cols="50"></textarea><br><br>
  <input type="submit" value="Submit">
</form>
<script>
  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    if (!form.name.value || !form.email.value || !form.message.value) {
      alert('Please fill in all required fields.');
      event.preventDefault();
    }
    if (!isValidEmail(form.email.value)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
    }
  });

  function isValidEmail(email) {
    const emailRegex = /^[\s@]+@[\s@]+\.[\s@]+$/;
    return emailRegex.test(email);
  }
</script>
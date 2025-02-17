document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      for (let i = 0; i < emails.length; i++) {
        let mail = emails[i];
        console.log(mail)
        const element = document.createElement('div');
        element.id="dddiv";
        element.style.height="80px";
        element.style.margin="10px";
        element.style.borderRadius="5px";
        element.style.width="100%";
        let archive = mail.archived;
        let read = mail.read;
        if( mailbox =='sent'){
          element.innerHTML = `<p id="to">To: ${mail.recipients}</p>
          <p id="time">${mail.timestamp}</p>
            <h5 id="subject">${mail.subject}</h5>`;
        }
        else{
          if (archive){
            element.innerHTML = `<p id="to">To: ${mail.recipients}</p>
            <p id="time">${mail.timestamp}</p>
              <h5 id="subject">${mail.subject}</h5>
            <input type="submit" value="Remove from archive" id="take-email" class="btn btn-primary" onclick="take_email(${mail.id})"/>`;
          }
          else {
            element.innerHTML = `<p id="to">To: ${mail.recipients}</p>
            <p id="time">${mail.timestamp}</p>
              <h5 id="subject">${mail.subject}</h5>
            <input type="submit" value="Archive" id="archive-email" class="btn btn-primary" onclick="archive_email(${mail.id})"/>`;
          }
        }
        if (read){
          element.style.backgroundColor = "rgb(221, 225, 232)";
          element.style.border = "none";
        }
        if (!read){
          element.style.backgroundColor = "rgb(255, 255, 255)";
          element.style.border="1px solid gray";
        }
        document.querySelector('#emails-view').append(element);


        element.addEventListener('mouseover', function(){
          element.style.boxShadow = "5px 5px 5px grey";

        })
        element.addEventListener('mouseleave',function(){
          element.style.boxShadow = "none";
        })
        element.addEventListener('click', function(e) {
          console.log(e.target)
          if (e.target.id === 'dddiv') {
            const id = mail.id;
            console.log('This element has been clicked!')
            load_mail(id);
          }
          else{

          }
        }); 

      }

      })
  
}


function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(function(response){
    console.log(response);
    load_mailbox('inbox')
  })
}

function take_email(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(function(response){
    console.log(response);
    load_mailbox('archive');
  })
}


function load_mail(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    document.querySelector('#email-subject').innerText = `Subject:  ${email.subject}`;
    document.querySelector('#email-body').innerText = email.body;
    document.querySelector('#email-time').innerText = `Timestamp:  ${email.timestamp}`;
    document.querySelector('#email-from').innerText = `From:  ${email.sender}`;
    document.querySelector('#email-receiver').innerText = `To:  ${email.recipients}`;

  })
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })

  })
  const reply = document.querySelector('#reply-email');
  reply.addEventListener('click',
    () => {
      fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
      reply_email(email.sender,email.subject,email.body,email.timestamp);
})
})

}




function reply_email(sender,subject,body,timestamp) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  let result = subject.includes("RE:");
  if (result == true){
    document.querySelector('#compose-subject').value = subject;
  }
  else{
    document.querySelector('#compose-subject').value = "RE: " + subject;
  }
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body}`;
}





function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  
    
    
  }

  function send_email(event){
    event.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
          read: false
      })
    })
    .then(response => response.json())
    .then(result => {
      let tmp = JSON.stringify(result);
      if(tmp.includes('error')){
        console.log(result);
        alert(JSON.stringify(result));
      }
      else{
        console.log(result);
        load_mailbox('sent');
      }
        
    });
  
  }
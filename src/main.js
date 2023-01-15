const { invoke } = window.__TAURI__.tauri;

let master_pw;
let lock_status = true;

// async function greet() {
//   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//   greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
// }

window.addEventListener("DOMContentLoaded", () => {
	document.getElementById("lockImg").addEventListener("click",toggleLock);
	startup();
});

async function startup() {
	
	document.querySelector("#createEntry_actions > button").addEventListener("click",createEntry);

	let entries = await invoke("get_entries");

	for(let i = 0; i < entries.length; i++) {
		buildEntry(entries[i]);
	}

	for (let input of document.querySelectorAll('input[readonly]')) {
			input.addEventListener('click', async function() {
				if(!input.hasAttribute("readonly"))return
				if(input.getAttribute("type")!="text" && lock_status)return

				let to_copy = input.value

				if(!lock_status) {
					let isUsername = input.parentElement.classList.contains("entry_user")
					let entry_name = input.parentElement.id.slice(0,input.parentElement.id.length-5)
					console.log(entry_name,input.parentElement.id)

					let info = await invoke("get_entry",{
						name: entry_name,
						mpw: await get_pw()
					})

					if(isUsername) {
						to_copy = info[0]
					} else {
						if(input.parentElement.classList.contains("entry_name")) {
							to_copy = entry_name
						} else {
							to_copy = info[1]
						}
					}
				}

				navigator.clipboard.writeText(to_copy).then(function() {
					let originalColor = input.style.borderColor;
					input.style.borderColor = "lightgreen";
					setTimeout(function(){
						input.style.borderColor = originalColor;
					},250)
					
					console.log('Text copied to clipboard');
				}, function(err) {

					let originalColor = input.style.borderColor;
					input.style.borderColor = "red";
					setTimeout(function(){
						input.style.borderColor = originalColor;
					},500)

					console.error('Failed to copy text: ', err);
				});
			});
			
	}
}

let entry_priority = 1

function buildEntry(entry) {

	entry_priority++;
	
	let nameDiv = document.createElement("div");
	nameDiv.setAttribute("class", "entry_name");
	nameDiv.setAttribute("id",`${entry.replaceAll(" ","-")}_name`)
	
	let nameInput = document.createElement("input");
	nameInput.setAttribute("type", "text");
	nameInput.setAttribute("placeholder", "New Entry Name");
	nameInput.setAttribute("value", entry);
	nameInput.setAttribute("readonly", true);
	nameInput.setAttribute("unselectable", "on")
	nameInput.setAttribute("tabindex",entry_priority)
	nameDiv.appendChild(nameInput);
	
	let userDiv = document.createElement("div");
	userDiv.setAttribute("class", "entry_user");
	userDiv.setAttribute("id",`${entry.replaceAll(" ","-")}_user`)
	
	let userInput = document.createElement("input");
	userInput.setAttribute("type", "password");
	userInput.setAttribute("placeholder", "New Username");
	userInput.setAttribute("value", "PLACEHOLDER");
	userInput.setAttribute("readonly", true);
	userInput.setAttribute("unselectable", "on")
	userInput.setAttribute("tabindex",entry_priority)
	userDiv.appendChild(userInput);
	
	let passDiv = document.createElement("div");
	passDiv.setAttribute("class", "entry_pass");
	passDiv.setAttribute("id",`${entry.replaceAll(" ","-")}_pass`)
	
	let passInput = document.createElement("input");
	passInput.setAttribute("type", "password");
	passInput.setAttribute("placeholder", "New Password");
	passInput.setAttribute("value", "PLACEHOLDER!");
	passInput.setAttribute("readonly", true);
	passInput.setAttribute("unselectable", "on")
	userInput.setAttribute("tabindex",entry_priority)
	passDiv.appendChild(passInput);
	
	let showButton = document.createElement("button");
	showButton.innerText = "Show";
	showButton.addEventListener("click",showEntry.bind(showButton, entry),false);
	showButton.setAttribute("class", "showbutton");
	showButton.setAttribute("tabindex",entry_priority)

	let editButton = document.createElement("button");
	editButton.innerText = "Edit";
	editButton.addEventListener("click", editEntry.bind(editButton, entry), false);
	editButton.setAttribute("class", "editbutton");
	editButton.setAttribute("tabindex",entry_priority)

	let actionDiv = document.createElement("div")
	actionDiv.appendChild(showButton)
	actionDiv.appendChild(editButton)
	actionDiv.setAttribute("id",`${entry.replaceAll(" ","-")}_actions`)
	
	document.getElementById("table_entries").appendChild(nameDiv)
	document.getElementById("table_users").appendChild(userDiv)
	document.getElementById("table_pwds").appendChild(passDiv)
	document.getElementById("table_actions").appendChild(actionDiv)
		
}

async function editEntry(entry) {
	let entry_user = document.querySelector(`#${entry.replaceAll(" ","-")}_user > input`);
	let entry_pass = document.querySelector(`#${entry.replaceAll(" ","-")}_pass > input`);
	let entry_name = document.querySelector(`#${entry.replaceAll(" ","-")}_name > input`);
  let show_button = document.querySelector(`#${entry.replaceAll(" ","-")}_actions > .showbutton`);
	if(this.innerText == "Edit") {

		let info = await invoke("get_entry",{
			name: entry_name.value,
			mpw: await get_pw()
		})

		entry_user.value = info[0];
		entry_pass.value = info[1];
		
		entry_user.removeAttribute("readonly");
		entry_user.setAttribute("unselectable", "off")
    	entry_user.type = "text";
		entry_pass.removeAttribute("readonly");
		entry_pass.setAttribute("unselectable", "off")
    	entry_pass.type = "text";
		entry_name.removeAttribute("readonly");
		entry_name.setAttribute("unselectable", "off")
    	show_button.disabled = true;
		this.innerText = "Save";

		this.Name = entry_name.value
	 } else {

		//To Delete: this.Name

		let isDeleted = await invoke("remove_entry", {name: this.Name})
		if(!isDeleted) {
			alert("Could not edit entry!")
			return;
		}

		let success = await invoke("create_entry", {name: entry_name.value, username: entry_user.value, pw: entry_pass.value, mpw: await get_pw()});
		if(!success) {
			alert("Could not edit entry!")
			return;
		}
	
		
		entry_user.setAttribute("readonly", true);
		entry_user.setAttribute("unselectable", "off")
    	entry_user.type = "password"
    	entry_user.value = "PLACEHOLDER"
		entry_pass.setAttribute("readonly", true);
		entry_pass.setAttribute("unselectable", "off")
    	entry_pass.type = "password"
    	entry_pass.value = "PLACEHOLDER!"
		entry_name.setAttribute("readonly", true);
		entry_name.setAttribute("unselectable", "off")
    	show_button.disabled = false;
		this.innerText = "Edit";
	 }
}

async function ask_pw() {
	return await password_prompt("Enter your master password to proceed");
}

async function get_pw() {
	let mpw = master_pw;

	if(lock_status){
		mpw = await ask_pw();
	}

	return mpw;
}

async function showEntry(entry_name) {
	let entry_user = document.querySelector(`#${entry_name.replaceAll(" ","-")}_user > input`);
	let entry_pass = document.querySelector(`#${entry_name.replaceAll(" ","-")}_pass > input`);

	if(this.innerText == "Show"){
		let info = await invoke("get_entry",{
			name: entry_name,
			mpw: await get_pw()
		})
		entry_user.value = info[0];
		entry_pass.value = info[1];
		entry_user.type = "text";
		entry_pass.type = "text";
		this.innerText = "Hide";
	} else {
		entry_user.value = "PLACEHOLDER";
		entry_pass.value = "PLACEHOLDER!";
		entry_user.type = "password";
		entry_pass.type = "password";
		this.innerText = "Show";
	}
}



async function createEntry() {
	let entryNameField = document.querySelector("#createEntry_name > input");
	let entryUserField = document.querySelector("#createEntry_user > input");
	let entryPassField = document.querySelector("#createEntry_pass > input");

	if(entryNameField.value == "" || entryUserField.value == "") {
		alert("Not all needed fields filled out!");
		return;
	}

	if(entryPassField.value == "") {
		if(!(confirm("No password provided, do you want to generate a secure password?"))) {
			alert("Cant create entry without password!");
			return;
		}
		entryPassField.value = await invoke("random_password");
	}

	let mpw = await get_pw()

	let success = await invoke("create_entry", {name: entryNameField.value, username: entryUserField.value, pw: entryPassField.value, mpw: mpw});

	if(success) {
		alert("Successfully created entry!");
		buildEntry(entryNameField.value)
		entryNameField.value = ""
		entryUserField.value = ""
		entryPassField.value = ""
	} else {
		alert("A critical error occured during entry creation");
	}
	
}

async function toggleLock() {
	let txt = (lock_status && "Unlocked") || "Locked";
	let src = (lock_status && "/images/security_lock_unlocked.png") || "/images/security_lock_locked.png";

	if(lock_status){
		master_pw = await ask_pw();
		console.log(master_pw)
		if(master_pw == "" || master_pw == null)return;
	}

	document.getElementById("lockLabel").innerText = txt;
	document.getElementById("lockImg").src = src;
	
	lock_status = !lock_status;
}
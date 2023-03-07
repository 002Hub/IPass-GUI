window.password_prompt = async function(label_message, submitbutton_message, cancelbutton_message) {
    return new Promise((res,rej) => {
        let width = 200,height = 100;
        if (typeof label_message !== "string") label_message = "Password:";
        if (typeof submitbutton_message !== "string") submitbutton_message = "Submit";
        if (typeof cancelbutton_message !== "string") cancelbutton_message = "Cancel";
    
        let submit = function() {
            document.body.removeChild(div);
            window.removeEventListener("resize", resize, false);
            res(input.value)
        };
        let cancel = function() {
            document.body.removeChild(div)
            window.removeEventListener("resize", resize, false)
            rej()
        }
        let resize = function() {
            div.style.left = ((window.innerWidth / 2) - (width / 2)) + "px";
            div.style.top = ((window.innerHeight / 2) - (height / 2)) + "px";
        };
    
        let div = document.createElement("div");
        div.id = "password_prompt";

    
        let label = document.createElement("label");
        label.id = "password_prompt_label";
        label.innerHTML = label_message;
        label.for = "password_prompt_input";
        div.appendChild(label);
    
        div.appendChild(document.createElement("br"));
    
        let input = document.createElement("input");
        input.id = "password_prompt_input";
        input.type = "password";
        input.addEventListener("keyup", function(event) {
            if (event.key == "Enter") submit();
        }, false);
        div.appendChild(input);
    
        div.appendChild(document.createElement("br"));

        let actionDiv = document.createElement("div")
    
        let submitbutton = document.createElement("button");
        submitbutton.innerHTML = submitbutton_message;
        submitbutton.style.display = "inline-block"
        submitbutton.addEventListener("click", submit, false);
        actionDiv.appendChild(submitbutton);

        let cancelbutton = document.createElement("button");
        cancelbutton.innerHTML = cancelbutton_message;
        cancelbutton.style.display = "inline-block"
        cancelbutton.addEventListener("click", cancel, false);
        actionDiv.appendChild(cancelbutton);

        div.appendChild(actionDiv)
    
        document.body.appendChild(div);
        window.addEventListener("resize", resize, false);
    })
};
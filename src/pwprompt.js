window.password_prompt = async function(label_message, button_message, arg3, arg4, arg5) {
    return new Promise((res,rej) => {
        let callback,width,height;
        if (typeof label_message !== "string") label_message = "Password:";
        if (typeof button_message !== "string") button_message = "Submit";
        if (typeof arg3 === "function") {
            callback = arg3;
        }
        else if (typeof arg3 === "number" && typeof arg4 === "number" && typeof arg5 === "function") {
            width = arg3;
            height = arg4;
            callback = arg5;
        }
        if (typeof width !== "number") width = 200;
        if (typeof height !== "number") height = 100;
        if (typeof callback !== "function") callback = function(){};
    
        let submit = function() {
            callback(input.value);
            document.body.removeChild(div);
            window.removeEventListener("resize", resize, false);
            res(input.value)
        };
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
    
        let button = document.createElement("button");
        button.innerHTML = button_message;
        button.addEventListener("click", submit, false);
        div.appendChild(button);
    
        document.body.appendChild(div);
        window.addEventListener("resize", resize, false);
    })
};
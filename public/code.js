(function () {
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });

        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    app.querySelector(".chat-screen #file-upload").addEventListener("click", function () {
        app.querySelector(".chat-screen #file-input").click();
    });

    app.querySelector(".chat-screen #file-input").addEventListener("change", function () {
        let file = this.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = function (event) {
            socket.emit("file", {
                username: uname,
                file: event.target.result,
                fileName: file.name
            });
            renderMessage("my", {
                username: uname,
                file: event.target.result,
                fileName: file.name
            });
        };
        reader.readAsDataURL(file);
    });

    socket.on("file", function (message) {
        renderMessage("other", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if (type === "my") {
            el.setAttribute("class", "message my-message");
        } else if (type === "other") {
            el.setAttribute("class", "message other-message");
        } else if (type === "update") {
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
            messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
            return;
        }

        if (message.text) {
            el.innerHTML = `
                <div>
                    <div class="name">${type === "my" ? "You" : message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if (message.file) {
            el.innerHTML = `
                <div>
                    <div class="name">${type === "my" ? "You" : message.username}</div>
                    <div class="text"><a href="${message.file}" target="_blank">${message.fileName}</a></div>
                    <div class="media">
                        <img src="${message.file}" alt="${message.fileName}" style="max-width: 200px;"/>
                    </div>
                </div>
            `;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();

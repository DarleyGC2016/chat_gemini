const chatMessage = selectElemHtml(".messages");


const setRoomActive = (room_id) => {
  const url = `/${room_id}`;
  selectElemHtmlAll(".list-rooms li")
    .forEach(elem => elem.classList.remove("active"));

  selectElemHtml(`#room-${room_id}`)
    .classList
    .add("active");

  selectElemHtml("#selected-room").value = room_id

}

const getMessages = async (room_id) => {
  const url = `/${room_id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const html = await response.text();
    chatMessage.innerHTML = html
    setRoomActive(room_id)
  } catch (error) {
    console.error(error.message);
  }
}

const sendMessage = async (data) => {
  const url = `/${data.room_id}/send`;
  const request = new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-CSRFToken': data.csrfmiddlewaretoken
    },
    body: JSON.stringify(data),
  });

  const response = await fetch(request);

  const html = await response.text();
  const uniqueMessageContainer = selectElemHtml(".unique-message-container");
  uniqueMessageContainer.insertAdjacentHTML("beforeend", html);
  selectElemHtml(".send-message").reset();
}

const createRoom = async (data) => {
  console.log("create room data: ", data)
  const url = `/create-room`;
  const request = new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-CSRFToken': data.csrfmiddlewaretoken
    },
    body: JSON.stringify(data),
  });

  const response = await fetch(request);

  const html = await response.text();
  console.log('html: ',html);
  
  const listRooms = selectElemHtml(".list-rooms");
  listRooms.insertAdjacentHTML("afterbegin", html);
  const modal = bootstrap.Modal.getInstance(selectElemHtml(".modal"));
  getLastRoom();
  selectElemHtml(".create-room").reset();
  modal.hide();
}

selectElemHtml("form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event
      .target
    ).entries());
    sendMessage(data)
  })

selectElemHtml(".create-room")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event
      .target
    ).entries());
    createRoom(data)
  })

const getLastRoom = () => {
  selectElemHtml('.list-rooms li').click();
}

getLastRoom();